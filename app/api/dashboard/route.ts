import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentArchetype } from "@/lib/archetype";
import { estimateTrend, isAtRisk } from "@/lib/ml/at-risk-model";
import { rankTopicsByPriority, TopicStats } from "@/lib/ml/topic-priority-model";

export async function GET() {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { mastery: true },
  });

  const attempts = await prisma.attempt.findMany({
    where: { studentId: { in: students.map((s) => s.id) } },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  const shaped = students.map((s) => {
    const masteryByTopic: Record<string, number> = {};
    for (const m of s.mastery) masteryByTopic[m.topicId] = m.score;

    const studentAttempts = attempts.filter((a) => a.studentId === s.id);

    const topicMastery = topics.map((t) => {
      const score = masteryByTopic[t.id] ?? 0.5;
      const recentCorrect = studentAttempts
        .filter((a) => a.question.topicId === t.id)
        .slice(-10)
        .map((a) => a.correct);
      const trend = estimateTrend(recentCorrect);
      return {
        topicId: t.id,
        topicName: t.name,
        score,
        atRisk: isAtRisk(score, trend),
      };
    });

    const archetype = studentArchetype(topicMastery);

    const overall =
      topicMastery.length > 0
        ? topicMastery.reduce((sum, t) => sum + t.score, 0) / topicMastery.length
        : 0.5;

    const atRiskTopics = topicMastery.filter((t) => t.atRisk).map((t) => t.topicName);

    return {
      id: s.id,
      name: s.name,
      archetype,
      topicMastery,
      overall,
      atRiskTopics,
      isAtRisk: atRiskTopics.length > 0,
    };
  });

  const classAverage =
    shaped.length > 0 ? shaped.reduce((sum, s) => sum + s.overall, 0) / shaped.length : 0;
  const atRiskCount = shaped.filter((s) => s.archetype === "Needs Support").length;
  const needsAttentionCount = shaped.filter(
    (s) => s.archetype === "Uneven — targeted help needed"
  ).length;
  const decliningCount = shaped.filter((s) => s.isAtRisk).length;

  const topicStats: TopicStats[] = topics.map((t) => {
    const scores = shaped.map(
      (s) => s.topicMastery.find((tm) => tm.topicId === t.id)?.score ?? 0.5
    );
    const avgMastery = scores.length > 0 ? scores.reduce((sum, x) => sum + x, 0) / scores.length : 0.5;
    const pctStruggling =
      scores.length > 0 ? scores.filter((x) => x < 0.5).length / scores.length : 0;
    const variance =
      scores.length > 0
        ? scores.reduce((sum, x) => sum + (x - avgMastery) ** 2, 0) / scores.length
        : 0;
    const stdMastery = Math.sqrt(variance);

    return { topicId: t.id, topicName: t.name, avgMastery, pctStruggling, stdMastery };
  });

  const topicPriority = rankTopicsByPriority(topicStats);

  return NextResponse.json({
    students: shaped.map(({ id, name, archetype, topicMastery, atRiskTopics, isAtRisk }) => ({
      id,
      name,
      archetype,
      topicMastery,
      atRiskTopics,
      isAtRisk,
    })),
    classAverage,
    atRiskCount,
    needsAttentionCount,
    decliningCount,
    topicPriority,
  });
}
