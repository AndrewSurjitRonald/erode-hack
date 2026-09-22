/**
 * Simulates a handful of students playing through the adaptive quiz, so the
 * teacher dashboard has varied, realistic-looking data for a demo instead of
 * an empty state. Runs directly against Prisma + the adaptive engine (the
 * same logic the API routes use) rather than over HTTP, since the real quiz
 * API never reveals the correct answer to a client.
 *
 * Usage: npx tsx scripts/simulate-demo-data.ts
 */
import { prisma } from "../lib/prisma";
import { getNextQuestion } from "../lib/quiz-service";
import { updateMastery } from "../lib/adaptive-engine";

type Profile = {
  name: string;
  rounds: number;
  // probability of a correct answer, keyed by topic name; "default" applies elsewhere
  skill: Record<string, number>;
};

const profiles: Profile[] = [
  {
    name: "Aisha Khan",
    rounds: 25,
    skill: { default: 0.85, Ratios: 0.75 },
  },
  {
    name: "Rahul Verma",
    rounds: 22,
    skill: { default: 0.55, Ratios: 0.2, "Linear Equations": 0.35 },
  },
  {
    name: "Meera Iyer",
    rounds: 20,
    skill: { default: 0.4, Percentages: 0.25, Fractions: 0.3 },
  },
];

async function playRound(studentId: string, profile: Profile) {
  const next = await getNextQuestion(studentId);
  if (!next) return;

  const successProb = profile.skill[next.topic.name] ?? profile.skill.default;
  const correct = Math.random() < successProb;

  const question = await prisma.question.findUniqueOrThrow({
    where: { id: next.question.id },
  });
  const selectedIdx = correct
    ? question.answerIdx
    : (question.answerIdx + 1 + Math.floor(Math.random() * 3)) % 4;

  await prisma.attempt.create({
    data: { studentId, questionId: question.id, correct },
  });

  const existing = await prisma.mastery.findUnique({
    where: { studentId_topicId: { studentId, topicId: question.topicId } },
  });
  const currentScore = existing?.score ?? 0.5;
  const newScore = updateMastery(currentScore, correct);
  await prisma.mastery.upsert({
    where: { studentId_topicId: { studentId, topicId: question.topicId } },
    update: { score: newScore },
    create: { studentId, topicId: question.topicId, score: newScore },
  });

  return { topicName: next.topic.name, correct, selectedIdx };
}

async function main() {
  const topics = await prisma.topic.findMany();

  for (const profile of profiles) {
    const student = await prisma.student.create({ data: { name: profile.name } });
    await prisma.mastery.createMany({
      data: topics.map((t) => ({ studentId: student.id, topicId: t.id, score: 0.5 })),
    });
    console.log(`Created ${profile.name} (${student.id})`);

    for (let i = 0; i < profile.rounds; i++) {
      await playRound(student.id, profile);
    }
    console.log(`  played ${profile.rounds} rounds`);
  }

  console.log("\nDone. Refresh /teacher to see results.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
