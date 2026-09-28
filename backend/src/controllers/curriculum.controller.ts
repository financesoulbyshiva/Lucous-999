import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getBoards(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const boards = await prisma.board.findMany({ orderBy: { name: "asc" } });
    return res.json({ success: true, boards });
  } catch (error) {
    console.error("Boards error:", error);
    return res.status(500).json({ success: false, message: "Failed to load boards" });
  }
}

export async function getClasses(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const boardId = req.query.boardId as string | undefined;
    const where = boardId ? { subjects: { some: { boardId } } } : {};
    const classes = await prisma.grade.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return res.json({ success: true, classes });
  } catch (error) {
    console.error("Classes error:", error);
    return res.status(500).json({ success: false, message: "Failed to load classes" });
  }
}

export async function getSubjects(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const boardId = req.query.boardId as string | undefined;
    const gradeId = req.query.gradeId as string | undefined;
    const where: any = {};
    if (boardId) where.boardId = boardId;
    if (gradeId) where.gradeId = gradeId;

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { chapters: true } },
        board: { select: { name: true } },
        grade: { select: { name: true } },
      },
    });
    return res.json({ success: true, subjects });
  } catch (error) {
    console.error("Subjects error:", error);
    return res.status(500).json({ success: false, message: "Failed to load subjects" });
  }
}

export async function getChapters(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const subjectId = req.query.subjectId as string | undefined;
    if (!subjectId) {
      return res.status(400).json({ success: false, message: "subjectId is required" });
    }
    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      orderBy: { id: "asc" },
      include: { _count: { select: { topics: true } } },
    });
    return res.json({ success: true, chapters });
  } catch (error) {
    console.error("Chapters error:", error);
    return res.status(500).json({ success: false, message: "Failed to load chapters" });
  }
}

export async function getTopics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const chapterId = req.query.chapterId as string | undefined;
    if (!chapterId) {
      return res.status(400).json({ success: false, message: "chapterId is required" });
    }
    const topics = await prisma.topic.findMany({
      where: { chapterId },
      orderBy: { id: "asc" },
      include: { _count: { select: { questions: true, contents: true } } },
    });
    return res.json({ success: true, topics });
  } catch (error) {
    console.error("Topics error:", error);
    return res.status(500).json({ success: false, message: "Failed to load topics" });
  }
}
