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
 * Chooses which topic to serve next.
 * If restrictToTopicId is set, strictly serves that topic.
 * Otherwise, uses weighted remedial sampling based on inverse mastery,
 * heavily prioritizing the weakest topic while interleaving other chapters.
 */
export function selectTargetTopic(
  masteries: MasteryState[],
  restrictToTopicId?: string
): NextQuestionResult | null {
  if (restrictToTopicId) {
    const matched = masteries.find((m) => m.topicId === restrictToTopicId);
    if (!matched) return null;
    const targetDifficulty = selectDifficulty(matched.score);
    return {
      topicId: matched.topicId,
      topicName: matched.topicName,
      targetDifficulty,
      reason: `Focused Practice: ${matched.topicName} (Current Mastery: ${Math.round(
        matched.score * 100
      )}%).`,
    };
  }

  const pool = masteries.filter((m) => m.score < MASTERY_THRESHOLD);
  const activePool = pool.length > 0 ? pool : masteries;
  if (activePool.length === 0) return null;

  // Interleaved weighted sampling: lower mastery gets higher probability
  // weight = (1.05 - score) ^ 2
  const weights = activePool.map((m) => Math.pow(Math.max(0.08, 1.05 - m.score), 2));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  let randomVal = Math.random() * totalWeight;
  let selected = activePool[0];
  for (let i = 0; i < activePool.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      selected = activePool[i];
      break;
    }
  }

  const targetDifficulty = selectDifficulty(selected.score);
  const isLowest = activePool.every((m) => m.score >= selected.score);

  const reason = isLowest
    ? `Targeted Remediation: Your ${selected.topicName} mastery (${Math.round(
        selected.score * 100
      )}%) is your priority improvement area.`
    : `Interleaved Reinforcement: Practicing ${selected.topicName} (${Math.round(
        selected.score * 100
      )}% mastery) alongside your priority chapters.`;

  return {
    topicId: selected.topicId,
    topicName: selected.topicName,
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
