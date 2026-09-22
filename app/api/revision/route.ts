import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentWeakTopics, getStudentTopicMastery } from "@/lib/student-data";
import { predictAttemptsToMastery } from "@/lib/ml/time-to-mastery-model";

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

  const topics = await prisma.topic.findMany();
  const nameTaById = new Map(topics.map((topic) => [topic.id, topic.nameTa]));

  const weakTopics = weak.map((t) => {
    const topicAttempts = attempts.filter((a) => a.question.topicId === t.topicId);
    const correct = topicAttempts.filter((a) => a.correct).length;
    const aptitude = topicAttempts.length > 0 ? correct / topicAttempts.length : t.score;
    const recentAccuracy =
      topicAttempts.length > 0
        ? `${Math.round((correct / topicAttempts.length) * 100)}%`
        : "—";
    const attemptsToMastery = predictAttemptsToMastery(t.score, aptitude);

    return {
      topicId: t.topicId,
      topicName: t.topicName,
      topicNameTa: nameTaById.get(t.topicId) ?? "",
      mastery: Math.round(t.score * 100),
      status: t.score < 0.4 ? ("Weak" as const) : ("Needs Practice" as const),
      recentAccuracy,
      attemptsToMastery,
    };
  });

  return NextResponse.json({ weakTopics });
}
