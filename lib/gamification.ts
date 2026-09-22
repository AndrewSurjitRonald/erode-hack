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

const DEFAULT_BADGES: Badge[] = [
  { id: "starter", title: "Math Explorer", desc: "Started the personalized journey", icon: "🚀", unlocked: true },
  { id: "streak", title: "Streak Master", desc: "3-day continuous practice", icon: "🔥", unlocked: true },
  { id: "fractions", title: "Fraction Wizard", desc: "Mastered fraction calculations", icon: "🧙‍♂️", unlocked: true },
  { id: "algebra", title: "Linear Legend", desc: "Conquered linear equations", icon: "⚡", unlocked: false },
  { id: "champion", title: "Math Prodigy", desc: "Achieved >70% class mastery", icon: "🏆", unlocked: false },
];

export function getGamificationState(studentId: string): GamificationState {
  if (typeof window === "undefined") {
    return { streak: 3, xp: 240, badges: DEFAULT_BADGES };
  }
  const key = `pathlearn_gamification_${studentId}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  const initial: GamificationState = { streak: 3, xp: 240, badges: DEFAULT_BADGES };
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
}

export function awardXP(studentId: string, points: number = 20): GamificationState {
  const current = getGamificationState(studentId);
  const newXP = current.xp + points;

  // Unlock badges dynamically
  const updatedBadges = current.badges.map((b) => {
    if (b.id === "algebra" && newXP >= 260) return { ...b, unlocked: true };
    if (b.id === "champion" && newXP >= 320) return { ...b, unlocked: true };
    return b;
  });

  const updated: GamificationState = {
    ...current,
    xp: newXP,
    badges: updatedBadges,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(`pathlearn_gamification_${studentId}`, JSON.stringify(updated));
  }
  return updated;
}
