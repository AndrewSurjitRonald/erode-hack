import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentWeakTopics, getStudentTopicMastery } from "@/lib/student-data";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  let weak = await getStudentWeakTopics(studentId);
  if (weak.length === 0) {
    const allTopics = await getStudentTopicMastery(studentId);
    const unmastered = allTopics
      .filter((t) => t.score < 0.8)
      .sort((a, b) => a.score - b.score);
    weak = unmastered.map((t) => ({
      topicId: t.topicId,
      topicName: t.topicName,
      score: t.score,
      attemptCount: 0,
    }));
  }

  const attempts = await prisma.attempt.findMany({
    where: { studentId },
    include: { question: true },
  });

  const weakTopics = weak.map((t) => {
    const topicAttempts = attempts.filter((a) => a.question.topicId === t.topicId);
    const correct = topicAttempts.filter((a) => a.correct).length;
    const recentAccuracy =
      topicAttempts.length > 0
        ? `${Math.round((correct / topicAttempts.length) * 100)}%`
        : "—";

    return {
      topicId: t.topicId,
      topicName: t.topicName,
      mastery: Math.round(t.score * 100),
      status: t.score < 0.4 ? ("Weak" as const) : ("Needs Practice" as const),
      recentAccuracy,
    };
  });

  return NextResponse.json({ weakTopics });
}
