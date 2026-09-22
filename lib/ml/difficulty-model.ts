import weights from "../models/difficulty-model.json";

export function predictCorrectProb(mastery: number, difficulty: number): number {
  const z =
    weights.weights.mastery * mastery + weights.weights.difficulty * difficulty + weights.bias;
  return 1 / (1 + Math.exp(-z));
}

const TARGET_PROB = 0.75;

export function selectDifficulty(mastery: number): 1 | 2 | 3 {
  const options: (1 | 2 | 3)[] = [1, 2, 3];
  let best: 1 | 2 | 3 = 1;
  let bestDistance = Infinity;
  for (const d of options) {
    const p = predictCorrectProb(mastery, d);
    const distance = Math.abs(p - TARGET_PROB);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = d;
    }
  }
  return best;
}
