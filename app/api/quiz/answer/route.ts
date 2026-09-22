import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateMastery } from "@/lib/adaptive-engine";
import { getStudentTopicMastery } from "@/lib/student-data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, questionId, selectedIdx } = body as {
    studentId?: string;
    questionId?: string;
    selectedIdx?: number;
  };

  if (!studentId || !questionId || typeof selectedIdx !== "number") {
    return NextResponse.json(
      { error: "studentId, questionId and selectedIdx are required" },
      { status: 400 }
    );
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { topic: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const correct = selectedIdx === question.answerIdx;

  await prisma.attempt.create({
    data: { studentId, questionId, correct },
  });

  const existingMastery = await prisma.mastery.findUnique({
    where: { studentId_topicId: { studentId, topicId: question.topicId } },
  });
  const currentScore = existingMastery?.score ?? 0.5;
  const newScore = updateMastery(currentScore, correct);

  await prisma.mastery.upsert({
    where: { studentId_topicId: { studentId, topicId: question.topicId } },
    update: { score: newScore },
    create: { studentId, topicId: question.topicId, score: newScore },
  });

  const updatedMastery = await getStudentTopicMastery(studentId);

  return NextResponse.json({
    correct,
    correctIdx: question.answerIdx,
    priorScore: currentScore,
    newScore,
    scoreDelta: newScore - currentScore,
    topicName: question.topic.name,
    updatedMastery,
  });
}
