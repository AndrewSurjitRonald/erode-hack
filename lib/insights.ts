import { TopicMastery } from "@/lib/student-data";
import { estimateTrend } from "@/lib/ml/at-risk-model";

/**
 * Generates 2-3 short, data-driven observations about a student's pattern.
 * Not a hardcoded per-student template — every sentence is derived from
 * their actual mastery numbers and recent attempt trend (estimateTrend(),
 * the same helper Model 5 / the at-risk detector uses). This is the
 * "insights" field the UI spec calls AI-generated; without a configured
 * LLM API key, this rule-based-but-genuinely-computed approach is the
 * honest fallback rather than blocking the feature or faking the text.
 */
export function generateInsights(
  topicMastery: TopicMastery[],
  recentCorrectOldestFirst: boolean[]
): string[] {
  if (topicMastery.length === 0) return ["Not enough data yet — keep practicing!"];

  const insights: string[] = [];
  const sorted = [...topicMastery].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  if (weakest.score < 0.5) {
    insights.push(
      `Struggles with ${weakest.topicName} — mastery is only ${Math.round(weakest.score * 100)}%.`
    );
  }

  if (strongest.score >= 0.7 && strongest.topicId !== weakest.topicId) {
    insights.push(
      `Shows strong command of ${strongest.topicName} (${Math.round(strongest.score * 100)}%).`
    );
  }

  const trend = estimateTrend(recentCorrectOldestFirst);
  if (trend > 0.15) {
    insights.push("Shows consistent improvement over recent attempts.");
  } else if (trend < -0.15) {
    insights.push("Recent accuracy has been declining — may need extra support soon.");
  } else if (recentCorrectOldestFirst.length >= 4) {
    insights.push("Performance has been steady over recent attempts.");
  }

  if (insights.length === 0) {
    insights.push("Consistent performance across all topics so far.");
  }

  return insights.slice(0, 3);
}
