import { predictAtRiskProb, isAtRisk, estimateTrend } from "../lib/ml/at-risk-model";

const low = predictAtRiskProb(0.75, 0.1);
const high = predictAtRiskProb(0.25, -0.15);
console.log("predictAtRiskProb(mastery=0.75, trend=+0.1) =", low, "(expect low)");
console.log("predictAtRiskProb(mastery=0.25, trend=-0.15) =", high, "(expect high)");
if (!(low < 0.5 && high > 0.5)) throw new Error("Expected clear separation around the 0.5 threshold");

console.log("\nisAtRisk(0.75, 0.1) =", isAtRisk(0.75, 0.1), "(expect false)");
console.log("isAtRisk(0.25, -0.15) =", isAtRisk(0.25, -0.15), "(expect true)");

console.log("\nestimateTrend tests:");
const improving = [false, false, true, true, true, true];
const declining = [true, true, true, true, false, false];
const tooFew = [true, false];
console.log("  improving sequence ->", estimateTrend(improving), "(expect > 0)");
console.log("  declining sequence ->", estimateTrend(declining), "(expect < 0)");
console.log("  too few attempts ->", estimateTrend(tooFew), "(expect 0)");

if (estimateTrend(improving) <= 0) throw new Error("Expected positive trend for improving sequence");
if (estimateTrend(declining) >= 0) throw new Error("Expected negative trend for declining sequence");
console.log("\nAll checks passed.");
