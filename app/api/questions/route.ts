import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({
    include: {
      topic: true,
      attempts: {
        select: { correct: true },
      },
    },
    orderBy: [{ topic: { name: "asc" } }, { difficulty: "asc" }],
  });

  const formatted = questions.map((q) => {
    const totalAttempts = q.attempts.length;
    const correctAttempts = q.attempts.filter((a) => a.correct).length;
    const passRate = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : null;

    return {
      id: q.id,
      topicId: q.topicId,
      topicName: q.topic.name,
      text: q.text,
      options: q.options,
      textTa: q.textTa,
      optionsTa: q.optionsTa,
      answerIdx: q.answerIdx,
      difficulty: q.difficulty,
      totalAttempts,
      passRate,
    };
  });

  return NextResponse.json({ questions: formatted });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topicId, text, options, textTa, optionsTa, answerIdx, difficulty } = body;

    if (!topicId || !text || !Array.isArray(options) || answerIdx === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.question.create({
      data: {
        topicId,
        text: String(text).trim(),
        options,
        textTa: typeof textTa === "string" ? textTa : "",
        optionsTa: Array.isArray(optionsTa) ? optionsTa : [],
        answerIdx: Number(answerIdx),
        difficulty: Number(difficulty) || 1,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create question" },
      { status: 500 }
    );
  }
}
