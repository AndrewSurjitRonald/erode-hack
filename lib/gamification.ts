export type Badge = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
};

export type GamificationState = {
  streak: number;
  xp: number;
  badges: Badge[];
};

export const XP_CORRECT = 20;
export const XP_ATTEMPT = 5;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Consecutive practice days ending today (or yesterday, so a streak survives until the day ends). */
function currentStreak(attemptDates: Date[], now: Date): number {
  const days = new Set(attemptDates.map(dayKey));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

/**
 * Derives XP, streak and badges from the student's real attempt history and mastery,
 * so the numbers are the same on every device and can't drift from actual progress.
 */
export function computeGamification(
  attempts: { correct: boolean; createdAt: Date }[],
  topicMastery: { topicName: string; score: number }[],
  now: Date = new Date()
): GamificationState {
  const xp = attempts.reduce((sum, a) => sum + (a.correct ? XP_CORRECT : XP_ATTEMPT), 0);
  const streak = currentStreak(
    attempts.map((a) => a.createdAt),
    now
  );
  const scoreOf = (name: string) => topicMastery.find((t) => t.topicName === name)?.score ?? 0;
  const overall =
    topicMastery.length > 0
      ? topicMastery.reduce((sum, t) => sum + t.score, 0) / topicMastery.length
      : 0;

  const badges: Badge[] = [
    { id: "starter", title: "Math Explorer", desc: "Answer your first question", icon: "🚀", unlocked: attempts.length > 0 },
    { id: "streak", title: "Streak Master", desc: "Practice 3 days in a row", icon: "🔥", unlocked: streak >= 3 },
    { id: "fractions", title: "Fraction Wizard", desc: "Reach 80% mastery in Fractions", icon: "🧙‍♂️", unlocked: scoreOf("Fractions") >= 0.8 },
    { id: "algebra", title: "Linear Legend", desc: "Reach 80% mastery in Linear Equations", icon: "⚡", unlocked: scoreOf("Linear Equations") >= 0.8 },
    { id: "champion", title: "Math Prodigy", desc: "Reach 70% overall mastery", icon: "🏆", unlocked: overall >= 0.7 },
  ];

  return { streak, xp, badges };
}
