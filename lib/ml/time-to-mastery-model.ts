import model from "../models/time-to-mastery-model.json";

/**
 * Predicts how many practice attempts a student needs to reach mastery
 * (score >= 0.8) on a topic, given their current mastery and an aptitude
 * estimate (their recent accuracy rate is a reasonable proxy).
 */
export function predictAttemptsToMastery(initialMastery: number, aptitude: number): number {
  const raw =
    model.weights.mastery * initialMastery +
    model.weights.aptitude * aptitude +
    model.weights.masterySq * initialMastery ** 2 +
    model.weights.aptitudeSq * aptitude ** 2 +
    model.weights.masteryAptitude * initialMastery * aptitude +
    model.bias;
  return Math.round(clamp(raw, model.minAttempts, model.maxAttempts));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
