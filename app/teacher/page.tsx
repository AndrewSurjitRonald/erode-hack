"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ArchetypeDonut } from "@/components/ArchetypeDonut";
import { bandForScore, MASTERY_COLORS } from "@/lib/colors";
import { topicIcon } from "@/lib/topic-icons";
import { IconUsers, IconTrendingUp, IconAlertTriangle, IconUser } from "@/lib/icons";

type TopicMastery = { topicId: string; topicName: string; score: number };
type StudentRow = { id: string; name: string; archetype: string; topicMastery: TopicMastery[] };
type DashboardData = {
  students: StudentRow[];
  classAverage: number;
  atRiskCount: number;
  needsAttentionCount: number;
};

function StatCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactElement;
  tone?: "default" | "danger" | "warning";
}) {
  const toneClasses =
    tone === "danger"
      ? "bg-red-50 text-red-600"
      : tone === "warning"
      ? "bg-amber-50 text-amber-700"
      : "bg-primary/10 text-primary";
  return (
    <div className="rounded-xl border border-border p-5 flex items-center gap-4">
      <span className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${toneClasses}`}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-dark leading-none">{value}</p>
        <p className="text-sm text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}

function MasteryCell({ score }: { score: number }) {
  const colors = MASTERY_COLORS[bandForScore(score)];
  const pct = Math.round(score * 100);
  return (
    <td className="p-1.5">
      <div
        className="rounded-lg h-10 flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: colors.bg, color: colors.text }}
        title={`${pct}% — ${colors.label}`}
      >
        {pct}%
      </div>
    </td>
  );
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicNames, setTopicNames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashboardData) => {
        setData(d);
        const names = d.students[0]?.topicMastery.map((t) => t.topicName) ?? [];
        setTopicNames(names);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1">
      <Sidebar variant="teacher" activeItem="dashboard" />
      <main className="flex-1 px-6 sm:px-10 py-8 max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-dark">Class Dashboard</h1>
            <p className="text-muted mt-1">Overview of class performance and learning trends.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-border bg-white px-3.5 py-2 text-sm font-semibold text-dark outline-none focus:border-primary"
              defaultValue="8a"
            >
              <option value="8a">Class 8 - A</option>
            </select>
            <span className="text-sm text-muted font-medium">Last 30 days</span>
          </div>
        </header>

        {loading && (
          <div className="animate-pulse flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-card-bg rounded-xl" />
              ))}
            </div>
            <div className="h-80 bg-card-bg rounded-xl" />
          </div>
        )}

        {!loading && data && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Students" value={String(data.students.length)} icon={<IconUsers className="w-5 h-5" />} />
              <StatCard
                label="Class Average"
                value={`${Math.round(data.classAverage * 100)}%`}
                icon={<IconTrendingUp className="w-5 h-5" />}
              />
              <StatCard
                label="At Risk"
                value={String(data.atRiskCount)}
                icon={<IconAlertTriangle className="w-5 h-5" />}
                tone="danger"
              />
              <StatCard
                label="Need Attention"
                value={String(data.needsAttentionCount)}
                icon={<IconUser className="w-5 h-5" />}
                tone="warning"
              />
            </div>

            {data.students.length === 0 ? (
              <div className="rounded-xl bg-card-bg border border-border p-10 text-center">
                <p className="font-bold text-dark mb-1">No students yet</p>
                <p className="text-sm text-muted">
                  Have a student sign in and take the quiz to populate this dashboard.
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
                <section className="rounded-xl border border-border p-5 overflow-x-auto">
                  <h2 className="font-bold text-dark mb-1">Topic Mastery Heatmap</h2>
                  <p className="text-sm text-muted mb-4">Click a student to see their full profile.</p>
                  <table className="w-full border-separate border-spacing-0 min-w-[480px]">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-bold text-muted pb-2 pl-1">Student</th>
                        {topicNames.map((name) => (
                          <th key={name} className="text-center text-xs font-bold text-muted pb-2 px-1">
                            <span className="mr-1">{topicIcon(name)}</span>
                            {name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.students.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => router.push(`/teacher/students/${s.id}`)}
                          className="cursor-pointer hover:bg-card-bg transition-colors"
                        >
                          <td className="py-1.5 pl-2 pr-3 whitespace-nowrap font-semibold text-sm text-dark">
                            {s.name}
                          </td>
                          {s.topicMastery.map((t) => (
                            <MasteryCell key={t.topicId} score={t.score} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-muted">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#3FA34D]" /> Strong (≥70%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" /> Needs Practice (40-70%)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E76F51]" /> Weak (&lt;40%)
                    </span>
                  </div>
                </section>

                <section className="rounded-xl border border-border p-5">
                  <h2 className="font-bold text-dark mb-1">Student Learning Archetypes</h2>
                  <p className="text-sm text-muted mb-4">Based on mastery patterns.</p>
                  <ArchetypeDonut students={data.students} />
                </section>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
