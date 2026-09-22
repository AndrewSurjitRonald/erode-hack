import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentWeakTopics } from "@/lib/student-data";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const weak = await getStudentWeakTopics(studentId);

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
