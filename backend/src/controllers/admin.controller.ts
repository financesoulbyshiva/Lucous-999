import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export const VALID_ROLES = ["STUDENT", "TEACHER", "PARENT", "ADMIN"] as const;

export async function getStats(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const [users, students, teachers, parents, admins, courses, enrollments, attempts, questions] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "TEACHER" } }),
        prisma.user.count({ where: { role: "PARENT" } }),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.course.count(),
        prisma.enrollment.count(),
        prisma.attempt.count(),
        prisma.question.count(),
      ]);
    res.json({
      success: true,
      stats: { users, students, teachers, parents, admins, courses, enrollments, attempts, questions },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
}

export async function getUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const where: Record<string, any> = {};
    const roleQuery = typeof req.query.role === "string" ? req.query.role : undefined;
    if (roleQuery && (VALID_ROLES as readonly string[]).includes(roleQuery)) {
      where.role = roleQuery;
    }
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        grade: true,
        board: true,
        school: true,
        subject: true,
        xp: true,
        createdAt: true,
      },
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
}

export async function getCourses(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("Admin courses error:", error);
    res.status(500).json({ success: false, message: "Failed to load courses" });
  }
}
