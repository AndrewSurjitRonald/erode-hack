import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudentAssignments } from "@/lib/assignments";

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }
  return NextResponse.json({ assignments: await getStudentAssignments(studentId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const topicId = typeof body?.topicId === "string" ? body.topicId : "";
  const studentId = typeof body?.studentId === "string" && body.studentId ? body.studentId : null;
  const questionCount = Number.isInteger(body?.questionCount) ? Math.min(Math.max(body.questionCount, 1), 20) : 5;

  if (!topicId) {
    return NextResponse.json({ error: "topicId is required" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  let studentName: string | null = null;
  if (studentId) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    studentName = student.name;
  }

  const created = await prisma.assignment.create({
    data: { topicId, studentId, questionCount },
  });

  return NextResponse.json(
    { id: created.id, topicName: topic.name, studentName, questionCount: created.questionCount },
    { status: 201 }
  );
}
