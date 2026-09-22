import {
  updateMastery,
  selectTargetTopic,
  selectQuestion,
  getWeakTopics,
  MasteryState,
  QuestionLite,
  RecentAttempt,
} from "../lib/adaptive-engine";

const topics = [
  { topicId: "t1", topicName: "Fractions" },
  { topicId: "t2", topicName: "Ratios" },
  { topicId: "t3", topicName: "Linear Equations" },
  { topicId: "t4", topicName: "Percentages" },
];

const questions: QuestionLite[] = [];
for (const t of topics) {
  for (let d = 1; d <= 3; d++) {
    for (let i = 0; i < 3; i++) {
      questions.push({ id: `${t.topicId}-d${d}-q${i}`, topicId: t.topicId, difficulty: d });
    }
  }
}

const masteries: MasteryState[] = topics.map((t) => ({ ...t, score: 0.5 }));
const attemptCounts: Record<string, number> = {};
const recent: RecentAttempt[] = [];

// Simulate: student is strong at Fractions (correct 80%), weak at Ratios (correct 20%),
// average elsewhere (correct 50%).
const skillByTopic: Record<string, number> = {
  t1: 0.8,
  t2: 0.2,
  t3: 0.5,
  t4: 0.5,
};

console.log("Simulating 30 attempts...\n");

for (let round = 1; round <= 30; round++) {
  const target = selectTargetTopic(masteries);
  if (!target) break;

  const question = selectQuestion(questions, target.topicId, target.targetDifficulty, recent);
  if (!question) {
    console.log(`Round ${round}: no question available for ${target.topicName}, skipping`);
    continue;
  }

  const successProb = skillByTopic[target.topicId];
  const correct = Math.random() < successProb;

  const m = masteries.find((m) => m.topicId === target.topicId)!;
  const before = m.score;
  m.score = updateMastery(m.score, correct);

  attemptCounts[target.topicId] = (attemptCounts[target.topicId] ?? 0) + 1;
  recent.push({ questionId: question.id, topicId: target.topicId, correct });

  console.log(
    `Round ${round.toString().padStart(2)}: [${target.topicName.padEnd(16)}] diff=${
      question.difficulty
    } correct=${correct ? "Y" : "N"} mastery ${before.toFixed(3)} -> ${m.score.toFixed(3)} | reason: ${target.reason}`
  );
}

console.log("\nFinal mastery scores:");
for (const m of masteries) {
  console.log(`  ${m.topicName.padEnd(16)} ${m.score.toFixed(3)}  (attempts: ${attemptCounts[m.topicId] ?? 0})`);
}

console.log("\nBounds check:");
const outOfBounds = masteries.filter((m) => m.score < 0.05 || m.score > 0.95);
console.log(outOfBounds.length === 0 ? "  OK: all scores within [0.05, 0.95]" : `  FAIL: ${JSON.stringify(outOfBounds)}`);

console.log("\nWeak topics:");
console.log(getWeakTopics(masteries, attemptCounts));
