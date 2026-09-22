"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { bandForScore, MASTERY_COLORS } from "@/lib/colors";
import { topicIcon } from "@/lib/topic-icons";
import { IconChevronRight, IconLightbulb, IconCheck, IconX } from "@/lib/icons";

type TopicMastery = { topicId: string; topicName: string; score: number };
type Attempt = { id: string; topicName: string; difficulty: number; correct: boolean; createdAt: string };
type WeakTopic = { topicId: string; topicName: string; mastery: number; status: "Weak" | "Needs Practice" };

type StudentDetail = {
  name: string;
  className: string;
  status: string;
  overallMastery: number;
  questionsAttempted: number;
  accuracy: number;
  topicMastery: TopicMastery[];
  recentAttempts: Attempt[];
  weakTopics: WeakTopic[];
  insights: string[];
};

const STATUS_STYLE: Record<string, string> = {
  "On Track": "bg-primary/10 text-primary",
  "Needs Support": "bg-red-100 text-red-600",
  "Uneven — targeted help needed": "bg-[#6C63FF]/10 text-[#6C63FF]",
};

const TABS = ["Mastery", "Attempt History", "Revision Plan", "Insights"] as const;
type Tab = (typeof TABS)[number];

function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="rounded-xl bg-accent/10 border border-accent/30 p-5">
      <p className="flex items-center gap-2 font-bold text-dark mb-3">
        <IconLightbulb className="w-5 h-5 text-secondary" /> AI Insights
      </p>
      <ul className="flex flex-col gap-2.5">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-ink">
            <IconCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            {insight}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Mastery");

  useEffect(() => {
    fetch(`/api/dashboard/student/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setDetail)
      .catch(() => router.replace("/teacher"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  return (
    <div className="flex flex-1">
      <Sidebar variant="teacher" activeItem="students" />
      <main className="flex-1 px-6 sm:px-10 py-8 max-w-4xl">
        <button
          onClick={() => router.push("/teacher")}
          className="text-sm font-bold text-primary hover:underline mb-5"
        >
          ← Back to Students
        </button>

        {loading && (
          <div className="animate-pulse flex flex-col gap-5">
            <div className="h-20 bg-card-bg rounded-xl" />
            <div className="h-64 bg-card-bg rounded-xl" />
          </div>
        )}

        {!loading && detail && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <header className="flex flex-wrap items-center gap-5 rounded-xl border border-border p-5">
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-extrabold shrink-0">
                {detail.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-[160px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-extrabold text-lg text-dark">{detail.name}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      STATUS_STYLE[detail.status] ?? "bg-card-bg text-muted"
                    }`}
                  >
                    {detail.status}
                  </span>
                </div>
                <p className="text-sm text-muted">{detail.className}</p>
              </div>
              <div className="flex gap-6">
                <Stat label="Overall Mastery" value={`${Math.round(detail.overallMastery * 100)}%`} />
                <Stat label="Questions Attempted" value={String(detail.questionsAttempted)} />
                <Stat label="Accuracy" value={`${Math.round(detail.accuracy * 100)}%`} />
              </div>
            </header>

            <div className="flex gap-1 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${
                    tab === t
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-dark"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Mastery" && (
              <div className="grid md:grid-cols-[1fr_280px] gap-5">
                <div className="rounded-xl border border-border p-5 flex flex-col gap-4">
                  {detail.topicMastery.map((t) => {
                    const colors = MASTERY_COLORS[bandForScore(t.score)];
                    const pct = Math.round(t.score * 100);
                    return (
                      <div key={t.topicId}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-semibold text-ink">
                            {topicIcon(t.topicName)} {t.topicName}
                          </span>
                          <span className="font-bold" style={{ color: colors.bg }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-card-bg overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%`, backgroundColor: colors.bg }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <InsightsCard insights={detail.insights} />
              </div>
            )}

            {tab === "Attempt History" && (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-card-bg">
                    <tr>
                      <th className="text-left font-bold text-muted px-4 py-2.5">Topic</th>
                      <th className="text-left font-bold text-muted px-4 py-2.5">Difficulty</th>
                      <th className="text-left font-bold text-muted px-4 py-2.5">Result</th>
                      <th className="text-left font-bold text-muted px-4 py-2.5">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recentAttempts.map((a) => (
                      <tr key={a.id} className="border-t border-border">
                        <td className="px-4 py-2.5 font-medium text-ink">
                          {topicIcon(a.topicName)} {a.topicName}
                        </td>
                        <td className="px-4 py-2.5 text-muted">d{a.difficulty}</td>
                        <td className="px-4 py-2.5">
                          {a.correct ? (
                            <span className="inline-flex items-center gap-1 text-secondary font-bold">
                              <IconCheck className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                              <IconX className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {detail.recentAttempts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-muted">
                          No attempts recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "Revision Plan" && (
              <div className="flex flex-col gap-3">
                {detail.weakTopics.length === 0 && (
                  <div className="rounded-xl bg-card-bg border border-border p-8 text-center text-muted">
                    🎉 No weak topics — great progress!
                  </div>
                )}
                {detail.weakTopics.map((t) => (
                  <div
                    key={t.topicId}
                    className="flex items-center gap-4 rounded-xl border border-border p-4"
                  >
                    <span className="shrink-0 w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl">
                      {topicIcon(t.topicName)}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-dark">{t.topicName}</p>
                      <p className="text-sm text-muted">Current mastery: {t.mastery}%</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        t.status === "Weak" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    <IconChevronRight className="w-5 h-5 text-muted shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {tab === "Insights" && (
              <div className="max-w-2xl">
                <InsightsCard insights={detail.insights} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="text-xl font-extrabold text-dark leading-none">{value}</p>
      <p className="text-xs text-muted mt-1 whitespace-nowrap">{label}</p>
    </div>
  );
}
