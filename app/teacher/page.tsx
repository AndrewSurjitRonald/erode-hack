"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ArchetypeDonut } from "@/components/ArchetypeDonut";
import { bandForScore, MASTERY_COLORS } from "@/lib/colors";
import { useI18n } from "@/lib/i18n";
import { IconUsers, IconTrendingUp, IconAlertTriangle, IconUser, IconFlag } from "@/lib/icons";

type TopicMastery = { topicId: string; topicName: string; score: number; atRisk: boolean };
type StudentRow = {
  id: string;
  name: string;
  archetype: string;
  topicMastery: TopicMastery[];
  atRiskTopics: string[];
  isAtRisk: boolean;
};
type DashboardData = {
  students: StudentRow[];
  classAverage: number;
  atRiskCount: number;
  needsAttentionCount: number;
  decliningCount: number;
};

function StatCard({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  icon: React.ReactElement;
  tone?: "blue" | "green" | "danger" | "warning";
}) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
    warning: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 flex items-center gap-4 shadow-xs">
      <span className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${toneClasses}`}>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-[#0F172A] leading-none">{value}</p>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

function MasteryCell({ score }: { score: number }) {
  const colors = MASTERY_COLORS[bandForScore(score)];
  const pct = Math.round(score * 100);
  return (
    <td className="p-1.5 text-center">
      <div
        className="rounded-xl h-9 px-3 flex items-center justify-center font-bold text-xs sm:text-sm transition-all"
        style={{ backgroundColor: colors.softBg, color: colors.text }}
        title={`${pct}% — ${colors.label}`}
      >
        {pct}%
      </div>
    </td>
  );
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topicNames, setTopicNames] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`dashboard ${r.status}`);
        return r.json();
      })
      .then((d: DashboardData) => {
        setData(d);
        setTopicNames(d.students[0]?.topicMastery.map((tItem) => tItem.topicName) ?? []);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="teacher" activeItem="dashboard" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-7xl">
        {/* Header with Filters */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {t("class_dashboard")}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              {t("overview_trends")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs">
              {t("class_label")}
            </span>
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-700 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live data
            </span>
          </div>
        </header>

        {loading && <SkeletonTeacher />}

        {!loading && loadError && (
          <div className="rounded-2xl bg-white border border-red-200 p-10 text-center shadow-xs">
            <p className="font-bold text-[#0F172A] mb-1">Couldn&apos;t load class data</p>
            <p className="text-sm text-slate-500">Check that the server and database are running, then refresh.</p>
          </div>
        )}

        {!loading && data && data.students.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-xs">
            <p className="font-bold text-[#0F172A] mb-1">No students yet</p>
            <p className="text-sm text-slate-500">Students appear here once they sign in and start practicing.</p>
          </div>
        )}

        {!loading && data && data.students.length > 0 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                label={t("students")}
                value={String(data.students.length)}
                icon={<IconUsers className="w-5 h-5" />}
                tone="blue"
              />
              <StatCard
                label={t("class_average")}
                value={`${Math.round(data.classAverage * 100)}%`}
                icon={<IconTrendingUp className="w-5 h-5" />}
                tone="green"
              />
              <StatCard
                label={t("at_risk")}
                value={String(data.atRiskCount)}
                icon={<IconAlertTriangle className="w-5 h-5" />}
                tone="danger"
              />
              <StatCard
                label={t("need_attention")}
                value={String(data.needsAttentionCount)}
                icon={<IconUser className="w-5 h-5" />}
                tone="warning"
              />
              <StatCard
                label="Declining trend"
                value={String(data.decliningCount ?? 0)}
                icon={<IconFlag className="w-5 h-5" />}
                tone="danger"
              />
            </div>

            {/* Main Content Grid: Heatmap + Archetypes */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Heatmap Card */}
              <section
                id="students"
                className="lg:col-span-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs overflow-hidden scroll-mt-6"
              >
                <div className="mb-4">
                  <h2 className="font-bold text-[#0F172A] text-lg">{t("heatmap_title")}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Click a student to view their detailed learning path drilldown.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-2 min-w-[500px]">
                    <thead>
                      <tr>
                        <th className="text-left text-xs font-bold text-slate-400 pb-2 pl-3">
                          {t("students")}
                        </th>
                        {topicNames.map((name) => (
                          <th
                            key={name}
                            className="text-center text-xs font-bold text-slate-400 pb-2 px-2"
                          >
                            {name === "Linear Equations" ? "Linear Eq." : name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.students.map((s) => (
                        <tr
                          key={s.id}
                          onClick={() => router.push(`/teacher/students/${s.id}`)}
                          className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-2 pl-3 pr-4 whitespace-nowrap font-bold text-sm text-[#0F172A] group-hover:text-blue-600 transition-colors">
                            <span className="inline-flex items-center gap-1.5">
                              {s.name}
                              {s.isAtRisk && (
                                <span
                                  title={`Declining trend: ${s.atRiskTopics.join(", ")}`}
                                  className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-red-50 text-red-600"
                                >
                                  <IconFlag className="w-3 h-3" />
                                </span>
                              )}
                            </span>
                          </td>
                          {s.topicMastery.map((tItem) => (
                            <MasteryCell key={tItem.topicId} score={tItem.score} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Heatmap Legend */}
                <div className="flex flex-wrap items-center gap-6 mt-5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Strong (≥ 70%)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Needs Practice (40-70%)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> Weak (&lt; 40%)
                  </span>
                </div>
              </section>

              {/* Archetypes Card */}
              <section className="lg:col-span-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
                <div className="mb-4">
                  <h2 className="font-bold text-[#0F172A] text-lg">
                    {t("archetypes_title")}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Clustered by skill &amp; attempt patterns.
                  </p>
                </div>

                <ArchetypeDonut students={data.students} />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonTeacher() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-96 bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-4 h-96 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
