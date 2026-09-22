import { predictCorrectProb, selectDifficulty } from "../lib/ml/difficulty-model";

console.log("predictCorrectProb(0.8, 1) =", predictCorrectProb(0.8, 1));
console.log("predictCorrectProb(0.2, 3) =", predictCorrectProb(0.2, 3));

console.log("\nselectDifficulty(0.9) =", selectDifficulty(0.9), "(expect 3)");
console.log("selectDifficulty(0.1) =", selectDifficulty(0.1), "(expect 1)");

console.log("\nFull sweep:");
for (const mastery of [0.1, 0.3, 0.5, 0.7, 0.9]) {
  const d = selectDifficulty(mastery);
  console.log(
    `  mastery=${mastery} -> difficulty=${d} (P=${predictCorrectProb(mastery, d).toFixed(3)})`
  );
}
