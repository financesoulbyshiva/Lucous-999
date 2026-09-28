export const ATTEMPT_MODES = ["PLAY", "PRACTICE", "TEST", "RETEST"] as const;
export type AttemptMode = typeof ATTEMPT_MODES[number];

export interface AnswerSubmission {
  questionId: string;
  selected: number;
}

export interface GradedQuestion {
  questionId: string;
  selected: number;
  correctIndex: number | null;
  wasCorrect: boolean;
  explanation: string | null;
}

export interface QuestionRecord {
  id: string;
  text: string;
  correct: number;
  explanation?: string | null;
  [key: string]: any;
}

export function gradeAnswers(
  answers: AnswerSubmission[],
  questions: QuestionRecord[]
): {
  perQuestion: GradedQuestion[];
  correctCount: number;
  total: number;
  score: number;
} {
  const byId = new Map<string, QuestionRecord>(questions.map((q) => [q.id, q]));
  let correctCount = 0;

  const perQuestion: GradedQuestion[] = answers.map((a) => {
    const question = byId.get(String(a.questionId));
    const correctIndex = question ? question.correct : null;
    const wasCorrect = question !== undefined && Number(a.selected) === question.correct;
    if (wasCorrect) correctCount += 1;
    return {
      questionId: String(a.questionId),
      selected: Number(a.selected),
      correctIndex,
      wasCorrect,
      explanation: question ? question.explanation ?? null : null,
    };
  });

  const total = perQuestion.length;
  const score = total > 0 ? Math.round((correctCount / total) * 10000) / 100 : 0;

  return { perQuestion, correctCount, total, score };
}

export interface WeakTopicItem {
  topicId: string;
  topicName: string;
  chapterName: string;
  score: number;
  action: "Practice" | "Retest";
}

export function calculateWeakTopics(attempts: any[]): WeakTopicItem[] {
  const latestByTopic = new Map<string, any>();
  for (const attempt of attempts) {
    if (!latestByTopic.has(attempt.topicId)) {
      latestByTopic.set(attempt.topicId, attempt);
    }
  }

  return [...latestByTopic.values()]
    .filter((a) => a.score < 60)
    .map((a) => ({
      topicId: a.topic.id,
      topicName: a.topic.name,
      chapterName: a.topic.chapter.name,
      score: a.score,
      action: a.mode === "PRACTICE" || a.mode === "RETEST" ? "Retest" : "Practice",
    }));
}
