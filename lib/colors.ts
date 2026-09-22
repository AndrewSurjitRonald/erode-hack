export type MasteryBand = "low" | "mid" | "high";

// Mastery/status color scale used everywhere: rings, bars, heatmap cells, badges.
export const MASTERY_COLORS: Record<MasteryBand, { bg: string; softBg: string; text: string; label: string }> = {
  low: { bg: "#EF4444", softBg: "#FEE2E2", text: "#B91C1C", label: "Weak" },
  mid: { bg: "#F59E0B", softBg: "#FEF3C7", text: "#B45309", label: "Needs Practice" },
  high: { bg: "#10B981", softBg: "#DCFCE7", text: "#15803D", label: "Strong" },
};

export function bandForScore(score: number): MasteryBand {
  if (score < 0.4) return "low";
  if (score < 0.7) return "mid";
  return "high";
}
