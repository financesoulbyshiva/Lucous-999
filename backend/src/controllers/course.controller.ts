import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export async function createCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { title, description, subject, board, price } = req.body;

    if (!title || !description || !subject || !board) {
      return res.status(400).json({
        success: false,
        message: "title, description, subject and board are required",
      });
    }

    const course = await prisma.course.create({
      data: {
        title: String(title),
        description: String(description),
        subject: String(subject),
        board: String(board),
        price: price !== undefined ? Math.max(0, Number(price) || 0) : 0,
        teacherId: req.userId!,
      },
    });

    return res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Course create error:", error);
    return res.status(500).json({ success: false, message: "Failed to create course" });
  }
}

export async function updateCourse(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    if (req.role !== "ADMIN" && course.teacherId !== req.userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const allowed = ["title", "description", "subject", "board", "price"];
    const data: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = key === "price" ? Math.max(0, Number(req.body[key]) || 0) : req.body[key];
      }
    }

    const updated = await prisma.course.update({ where: { id: course.id }, data });
    return res.json({ success: true, course: updated });
  } catch (error) {
    console.error("Course update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update course" });
  }
}

export async function listCourses(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    return res.json({ success: true, courses });
  } catch (error) {
    console.error("Courses list error:", error);
    return res.status(500).json({ success: false, message: "Failed to load courses" });
  }
}

export async function getCourseById(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { select: { id: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    return res.json({ success: true, course });
  } catch (error) {
    console.error("Course detail error:", error);
    return res.status(500).json({ success: false, message: "Failed to load course" });
  }
}

export async function createEnrollment(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const course = await prisma.course.findUnique({
      where: { id: String(courseId) },
    });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId: String(courseId), studentId: req.userId! },
      },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: "Already enrolled in this course" });
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        courseId: String(courseId),
        studentId: req.userId!,
        teacherId: course.teacherId,
        status: "ENROLLED",
      },
    });

    return res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment error:", error);
    return res.status(500).json({ success: false, message: "Failed to enroll" });
  }
}

export async function getMyEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: { teacher: { select: { id: true, name: true } } },
        },
      },
    });
    return res.json({ success: true, enrollments });
  } catch (error) {
    console.error("My enrollments error:", error);
    return res.status(500).json({ success: false, message: "Failed to load enrollments" });
  }
}
