import { predictPriority, rankTopicsByPriority } from "../lib/ml/topic-priority-model";

const low = predictPriority(0.85, 0.05, 0.05);
const high = predictPriority(0.2, 0.8, 0.2);
console.log("predictPriority(healthy topic) =", low, "(expect low, in [0,100])");
console.log("predictPriority(struggling topic) =", high, "(expect high, in [0,100])");

if (!(low < high)) throw new Error("Expected healthy topic to have lower priority than struggling one");

const ranked = rankTopicsByPriority([
  { topicId: "t1", topicName: "Fractions", avgMastery: 0.85, pctStruggling: 0.05, stdMastery: 0.05 },
  { topicId: "t2", topicName: "Ratios", avgMastery: 0.3, pctStruggling: 0.7, stdMastery: 0.25 },
  { topicId: "t3", topicName: "Percentages", avgMastery: 0.6, pctStruggling: 0.3, stdMastery: 0.15 },
]);
console.log("\nRanked topics (most urgent first):");
for (const t of ranked) console.log(`  ${t.topicName}: ${t.priority.toFixed(1)}`);

if (ranked[0].topicName !== "Ratios") throw new Error("Expected Ratios to rank most urgent");
console.log("\nOrdering check passed.");
