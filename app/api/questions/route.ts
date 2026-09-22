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
    const cleanOptions = options.map((o: unknown) => String(o ?? "").trim());
    if (cleanOptions.length < 2 || cleanOptions.some((o: string) => !o)) {
      return NextResponse.json({ error: "Provide at least 2 non-empty options" }, { status: 400 });
    }
    const idx = Number(answerIdx);
    if (!Number.isInteger(idx) || idx < 0 || idx >= cleanOptions.length) {
      return NextResponse.json({ error: "answerIdx must point to one of the options" }, { status: 400 });
    }
    const topic = await prisma.topic.findUnique({ where: { id: String(topicId) } });
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 400 });
    }

    const created = await prisma.question.create({
      data: {
        topicId: topic.id,
        text: String(text).trim(),
        options: cleanOptions,
        textTa: typeof textTa === "string" ? textTa : "",
        optionsTa: Array.isArray(optionsTa) ? optionsTa : [],
        answerIdx: idx,
        difficulty: [1, 2, 3].includes(Number(difficulty)) ? Number(difficulty) : 1,
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
