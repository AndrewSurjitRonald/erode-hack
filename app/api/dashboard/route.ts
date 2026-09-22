import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentArchetype } from "@/lib/archetype";

export async function GET() {
  const topics = await prisma.topic.findMany({ orderBy: { name: "asc" } });
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { mastery: true },
  });

  const shaped = students.map((s) => {
    const masteryByTopic: Record<string, number> = {};
    for (const m of s.mastery) masteryByTopic[m.topicId] = m.score;

    const topicMastery = topics.map((t) => ({
      topicId: t.id,
      topicName: t.name,
      score: masteryByTopic[t.id] ?? 0.5,
    }));

    const archetype = studentArchetype(topicMastery);

    const overall =
      topicMastery.length > 0
        ? topicMastery.reduce((sum, t) => sum + t.score, 0) / topicMastery.length
        : 0.5;

    return { id: s.id, name: s.name, archetype, topicMastery, overall };
  });

  const classAverage =
    shaped.length > 0 ? shaped.reduce((sum, s) => sum + s.overall, 0) / shaped.length : 0;
  const atRiskCount = shaped.filter((s) => s.archetype === "Needs Support").length;
  const needsAttentionCount = shaped.filter(
    (s) => s.archetype === "Uneven — targeted help needed"
  ).length;

  return NextResponse.json({
    students: shaped.map(({ id, name, archetype, topicMastery }) => ({
      id,
      name,
      archetype,
      topicMastery,
    })),
    classAverage,
    atRiskCount,
    needsAttentionCount,
  });
}
