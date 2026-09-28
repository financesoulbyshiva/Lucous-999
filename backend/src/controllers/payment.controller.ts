import { Request, Response } from "express";
import prisma from "../config/prisma";
import env from "../config/env";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  razorpayConfigured,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../services/payment.service";

export async function getConfig(
  _req: Request,
  res: Response
): Promise<void | Response> {
  res.json({
    success: true,
    configured: razorpayConfigured(),
    keyId: env.RAZORPAY_KEY_ID || null,
  });
}

export async function createOrder(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }
    const course = await prisma.course.findUnique({ where: { id: String(courseId) } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (course.price <= 0) {
      return res.status(400).json({ success: false, message: "This course is free; enroll directly" });
    }
    if (!razorpayConfigured()) {
      return res.status(503).json({ success: false, message: "Payments are not configured" });
    }

    const receipt = `course_${course.id}_${Date.now()}`;
    const result = await createRazorpayOrder({
      amount: course.price,
      currency: course.currency || "INR",
      receipt,
      notes: { courseId: course.id, userId: req.userId || "" },
    });

    if (!result.ok || !result.order) {
      return res.status(502).json({ success: false, message: "Failed to create Razorpay order" });
    }
    const order = result.order;

    await prisma.payment.create({
      data: {
        userId: req.userId,
        courseId: course.id,
        amount: course.price,
        currency: course.currency || "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    });

    res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      course: { id: course.id, title: course.title },
    });
  } catch (error) {
    console.error("Payment order error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
}

export async function verifyPayment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { orderId, paymentId, signature } = req.body;
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: "orderId, paymentId and signature are required",
      });
    }
    if (!razorpayConfigured()) {
      return res.status(503).json({ success: false, message: "Payments are not configured" });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: String(orderId) },
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (payment.userId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Idempotent: a verified payment already granted access.
    if (payment.status === "PAID") {
      return res.json({ success: true, message: "Payment already verified", status: "PAID" });
    }

    if (!verifyPaymentSignature(orderId, paymentId, signature)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", razorpayPaymentId: paymentId, razorpaySignature: signature },
      });
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", razorpayPaymentId: paymentId, razorpaySignature: signature },
    });

    // Grant access only after successful verification.
    if (payment.courseId) {
      const course = await prisma.course.findUnique({ where: { id: payment.courseId } });
      await prisma.enrollment.upsert({
        where: {
          courseId_studentId: { courseId: payment.courseId, studentId: req.userId },
        },
        update: { status: "ENROLLED" },
        create: {
          courseId: payment.courseId,
          studentId: req.userId,
          teacherId: course ? course.teacherId : null,
          status: "ENROLLED",
        },
      });
    }

    res.json({ success: true, message: "Payment verified", status: "PAID" });
  } catch (error) {
    console.error("Payment verify error:", error);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
}

export async function handleWebhook(
  req: Request,
  res: Response
): Promise<void | Response> {
  try {
    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];
    if (!secret || !signature || !req.rawBody) {
      return res.status(400).json({ success: false, message: "Missing webhook signature" });
    }
    const signatureStr = Array.isArray(signature) ? signature[0] : signature;
    if (!verifyWebhookSignature(req.rawBody, signatureStr)) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.rawBody.toString("utf8"));
    const entity = event?.payload?.payment?.entity;
    if (entity?.order_id) {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: entity.order_id },
      });
      if (payment && payment.status !== "PAID") {
        const status = event.event === "payment.captured" ? "PAID" : "FAILED";
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status, razorpayPaymentId: entity.id || payment.razorpayPaymentId },
        });
      }
    }
    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ success: false, message: "Webhook processing failed" });
  }
}
