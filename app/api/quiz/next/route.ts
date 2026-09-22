import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNextQuestion } from "@/lib/quiz-service";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  const topicId = req.nextUrl.searchParams.get("topicId") ?? undefined;

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 401 });
  }

  const payload = await getNextQuestion(studentId, topicId);
  if (!payload) {
    return NextResponse.json({ error: "No question available" }, { status: 404 });
  }

  return NextResponse.json(payload);
}
