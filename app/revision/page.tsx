"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getStudentId } from "@/lib/session";
import { topicIcon } from "@/lib/topic-icons";
import { IconChevronRight, IconCheckCircle } from "@/lib/icons";

type WeakTopic = {
  topicId: string;
  topicName: string;
  mastery: number;
  status: "Weak" | "Needs Practice";
  recentAccuracy: string;
};

const STATUS_STYLE: Record<WeakTopic["status"], string> = {
  Weak: "bg-red-100 text-red-600",
  "Needs Practice": "bg-amber-100 text-amber-700",
};

const HOW_IT_WORKS = [
  "Get targeted practice questions",
  "Revisit these topics after a few days",
  "Track improvement over time",
];

export default function RevisionPage() {
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = getStudentId();
    if (!id) {
      router.replace("/");
      return;
    }
    fetch(`/api/revision?studentId=${id}`)
      .then((r) => r.json())
      .then((data) => setWeakTopics(data.weakTopics))
      .finally(() => setLoading(false));
  }, [router]);

  const topPick = weakTopics && weakTopics.length > 0 ? weakTopics[0] : null;

  return (
    <div className="flex flex-1">
      <Sidebar variant="student" activeItem="revision" />
      <main className="flex-1 px-6 sm:px-10 py-8 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-dark">Your Revision Plan</h1>
          <p className="text-muted mt-1">Focused practice for your weak topics.</p>
        </header>

        {loading && (
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-20 bg-card-bg rounded-xl" />
            <div className="h-20 bg-card-bg rounded-xl" />
          </div>
        )}

        {!loading && weakTopics && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {weakTopics.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide mb-3">
                  Topics to Focus On
                </h2>
                <div className="flex flex-col gap-3">
                  {weakTopics.map((t) => (
                    <Link
                      key={t.topicId}
                      href={`/practice?topic=${t.topicId}`}
                      className="flex items-center gap-4 rounded-xl border border-border p-4 hover:border-primary hover:shadow-sm transition-all"
                    >
                      <span className="shrink-0 w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
                        {topicIcon(t.topicName)}
                      </span>
                      <div className="flex-1">
                        <p className="font-bold text-dark">{t.topicName}</p>
                        <p className="text-sm text-muted">Current mastery: {t.mastery}%</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${
                          STATUS_STYLE[t.status]
                        }`}
                      >
                        {t.status}
                      </span>
                      <IconChevronRight className="w-5 h-5 text-muted shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {weakTopics.length === 0 && (
              <div className="rounded-xl bg-card-bg border border-border p-10 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="font-bold text-dark mb-1">No weak topics right now</p>
                <p className="text-sm text-muted max-w-sm mx-auto">
                  Keep practicing — we&apos;ll flag topics here once we have enough data on you.
                </p>
              </div>
            )}

            <div className="rounded-xl bg-accent/10 border border-accent/30 p-5">
              <p className="font-bold text-dark mb-3">How it works</p>
              <ul className="flex flex-col gap-2">
                {HOW_IT_WORKS.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-ink">
                    <IconCheckCircle className="w-4 h-4 text-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={topPick ? `/practice?topic=${topPick.topicId}` : "/practice"}
              className="w-full text-center rounded-xl bg-primary text-white font-bold py-3.5 hover:bg-dark transition-colors"
            >
              Start Revision →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
