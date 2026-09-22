import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CLASS_LABEL } from "@/lib/brand";
import { getStudentTopicMastery, overallMastery, getStudentWeakTopics } from "@/lib/student-data";
import { computeGamification } from "@/lib/gamification";
import { getStudentAssignments } from "@/lib/assignments";

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
  const weakTopics = await getStudentWeakTopics(id);
  const questionCount = await prisma.question.count();

  const allAttempts = await prisma.attempt.findMany({
    where: { studentId: id },
    select: { correct: true, createdAt: true },
  });

  const attempts = await prisma.attempt.findMany({
    where: { studentId: id },
    include: { question: { include: { topic: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const totalAttempts = allAttempts.length;
  const correctAttempts = allAttempts.filter((a) => a.correct).length;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  const recentAttempts = attempts.map((a) => ({
    id: a.id,
    questionText: a.question.text,
    topicName: a.question.topic.name,
    difficulty: a.question.difficulty,
    correct: a.correct,
    createdAt: a.createdAt,
  }));

  return NextResponse.json({
    name: student.name,
    className: CLASS_LABEL,
    overallMastery: overallMastery(topicMastery),
    topicMastery,
    hasNextQuestion: questionCount > 0,
    weakTopicCount: weakTopics.length,
    totalAttempts,
    accuracy,
    recentAttempts,
    gamification: computeGamification(allAttempts, topicMastery),
    assignments: await getStudentAssignments(id),
  });
}
