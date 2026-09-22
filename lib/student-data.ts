import { prisma } from "@/lib/prisma";
import { getWeakTopics, MasteryState } from "@/lib/adaptive-engine";

export type TopicMastery = { topicId: string; topicName: string; score: number };

export async function getStudentTopicMastery(studentId: string): Promise<TopicMastery[]> {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  const masteryRows = await prisma.mastery.findMany({ where: { studentId } });
  const byTopic = new Map(masteryRows.map((m) => [m.topicId, m.score]));

  return topics.map((t) => ({
    topicId: t.id,
    topicName: t.name,
    score: byTopic.get(t.id) ?? 0.5,
  }));
}

export function overallMastery(topicMastery: TopicMastery[]): number {
  if (topicMastery.length === 0) return 0.5;
  return topicMastery.reduce((sum, t) => sum + t.score, 0) / topicMastery.length;
}

export async function getStudentAttemptCounts(studentId: string): Promise<Record<string, number>> {
  const attempts = await prisma.attempt.findMany({
    where: { studentId },
    include: { question: true },
  });
  const counts: Record<string, number> = {};
  for (const a of attempts) {
    counts[a.question.topicId] = (counts[a.question.topicId] ?? 0) + 1;
  }
  return counts;
}

export async function getStudentWeakTopics(studentId: string) {
  const topicMastery = await getStudentTopicMastery(studentId);
  const attemptCounts = await getStudentAttemptCounts(studentId);
  const masteries: MasteryState[] = topicMastery.map((t) => ({
    topicId: t.topicId,
    topicName: t.topicName,
    score: t.score,
  }));
  return getWeakTopics(masteries, attemptCounts);
}
