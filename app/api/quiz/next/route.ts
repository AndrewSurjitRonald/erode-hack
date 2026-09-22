import { NextRequest, NextResponse } from "next/server";
import { getNextQuestion } from "@/lib/quiz-service";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  const topicId = req.nextUrl.searchParams.get("topicId") ?? undefined;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const payload = await getNextQuestion(studentId, topicId);
  if (!payload) {
    return NextResponse.json({ error: "No question available" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
