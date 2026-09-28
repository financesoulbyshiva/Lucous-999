import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export const MATERIAL_STATUSES = ["UPLOADED", "PROCESSING", "ANALYZED", "READY", "FAILED"] as const;
export const CONTENT_STATUSES = ["DRAFT", "PENDING_REVIEW", "PUBLISHED"] as const;
export const CONTENT_SOURCES = ["TEACHER", "UPLOADED", "AI"] as const;

export async function getMaterials(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const materials = await prisma.uploadedMaterial.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        subject: { select: { name: true } },
        chapter: { select: { name: true } },
        topic: { select: { name: true } },
      },
    });
    return res.json({ success: true, materials });
  } catch (error) {
    console.error("Teacher materials error:", error);
    return res.status(500).json({ success: false, message: "Failed to load materials" });
  }
}

export async function createMaterial(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const {
      originalName,
      fileType,
      fileSize,
      boardId,
      gradeId,
      subjectId,
      chapterId,
      topicId,
      status,
    } = req.body;

    if (!originalName || !fileType || fileSize === undefined) {
      return res.status(400).json({
        success: false,
        message: "originalName, fileType and fileSize are required",
      });
    }

    const material = await prisma.uploadedMaterial.create({
      data: {
        teacherId: req.userId!,
        originalName: String(originalName),
        fileType: String(fileType),
        fileSize: Number(fileSize),
        boardId: boardId || null,
        gradeId: gradeId || null,
        subjectId: subjectId || null,
        chapterId: chapterId || null,
        topicId: topicId || null,
        status: MATERIAL_STATUSES.includes(status) ? status : "UPLOADED",
      },
    });

    return res.status(201).json({ success: true, material });
  } catch (error) {
    console.error("Teacher material create error:", error);
    return res.status(500).json({ success: false, message: "Failed to save material" });
  }
}

export async function getContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const where: any = { authorId: req.userId };
    if (req.query.status && CONTENT_STATUSES.includes(req.query.status as any)) {
      where.status = req.query.status;
    }
    const content = await prisma.learningContent.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        topic: {
          select: { name: true, chapter: { select: { name: true } } },
        },
      },
    });
    return res.json({ success: true, content });
  } catch (error) {
    console.error("Teacher content error:", error);
    return res.status(500).json({ success: false, message: "Failed to load content" });
  }
}

export async function createContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { topicId, title, body, source, status, order } = req.body;

    if (!topicId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "topicId, title and body are required",
      });
    }

    const topic = await prisma.topic.findUnique({
      where: { id: String(topicId) },
    });
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const content = await prisma.learningContent.create({
      data: {
        topicId: String(topicId),
        title: String(title),
        body: String(body),
        order: order !== undefined ? Number(order) : 0,
        source: CONTENT_SOURCES.includes(source) ? source : "TEACHER",
        status: CONTENT_STATUSES.includes(status) ? status : "DRAFT",
        authorId: req.userId,
      },
    });

    return res.status(201).json({ success: true, content });
  } catch (error) {
    console.error("Teacher content create error:", error);
    return res.status(500).json({ success: false, message: "Failed to save content" });
  }
}

export async function getCourses(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const courses = await prisma.course.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    });
    return res.json({ success: true, courses });
  } catch (error) {
    console.error("Teacher courses error:", error);
    return res.status(500).json({ success: false, message: "Failed to load courses" });
  }
}

export async function getStudents(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true, board: true } },
        course: { select: { id: true, title: true, subject: true } },
      },
    });
    const studentIds: string[] = Array.from(new Set(enrollments.map((e: any) => String(e.studentId))));
    const attempts = await prisma.attempt.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true, score: true },
    });

    const byStudent = new Map<string, number[]>();
    for (const a of attempts) {
      const list = byStudent.get(a.userId) || [];
      list.push(a.score);
      byStudent.set(a.userId, list);
    }

    const students = studentIds.map((id) => {
      const scores = byStudent.get(id) || [];
      const avg =
        scores.length > 0
          ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 100) / 100
          : 0;
      const enr = enrollments.find((e: any) => e.studentId === id);
      return {
        id,
        name: enr?.student.name,
        email: enr?.student.email,
        grade: enr?.student.grade,
        board: enr?.student.board,
        attempts: scores.length,
        averageScore: avg,
        courses: enrollments.filter((e: any) => e.studentId === id).map((e: any) => e.course.title),
      };
    });

    return res.json({ success: true, students });
  } catch (error) {
    console.error("Teacher students error:", error);
    return res.status(500).json({ success: false, message: "Failed to load students" });
  }
}

export async function getEnrollments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { teacherId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, subject: true, board: true } },
      },
    });
    return res.json({ success: true, enrollments });
  } catch (error) {
    console.error("Teacher enrollments error:", error);
    return res.status(500).json({ success: false, message: "Failed to load enrollments" });
  }
}
