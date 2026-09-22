import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLASS_LABEL } from "@/lib/brand";
import { getStudentTopicMastery, overallMastery, getStudentWeakTopics } from "@/lib/student-data";
import { studentArchetype } from "@/lib/archetype";
import { generateInsights } from "@/lib/insights";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const topicMastery = await getStudentTopicMastery(id);
  const weak = await getStudentWeakTopics(id);

  const attempts = await prisma.attempt.findMany({
    where: { studentId: id },
    include: { question: { include: { topic: true } } },
    orderBy: { createdAt: "desc" },
  });

  const questionsAttempted = attempts.length;
  const correctCount = attempts.filter((a) => a.correct).length;
  const accuracy = questionsAttempted > 0 ? correctCount / questionsAttempted : 0;

  const recentOldestFirst = [...attempts].reverse().map((a) => a.correct).slice(-10);
  const insights = generateInsights(topicMastery, recentOldestFirst);

  return NextResponse.json({
    name: student.name,
    className: CLASS_LABEL,
    status: studentArchetype(topicMastery),
    overallMastery: overallMastery(topicMastery),
    questionsAttempted,
    accuracy,
    topicMastery,
    recentAttempts: attempts.slice(0, 30).map((a) => ({
      id: a.id,
      topicName: a.question.topic.name,
      difficulty: a.question.difficulty,
      correct: a.correct,
      createdAt: a.createdAt,
    })),
    weakTopics: weak.map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      mastery: Math.round(t.score * 100),
      status: t.score < 0.4 ? "Weak" : "Needs Practice",
    })),
    insights,
  });
}
