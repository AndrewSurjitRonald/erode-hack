import { prisma } from "@/lib/prisma";

export type AssignmentView = {
  id: string;
  topicId: string;
  topicName: string;
  topicNameTa: string;
  scope: "class" | "student";
  questionCount: number;
  completedCount: number;
  done: boolean;
  createdAt: Date;
};

/**
 * Assignments visible to a student (their own plus whole-class ones), newest first,
 * with progress = questions attempted on that topic since the assignment was made.
 */
export async function getStudentAssignments(studentId: string, limit = 10): Promise<AssignmentView[]> {
  const assignments = await prisma.assignment.findMany({
    where: { OR: [{ studentId }, { studentId: null }] },
    include: { topic: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  if (assignments.length === 0) return [];

  const oldest = assignments[assignments.length - 1].createdAt;
  const attempts = await prisma.attempt.findMany({
    where: { studentId, createdAt: { gte: oldest } },
    select: { createdAt: true, question: { select: { topicId: true } } },
  });

  return assignments.map((a) => {
    const completedCount = attempts.filter(
      (at) => at.question.topicId === a.topicId && at.createdAt >= a.createdAt
    ).length;
    return {
      id: a.id,
      topicId: a.topicId,
      topicName: a.topic.name,
      topicNameTa: a.topic.nameTa,
      scope: a.studentId ? "student" : "class",
      questionCount: a.questionCount,
      completedCount: Math.min(completedCount, a.questionCount),
      done: completedCount >= a.questionCount,
      createdAt: a.createdAt,
    };
  });
}
