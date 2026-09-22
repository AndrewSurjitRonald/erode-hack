import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  let student = await prisma.student.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    orderBy: { attempts: { _count: "desc" } },
  });

  if (!student) {
    const created = await prisma.student.create({ data: { name } });
    const topics = await prisma.topic.findMany();
    await prisma.mastery.createMany({
      data: topics.map((t) => ({ studentId: created.id, topicId: t.id, score: 0.5 })),
    });
    student = created;
  }

  return NextResponse.json({ id: student.id, name: student.name });
}

export async function GET() {
  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: { mastery: true },
  });
  const topicCount = await prisma.topic.count();

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      // Topics without a mastery row count as the 0.5 starting estimate, matching getStudentTopicMastery
      overallMastery:
        topicCount > 0
          ? (s.mastery.reduce((sum, m) => sum + m.score, 0) + (topicCount - s.mastery.length) * 0.5) /
            topicCount
          : 0.5,
    })),
  });
}
