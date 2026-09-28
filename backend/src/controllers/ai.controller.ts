import { Response } from "express";
import prisma from "../config/prisma";
import { AuthenticatedRequest } from "../middleware/auth";
import { aiConfigured, callAi, AiChatMessage } from "../services/ai.service";

export async function aiTutor(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { message, conversationId } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "message is required" });
    }
    const convId = conversationId || `conv_${req.userId}_${Date.now()}`;

    if (!aiConfigured()) {
      return res.json({
        success: true,
        configured: false,
        conversationId: convId,
        reply:
          "The AI tutor is not configured yet. Set AI_PROVIDER, AI_API_KEY and AI_MODEL on the backend to enable live answers.",
      });
    }

    const history = await prisma.aiMessage.findMany({
      where: { conversationId: convId, userId: req.userId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const messages: AiChatMessage[] = [
      {
        role: "system",
        content:
          "You are LUCOUS Tutor, a concise and encouraging tutor for school students. Explain concepts clearly and give short examples.",
      },
      ...history.map((m: any) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "assistant" | "user",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const result = await callAi(messages);
    if (!result.ok) {
      return res.status(502).json({ success: false, message: result.reason });
    }

    await prisma.aiMessage.createMany({
      data: [
        { userId: req.userId, conversationId: convId, role: "user", content: message },
        { userId: req.userId, conversationId: convId, role: "assistant", content: result.text },
      ],
    });

    res.json({ success: true, configured: true, conversationId: convId, reply: result.text });
  } catch (error) {
    console.error("AI tutor error:", error);
    res.status(500).json({ success: false, message: "AI tutor request failed" });
  }
}

export async function generateContent(
  req: AuthenticatedRequest,
  res: Response
): Promise<void | Response> {
  try {
    const { subject, chapter, topic, difficulty, count, topicId, save } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "topic is required" });
    }
    const n = Math.min(Math.max(Number(count) || 5, 1), 20);
    const level = ["EASY", "MEDIUM", "HARD"].includes(difficulty) ? difficulty : "MEDIUM";

    if (!aiConfigured()) {
      return res.status(503).json({
        success: false,
        configured: false,
        message:
          "AI content generation is not configured. Set AI_PROVIDER, AI_API_KEY and AI_MODEL on the backend.",
      });
    }

    const prompt =
      `Generate ${n} ${level} multiple-choice questions on the topic "${topic}"` +
      (chapter ? ` from the chapter "${chapter}"` : "") +
      (subject ? ` for ${subject}` : "") +
      `. Return JSON of the form {"questions":[{"text":"...","optionA":"...","optionB":"...","optionC":"...","optionD":"...","correct":0,"explanation":"..."}]} where correct is the 0-based index of the right option.`;

    const result = await callAi(
      [
        { role: "system", content: "You generate curriculum-aligned MCQs and always respond with valid JSON." },
        { role: "user", content: prompt },
      ],
      { json: true }
    );
    if (!result.ok) {
      return res.status(502).json({ success: false, message: result.reason });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(result.text || "{}");
    } catch {
      return res.status(502).json({ success: false, message: "AI returned invalid JSON" });
    }
    const questions = Array.isArray(parsed?.questions) ? parsed.questions : [];

    let saved = 0;
    if (save && topicId && questions.length > 0) {
      const target = await prisma.topic.findUnique({ where: { id: String(topicId) } });
      if (target) {
        await prisma.question.createMany({
          data: questions.map((q: any) => ({
            topicId: String(topicId),
            text: String(q.text || ""),
            optionA: String(q.optionA || ""),
            optionB: String(q.optionB || ""),
            optionC: String(q.optionC || ""),
            optionD: String(q.optionD || ""),
            correct: Number(q.correct) || 0,
            explanation: q.explanation ? String(q.explanation) : null,
            difficulty: level,
            source: "AI",
            status: "DRAFT",
          })),
        });
        saved = questions.length;
      }
    }

    res.json({ success: true, configured: true, questions, saved });
  } catch (error) {
    console.error("AI content generation error:", error);
    res.status(500).json({ success: false, message: "Content generation failed" });
  }
}
