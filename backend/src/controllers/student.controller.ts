import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  ATTEMPT_MODES,
  gradeAnswers,
  calculateWeakTopics,
  AnswerSubmission,
} from "../services/scoring.service";

export async function getContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const topicId = req.query.topicId as string | undefined;
    if (!topicId) {
      return res.status(400).json({ success: false, message: "topicId is required" });
    }

    const contents = await prisma.learningContent.findMany({
      where: { topicId, status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, topicId: true, title: true, body: true, order: true },
    });

    const progress = await prisma.studentProgress.findMany({
      where: {
        userId: req.userId,
        contentId: { in: contents.map((c: any) => c.id) },
      },
      select: { contentId: true },
    });

    return res.json({
      success: true,
      contents,
      completedIds: progress.map((p: any) => p.contentId),
    });
  } catch (error) {
    console.error("Content error:", error);
    return res.status(500).json({ success: false, message: "Failed to load content" });
  }
}

export async function getQuestions(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const topicId = req.query.topicId as string | undefined;
    const limit = Math.min(Number(req.query.limit) || 10, 30);
    if (!topicId) {
      return res.status(400).json({ success: false, message: "topicId is required" });
    }

    const questions = await prisma.question.findMany({
      where: { topicId, status: "PUBLISHED" },
      take: limit,
      select: {
        id: true,
        text: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
      },
    });

    return res.json({ success: true, questions });
  } catch (error) {
    console.error("Questions error:", error);
    return res.status(500).json({ success: false, message: "Failed to load questions" });
  }
}

export async function checkAnswer(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { questionId, selected } = req.body;
    const question = await prisma.question.findUnique({
      where: { id: String(questionId) },
    });
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    return res.json({
      success: true,
      correct: Number(selected) === question.correct,
      correctIndex: question.correct,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Check error:", error);
    return res.status(500).json({ success: false, message: "Failed to check answer" });
  }
}

export async function submitAttempt(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { topicId, mode, answers } = req.body;

    if (!ATTEMPT_MODES.includes(mode)) {
      return res.status(400).json({ success: false, message: "Invalid attempt mode" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "answers are required" });
    }

    const questions = await prisma.question.findMany({
      where: {
        topicId: String(topicId),
        id: { in: answers.map((a: AnswerSubmission) => String(a.questionId)) },
      },
    });

    const { perQuestion, correctCount, total, score } = gradeAnswers(answers, questions);

    const attempt = await prisma.attempt.create({
      data: {
        userId: req.userId,
        topicId: String(topicId),
        mode,
        correct: correctCount,
        total,
        score,
      },
    });

    return res.status(201).json({ success: true, attempt, perQuestion });
  } catch (error) {
    console.error("Attempt error:", error);
    return res.status(500).json({ success: false, message: "Failed to save attempt" });
  }
}

export async function getResults(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { id: true, name: true } },
          },
        },
      },
    });
    return res.json({ success: true, attempts });
  } catch (error) {
    console.error("Results error:", error);
    return res.status(500).json({ success: false, message: "Failed to load results" });
  }
}

export async function getWeakTopics(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const attempts = await prisma.attempt.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        topic: {
          select: {
            id: true,
            name: true,
            chapter: { select: { id: true, name: true } },
          },
        },
      },
    });

    const weakTopics = calculateWeakTopics(attempts);
    return res.json({ success: true, weakTopics });
  } catch (error) {
    console.error("Weak topics error:", error);
    return res.status(500).json({ success: false, message: "Failed to load weak topics" });
  }
}

export async function saveProgress(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { contentId } = req.body;
    const content = await prisma.learningContent.findUnique({
      where: { id: String(contentId) },
    });
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }
    await prisma.studentProgress.upsert({
      where: {
        userId_contentId: { userId: req.userId!, contentId: String(contentId) },
      },
      update: {},
      create: { userId: req.userId!, contentId: String(contentId) },
    });
    return res.json({ success: true, message: "Progress saved" });
  } catch (error) {
    console.error("Progress error:", error);
    return res.status(500).json({ success: false, message: "Failed to save progress" });
  }
}

export async function getProgress(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const [completedCount, totalContent] = await Promise.all([
      prisma.studentProgress.count({ where: { userId: req.userId } }),
      prisma.learningContent.count({ where: { status: "PUBLISHED" } }),
    ]);
    return res.json({ success: true, completedCount, totalContent });
  } catch (error) {
    console.error("Progress error:", error);
    return res.status(500).json({ success: false, message: "Failed to load progress" });
  }
}
