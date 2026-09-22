/**
 * Simulates demo students playing through the adaptive quiz matching the mockup
 * names and scores (Arjun, Aarav Sharma, Diya, Karan, Meera, Rohit), so the
 * teacher dashboard and student view have authentic, live data.
 *
 * Usage: npx tsx scripts/simulate-demo-data.ts
 */
import { prisma } from "../lib/prisma";
import { getNextQuestion } from "../lib/quiz-service";
import { updateMastery } from "../lib/adaptive-engine";

type Profile = {
  name: string;
  rounds: number;
  skill: Record<string, number>;
};

const profiles: Profile[] = [
  {
    name: "Aarav Sharma",
    rounds: 24,
    skill: {
      default: 0.75,
      Fractions: 0.85,
      Percentages: 0.80,
      Ratios: 0.65,
      "Linear Equations": 0.40,
    },
  },
  {
    name: "Arjun",
    rounds: 20,
    skill: {
      default: 0.70,
      Fractions: 0.78,
      Percentages: 0.72,
      Ratios: 0.60,
      "Linear Equations": 0.45,
    },
  },
  {
    name: "Diya",
    rounds: 18,
    skill: {
      default: 0.82,
      Fractions: 0.88,
      Ratios: 0.80,
    },
  },
  {
    name: "Karan",
    rounds: 16,
    skill: {
      default: 0.35,
      "Linear Equations": 0.25,
      Ratios: 0.30,
    },
  },
  {
    name: "Meera",
    rounds: 18,
    skill: {
      default: 0.60,
      Fractions: 0.75,
      "Linear Equations": 0.35,
    },
  },
  {
    name: "Rohit",
    rounds: 15,
    skill: {
      default: 0.48,
      Percentages: 0.40,
      Ratios: 0.50,
    },
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
    let student = await prisma.student.findFirst({ where: { name: profile.name } });
    if (!student) {
      const created = await prisma.student.create({ data: { name: profile.name } });
      await prisma.mastery.createMany({
        data: topics.map((t) => ({ studentId: created.id, topicId: t.id, score: 0.5 })),
      });
      student = created;
      console.log(`Created ${profile.name} (${student.id})`);
    } else {
      console.log(`Found existing ${profile.name} (${student.id})`);
    }

    const currentAttempts = await prisma.attempt.count({ where: { studentId: student.id } });
    const roundsToPlay = Math.max(0, profile.rounds - currentAttempts);
    for (let i = 0; i < roundsToPlay; i++) {
      await playRound(student.id, profile);
    }
    console.log(`  completed rounds (total attempts: ${currentAttempts + roundsToPlay})`);
  }

  console.log("\nDone seeding mock demo students.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
