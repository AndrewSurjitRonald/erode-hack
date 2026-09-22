import { predictAttemptsToMastery } from "../lib/ml/time-to-mastery-model";

const highMasteryHighAptitude = predictAttemptsToMastery(0.6, 0.9);
const lowMasteryLowAptitude = predictAttemptsToMastery(0.15, 0.55);

console.log("predictAttemptsToMastery(0.6, 0.9) =", highMasteryHighAptitude, "(expect low, clamped >= 1)");
console.log("predictAttemptsToMastery(0.15, 0.55) =", lowMasteryLowAptitude, "(expect high)");

if (!(highMasteryHighAptitude < lowMasteryLowAptitude)) {
  throw new Error("Expected high mastery/aptitude to need fewer attempts than low mastery/aptitude");
}
console.log("\nOrdering check passed.");
