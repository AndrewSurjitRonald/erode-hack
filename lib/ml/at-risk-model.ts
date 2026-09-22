import model from "../models/at-risk-model.json";

export function predictAtRiskProb(mastery: number, trend: number): number {
  const z = model.weights.mastery * mastery + model.weights.trend * trend + model.bias;
  return 1 / (1 + Math.exp(-z));
}

export function isAtRisk(mastery: number, trend: number): boolean {
  return predictAtRiskProb(mastery, trend) > 0.5;
}

/**
 * Simple recent-trend estimate from a sequence of correct/incorrect
 * outcomes (oldest first): accuracy of the newer half minus accuracy of the
 * older half. Positive means improving, negative means declining. Needs at
 * least 4 attempts to say anything meaningful; fewer than that returns 0
 * (neutral — not enough signal either way).
 */
export function estimateTrend(recentCorrect: boolean[]): number {
  if (recentCorrect.length < 4) return 0;
  const mid = Math.floor(recentCorrect.length / 2);
  const older = recentCorrect.slice(0, mid);
  const newer = recentCorrect.slice(mid);
  const accuracy = (arr: boolean[]) => arr.filter(Boolean).length / arr.length;
  return accuracy(newer) - accuracy(older);
}
