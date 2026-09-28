import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export async function assertParentAccess(
  req: AuthenticatedRequest,
  res: Response,
  studentId: string
): Promise<boolean> {
  const link = await prisma.parentChild.findUnique({
    where: { parentId_studentId: { parentId: req.userId, studentId } },
  });
  if (!link) {
    res.status(403).json({ success: false, message: "Not authorized for this student" });
    return false;
  }
  return true;
}

export async function linkChild(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { studentEmail } = req.body;
    if (!studentEmail) {
      return res.status(400).json({ success: false, message: "studentEmail is required" });
    }
    const student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student || student.role !== "STUDENT") {
      return res.status(404).json({ success: false, message: "No student found for that email" });
    }
    await prisma.parentChild.upsert({
      where: { parentId_studentId: { parentId: req.userId, studentId: student.id } },
      update: {},
      create: { parentId: req.userId, studentId: student.id },
    });
    res.json({
      success: true,
      message: "Student linked",
      child: {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.grade,
        board: student.board,
      },
    });
  } catch (error) {
    console.error("Parent link error:", error);
    res.status(500).json({ success: false, message: "Failed to link student" });
  }
}

export async function getChildren(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const links = await prisma.parentChild.findMany({
      where: { parentId: req.userId },
      include: {
        student: { select: { id: true, name: true, email: true, grade: true, board: true } },
      },
    });
    res.json({ success: true, children: links.map((l: any) => l.student) });
  } catch (error) {
    console.error("Parent children error:", error);
    res.status(500).json({ success: false, message: "Failed to load children" });
  }
}

export async function getChildOverview(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const studentId = req.params.id;
    if (!(await assertParentAccess(req, res, studentId))) return;

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true, grade: true, board: true, xp: true },
    });

    const [completedCount, attempts] = await Promise.all([
      prisma.studentProgress.count({ where: { userId: studentId } }),
      prisma.attempt.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { topic: { select: { id: true, name: true, chapter: { select: { name: true } } } } },
      }),
    ]);

    const latestByTopic = new Map<string, any>();
    for (const a of attempts) {
      if (!latestByTopic.has(a.topicId)) latestByTopic.set(a.topicId, a);
    }
    const weakTopics = [...latestByTopic.values()]
      .filter((a: any) => a.score < 60)
      .map((a: any) => ({
        topicId: a.topic.id,
        topicName: a.topic.name,
        chapterName: a.topic.chapter.name,
        score: a.score,
      }));

    res.json({ success: true, student, completedCount, attempts, weakTopics });
  } catch (error) {
    console.error("Parent overview error:", error);
    res.status(500).json({ success: false, message: "Failed to load child data" });
  }
}
