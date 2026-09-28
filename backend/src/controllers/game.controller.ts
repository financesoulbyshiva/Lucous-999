import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  xpPerCorrect: number;
  limit: number;
}

export const GAMES: GameDefinition[] = [
  { id: "rapid-fire", title: "Rapid Fire", description: "10 questions, instant scoring. +10 XP each.", xpPerCorrect: 10, limit: 10 },
  { id: "topic-blitz", title: "Topic Blitz", description: "5 fast questions on one topic. +15 XP each.", xpPerCorrect: 15, limit: 5 },
  { id: "endurance", title: "Endurance", description: "Up to 20 questions. +8 XP each.", xpPerCorrect: 8, limit: 20 },
];

export async function getGames(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  res.json({ success: true, games: GAMES });
}

export async function submitGame(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { gameId, topicId, answers } = req.body;
    const game = GAMES.find((g) => g.id === gameId);
    if (!game) {
      return res.status(400).json({ success: false, message: "Unknown game" });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "answers are required" });
    }

    const questions = await prisma.question.findMany({
      where: {
        topicId: String(topicId),
        id: { in: answers.map((a: any) => String(a.questionId)) },
      },
    });
    const byId = new Map<string, any>(questions.map((q: any) => [q.id, q]));
    let correct = 0;
    for (const a of answers) {
      const q = byId.get(String(a.questionId));
      if (q && Number(a.selected) === (q as any).correct) correct += 1;
    }
    const total = answers.length;
    const score = total > 0 ? Math.round((correct / total) * 10000) / 100 : 0;
    const xp = correct * game.xpPerCorrect;

    await prisma.gameScore.create({
      data: { userId: req.userId, gameId, topicId: String(topicId), correct, total, score, xp },
    });
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { xp: { increment: xp } },
      select: { xp: true },
    });

    res.status(201).json({ success: true, correct, total, score, xp, totalXp: user.xp });
  } catch (error) {
    console.error("Game submit error:", error);
    res.status(500).json({ success: false, message: "Failed to record game" });
  }
}

export async function getLeaderboard(
  _req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const users = await prisma.user.findMany({
      where: { role: "STUDENT", xp: { gt: 0 } },
      orderBy: { xp: "desc" },
      take: 10,
      select: { id: true, name: true, xp: true },
    });
    res.json({ success: true, leaderboard: users });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ success: false, message: "Failed to load leaderboard" });
  }
}

export async function getMyStats(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const scores = await prisma.gameScore.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { topic: { select: { name: true } } },
    });
    const me = await prisma.user.findUnique({ where: { id: req.userId }, select: { xp: true } });
    const best = scores.reduce((m: number, s: any) => Math.max(m, s.score), 0);
    res.json({
      success: true,
      totalXp: me?.xp ?? 0,
      gamesPlayed: scores.length,
      bestScore: best,
      recent: scores,
    });
  } catch (error) {
    console.error("Game me error:", error);
    res.status(500).json({ success: false, message: "Failed to load game stats" });
  }
}
