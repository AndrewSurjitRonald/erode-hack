"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MasteryRing } from "@/components/MasteryRing";
import { getStudentId, getStudentName } from "@/lib/session";
import { CLASS_LABEL } from "@/lib/brand";
import { topicIcon } from "@/lib/topic-icons";
import { IconBookOpen, IconFileText, IconArrowRight, IconMountain } from "@/lib/icons";

type Summary = {
  name: string;
  className: string;
  overallMastery: number;
  topicMastery: { topicId: string; topicName: string; score: number }[];
  hasNextQuestion: boolean;
  weakTopicCount: number;
};

function encouragement(score: number): string {
  if (score >= 0.8) return "Outstanding work! You're mastering this. 🌟";
  if (score >= 0.6) return "You're doing great! Keep going.";
  if (score >= 0.4) return "Solid progress — keep practicing.";
  return "Every question helps. Let's keep building!";
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getStudentId();
    if (!id) {
      router.replace("/");
      return;
    }
    fetch(`/api/student/${id}/summary`)
      .then((r) => r.json())
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex flex-1">
      <Sidebar variant="student" activeItem="home" />
      <main className="flex-1 px-6 sm:px-10 py-8 max-w-6xl">
        {loading && <SkeletonHome />}

        {!loading && summary && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <header className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-dark">
                  Welcome back, {getStudentName() ?? summary.name}! 👋
                </h1>
                <p className="text-muted mt-1">Let&apos;s continue your learning journey.</p>
              </div>
              <span className="rounded-full bg-card-bg border border-border px-4 py-1.5 text-sm font-bold text-primary whitespace-nowrap">
                {CLASS_LABEL}
              </span>
            </header>

            <div className="grid md:grid-cols-2 gap-5">
              <section className="rounded-xl bg-card-bg border border-border p-6 flex flex-col items-center text-center gap-3">
                <h2 className="font-bold text-dark self-start">Your Learning Progress</h2>
                <MasteryRing score={summary.overallMastery} size={140} strokeWidth={12} />
                <p className="font-bold text-dark">Overall Mastery</p>
                <p className="text-sm text-muted">{encouragement(summary.overallMastery)}</p>
              </section>

              <section className="rounded-xl bg-card-bg border border-border p-6">
                <h2 className="font-bold text-dark mb-4">Topic Mastery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {summary.topicMastery.map((t) => (
                    <MasteryRing
                      key={t.topicId}
                      score={t.score}
                      size={78}
                      strokeWidth={7}
                      label={`${topicIcon(t.topicName)} ${t.topicName}`}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Link
                href="/practice"
                className="group rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all flex flex-col gap-3"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary">
                  <IconBookOpen className="w-5 h-5" />
                </span>
                <p className="font-bold text-dark">Continue Practice</p>
                <p className="text-sm text-muted flex-1">
                  {summary.hasNextQuestion
                    ? "Next question is ready for you!"
                    : "No questions available right now."}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                  Start Practice
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>

              <Link
                href="/revision"
                className="group rounded-xl border border-border p-6 hover:border-primary hover:shadow-md transition-all flex flex-col gap-3"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-secondary/10 text-secondary">
                  <IconFileText className="w-5 h-5" />
                </span>
                <p className="font-bold text-dark">Revision Plan</p>
                <p className="text-sm text-muted flex-1">
                  {summary.weakTopicCount} weak topic{summary.weakTopicCount === 1 ? "" : "s"}{" "}
                  need your attention
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                  View Revision Plan
                  <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            <div className="rounded-xl bg-dark text-white p-6 flex items-center gap-5 mt-2">
              <IconMountain className="w-12 h-12 text-accent shrink-0" />
              <div>
                <p className="font-bold">Practice today for a better tomorrow.</p>
                <p className="text-sm text-white/60 mt-0.5">
                  A little progress each day adds up to big results.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonHome() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-card-bg rounded-lg" />
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-64 bg-card-bg rounded-xl" />
        <div className="h-64 bg-card-bg rounded-xl" />
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="h-40 bg-card-bg rounded-xl" />
        <div className="h-40 bg-card-bg rounded-xl" />
      </div>
    </div>
  );
}
