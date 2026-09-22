import { prisma } from "@/lib/prisma";
import {
  MasteryState,
  QuestionLite,
  RecentAttempt,
  selectTargetTopic,
  selectQuestion,
} from "@/lib/adaptive-engine";

export const DIAGNOSTIC_ROUNDS = 2; // one question per topic, twice through = 8 questions
export const ADAPTIVE_SESSION_LENGTH = 15; // progress-bar length once in adaptive mode

export type NextQuestionPayload = {
  question: {
    id: string;
    text: string;
    options: string[];
    textTa: string;
    optionsTa: string[];
    difficulty: number;
  };
  topic: { id: string; name: string; nameTa: string };
  reason: string;
  mode: "diagnostic" | "adaptive";
  questionNumber: number;
  totalDiagnostic: number;
};

export async function getNextQuestion(
  studentId: string,
  restrictToTopicId?: string
): Promise<NextQuestionPayload | null> {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  if (topics.length === 0) return null;

  const questions = await prisma.question.findMany();
  const attempts = await prisma.attempt.findMany({
    where: { studentId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  const totalAttempts = attempts.length;
  const diagnosticTotal = topics.length * DIAGNOSTIC_ROUNDS;

  if (!restrictToTopicId && totalAttempts < diagnosticTotal) {
    const topicOrder: string[] = [];
    for (let round = 0; round < DIAGNOSTIC_ROUNDS; round++) {
      for (const t of topics) topicOrder.push(t.id);
    }
    const targetTopicId = topicOrder[totalAttempts];
    const targetTopic = topics.find((t) => t.id === targetTopicId)!;

    const askedQuestionIds = new Set(
      attempts.filter((a) => a.question.topicId === targetTopicId).map((a) => a.questionId)
    );
    const candidates = questions.filter(
      (q) => q.topicId === targetTopicId && q.difficulty === 2 && !askedQuestionIds.has(q.id)
    );
    const pool =
      candidates.length > 0
        ? candidates
        : questions.filter((q) => q.topicId === targetTopicId && q.difficulty === 2);
    const picked = pool[Math.floor(Math.random() * pool.length)];

    return {
      question: {
        id: picked.id,
        text: picked.text,
        options: picked.options,
        textTa: picked.textTa,
        optionsTa: picked.optionsTa,
        difficulty: picked.difficulty,
      },
      topic: { id: targetTopic.id, name: targetTopic.name, nameTa: targetTopic.nameTa },
      reason: `Diagnostic question ${totalAttempts + 1} of ${diagnosticTotal} for ${
        targetTopic.name
      } — establishing your baseline.`,
      mode: "diagnostic",
      questionNumber: totalAttempts + 1,
      totalDiagnostic: diagnosticTotal,
    };
  }

  const masteryRows = await prisma.mastery.findMany({ where: { studentId } });
  const masteryByTopic = new Map(masteryRows.map((m) => [m.topicId, m.score]));

  const masteries: MasteryState[] = topics.map((t) => ({
    topicId: t.id,
    topicName: t.name,
    score: masteryByTopic.get(t.id) ?? 0.5,
  }));

  const target = selectTargetTopic(masteries, restrictToTopicId);
  if (!target) return null;

  const questionLites: QuestionLite[] = questions.map((q) => ({
    id: q.id,
    topicId: q.topicId,
    difficulty: q.difficulty,
  }));

  const recentAttempts: RecentAttempt[] = attempts.map((a) => ({
    questionId: a.questionId,
    topicId: a.question.topicId,
    correct: a.correct,
  }));

  const picked = selectQuestion(
    questionLites,
    target.topicId,
    target.targetDifficulty,
    recentAttempts
  );
  if (!picked) return null;

  const fullQuestion = questions.find((q) => q.id === picked.id)!;
  const adaptiveAttemptsSoFar = Math.max(0, totalAttempts - diagnosticTotal);
  const questionNumber = (adaptiveAttemptsSoFar % ADAPTIVE_SESSION_LENGTH) + 1;

  return {
    question: {
      id: fullQuestion.id,
      text: fullQuestion.text,
      options: fullQuestion.options,
      textTa: fullQuestion.textTa,
      optionsTa: fullQuestion.optionsTa,
      difficulty: fullQuestion.difficulty,
    },
    topic: { id: target.topicId, name: target.topicName, nameTa: topics.find((t) => t.id === target.topicId)!.nameTa },
    reason: target.reason,
    mode: "adaptive",
    questionNumber,
    totalDiagnostic: ADAPTIVE_SESSION_LENGTH,
  };
}
