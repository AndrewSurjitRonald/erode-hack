export type MasteryBand = "low" | "mid" | "high";

// Mastery/status color scale used everywhere: rings, bars, heatmap cells, badges.
export const MASTERY_COLORS: Record<MasteryBand, { bg: string; text: string; label: string }> = {
  low: { bg: "#E76F51", text: "#ffffff", label: "Weak" },
  mid: { bg: "#F4A261", text: "#1A2E35", label: "Needs Practice" },
  high: { bg: "#3FA34D", text: "#ffffff", label: "Strong" },
};

export function bandForScore(score: number): MasteryBand {
  if (score < 0.4) return "low";
  if (score < 0.7) return "mid";
  return "high";
}
