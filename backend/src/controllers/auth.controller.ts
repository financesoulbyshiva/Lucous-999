import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import env from "../config/env";
import { AuthenticatedRequest } from "../middleware/auth";
import { issueOtp, isDev } from "../services/otp.service";

export const VALID_ROLES = ["STUDENT", "PARENT", "TEACHER", "ADMIN"] as const;

export async function registerUser(
  req: Request,
  res: Response,
  forcedRole?: string | null
): Promise<void | Response> {
  try {
    const { name, email, password } = req.body;
    const role = forcedRole || req.body.role;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const normalizedRole = String(role).toUpperCase();
    if (!VALID_ROLES.includes(normalizedRole as any)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const userData: any = {
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: normalizedRole,
      isVerified: false,
    };

    if (req.body.phone) userData.phone = String(req.body.phone);
    if (req.body.grade) userData.grade = String(req.body.grade);
    if (req.body.board) userData.board = String(req.body.board);
    if (req.body.school) userData.school = String(req.body.school);
    if (req.body.subject) userData.subject = String(req.body.subject);

    const user = await prisma.user.create({ data: userData });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Failed to register" });
  }
}

export async function login(req: Request, res: Response): Promise<void | Response> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Failed to log in" });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        phone: true,
        grade: true,
        board: true,
        school: true,
        subject: true,
        avatarUrl: true,
        xp: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { name, phone, grade, board, school, subject, avatarUrl } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone ? String(phone) : null;
    if (grade !== undefined) data.grade = grade ? String(grade) : null;
    if (board !== undefined) data.board = board ? String(board) : null;
    if (school !== undefined) data.school = school ? String(school) : null;
    if (subject !== undefined) data.subject = subject ? String(subject) : null;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl ? String(avatarUrl) : null;

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        grade: true,
        board: true,
        school: true,
        subject: true,
        avatarUrl: true,
        xp: true,
      },
    });

    return res.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}

export function logout(req: Request, res: Response): Response {
  return res.json({ success: true, message: "Logged out" });
}

export async function sendOtp(req: Request, res: Response): Promise<void | Response> {
  try {
    const { email, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otpPurpose = purpose === "RESET" ? "RESET" : "VERIFY";
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    const code = await issueOtp(String(email).toLowerCase().trim(), otpPurpose, user ? user.id : null);

    return res.json({
      success: true,
      message: "OTP sent",
      ...(isDev() ? { otp: code } : {}),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void | Response> {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otp = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: String(code),
        purpose: "VERIFY",
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

    if (otp.userId) {
      await prisma.user.update({
        where: { id: otp.userId },
        data: { isVerified: true },
      });
    }

    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void | Response> {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });
    if (!user) {
      return res.json({
        success: true,
        message: "If that email is registered, a reset code was sent.",
      });
    }

    const code = await issueOtp(user.email, "RESET", user.id);

    return res.json({
      success: true,
      message: "If that email is registered, a reset code was sent.",
      ...(isDev() ? { otp: code } : {}),
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Failed to request reset" });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void | Response> {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, code and newPassword are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const otp = await prisma.otp.findFirst({
      where: {
        email: normalizedEmail,
        code: String(code),
        purpose: "RESET",
        verified: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(String(newPassword), 10);

    await prisma.user.update({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    await prisma.otp.update({ where: { id: otp.id }, data: { verified: true } });

    return res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset password" });
  }
}
