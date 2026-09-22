import { selectDifficulty } from "./ml/difficulty-model";

export const LEARNING_RATE = 0.15;
export const MASTERY_MIN = 0.05;
export const MASTERY_MAX = 0.95;
export const MASTERY_THRESHOLD = 0.8;
export const WEAK_THRESHOLD = 0.5;
export const WEAK_MIN_ATTEMPTS = 3;

export type MasteryState = {
  topicId: string;
  topicName: string;
  score: number;
};

export type QuestionLite = {
  id: string;
  topicId: string;
  difficulty: number;
};

export type RecentAttempt = {
  questionId: string;
  topicId: string;
  correct: boolean;
};

/**
 * Elo-inspired mastery update: nudges the score toward the observed outcome,
 * treating the current score itself as the "expected" probability of success.
 */
export function updateMastery(currentMastery: number, correct: boolean): number {
  const expected = currentMastery;
  const actual = correct ? 1 : 0;
  const next = currentMastery + LEARNING_RATE * (actual - expected);
  return clamp(next, MASTERY_MIN, MASTERY_MAX);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type NextQuestionResult = {
  topicId: string;
  topicName: string;
  targetDifficulty: number;
  reason: string;
};

/**
 * Chooses which topic to serve next: the weakest topic not yet mastered.
 * Ties broken by topic order (stable) to keep behavior deterministic.
 */
export function selectTargetTopic(
  masteries: MasteryState[],
  restrictToTopicId?: string
): NextQuestionResult | null {
  const candidates = restrictToTopicId
    ? masteries.filter((m) => m.topicId === restrictToTopicId)
    : masteries.filter((m) => m.score < MASTERY_THRESHOLD);

  const pool = candidates.length > 0 ? candidates : masteries;
  if (pool.length === 0) return null;

  const sorted = [...pool].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const targetDifficulty = selectDifficulty(weakest.score);

  const otherTopics = masteries.filter((m) => m.topicId !== weakest.topicId);
  const avgOthers =
    otherTopics.length > 0
      ? otherTopics.reduce((sum, m) => sum + m.score, 0) / otherTopics.length
      : weakest.score;

  const reason = restrictToTopicId
    ? `Practicing ${weakest.topicName} — your mastery here is ${Math.round(
        weakest.score * 100
      )}%.`
    : otherTopics.length > 0
    ? `Recommended because your ${weakest.topicName} mastery is ${Math.round(
        weakest.score * 100
      )}% — lower than your other topics (avg ${Math.round(avgOthers * 100)}%).`
    : `Recommended because your ${weakest.topicName} mastery is ${Math.round(
        weakest.score * 100
      )}%.`;

  return {
    topicId: weakest.topicId,
    topicName: weakest.topicName,
    targetDifficulty,
    reason,
  };
}

/**
 * Picks a specific question within the target topic/difficulty, avoiding
 * questions answered correctly in the last 5 attempts on that topic.
 */
export function selectQuestion(
  questions: QuestionLite[],
  targetTopicId: string,
  targetDifficulty: number,
  recentAttempts: RecentAttempt[]
): QuestionLite | null {
  const recentOnTopic = recentAttempts
    .filter((a) => a.topicId === targetTopicId)
    .slice(-5);
  const recentlyCorrectIds = new Set(
    recentOnTopic.filter((a) => a.correct).map((a) => a.questionId)
  );

  const topicQuestions = questions.filter((q) => q.topicId === targetTopicId);

  const eligible = topicQuestions.filter(
    (q) => q.difficulty === targetDifficulty && !recentlyCorrectIds.has(q.id)
  );
  if (eligible.length > 0) {
    return eligible[Math.floor(Math.random() * eligible.length)];
  }

  // Fall back: same difficulty even if recently answered, then any difficulty not recent.
  const sameDifficulty = topicQuestions.filter((q) => q.difficulty === targetDifficulty);
  if (sameDifficulty.length > 0) {
    return sameDifficulty[Math.floor(Math.random() * sameDifficulty.length)];
  }

  const notRecent = topicQuestions.filter((q) => !recentlyCorrectIds.has(q.id));
  const fallbackPool = notRecent.length > 0 ? notRecent : topicQuestions;
  if (fallbackPool.length === 0) return null;
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}

export type WeakTopic = {
  topicId: string;
  topicName: string;
  score: number;
  attemptCount: number;
};

export function getWeakTopics(
  masteries: MasteryState[],
  attemptCounts: Record<string, number>
): WeakTopic[] {
  return masteries
    .filter(
      (m) =>
        m.score < WEAK_THRESHOLD &&
        (attemptCounts[m.topicId] ?? 0) >= WEAK_MIN_ATTEMPTS
    )
    .map((m) => ({
      topicId: m.topicId,
      topicName: m.topicName,
      score: m.score,
      attemptCount: attemptCounts[m.topicId] ?? 0,
    }))
    .sort((a, b) => a.score - b.score);
}
