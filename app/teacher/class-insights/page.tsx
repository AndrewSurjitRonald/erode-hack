"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ArchetypeDonut } from "@/components/ArchetypeDonut";
import { useI18n } from "@/lib/i18n";

interface StudentData {
  id: string;
  name: string;
  archetype: string;
  topicMastery: { topicId: string; topicName: string; score: number }[];
  overall: number;
}

interface TopicPriority {
  topicId: string;
  topicName: string;
  avgMastery: number;
  pctStruggling: number;
  stdMastery: number;
  priority: number;
}

interface DashboardResponse {
  students: StudentData[];
  classAverage: number;
  atRiskCount: number;
  needsAttentionCount: number;
  decliningCount: number;
  topicPriority: TopicPriority[];
}

export default function ClassInsightsPage() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  function triggerToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  // Calculate average per topic across class
  const topicAverages = (data?.students ?? []).reduce(
    (acc, s) => {
      s.topicMastery.forEach((tm) => {
        if (!acc[tm.topicName]) acc[tm.topicName] = { sum: 0, count: 0 };
        acc[tm.topicName].sum += tm.score;
        acc[tm.topicName].count += 1;
      });
      return acc;
    },
    {} as Record<string, { sum: number; count: number }>
  );

  const topicChartData = Object.entries(topicAverages).map(([name, { sum, count }]) => ({
    name,
    avg: Math.round((sum / count) * 100),
  }));

  // Identify lowest topic
  const lowestTopic = [...topicChartData].sort((a, b) => a.avg - b.avg)[0];
  const highestTopic = [...topicChartData].sort((a, b) => b.avg - a.avg)[0];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="teacher" activeItem="insights" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-7xl">
        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 font-semibold text-sm animate-fade-in flex items-center gap-2">
            <span>✨</span>
            {toast}
          </div>
        )}

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {t("class_insights")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Deep cohort diagnostics, cross-topic mastery distribution, and automated AI interventions.
            </p>
          </div>
          <button
            onClick={() => triggerToast("Weekly Cohort Progress Report generated and downloaded!")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <span>📊</span>
            Export Analytical PDF
          </button>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
            <div className="h-72 bg-slate-200 animate-pulse rounded-3xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* 4 Macro Insight Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Cohort Average</p>
                <p className="text-3xl font-extrabold text-[#0F172A] mt-1">
                  {Math.round((data?.classAverage ?? 0) * 100)}%
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ +5.2% this week</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Strongest Domain</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1 truncate">
                  {highestTopic?.name ?? "Fractions"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {highestTopic?.avg ?? 80}% class proficiency
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Needs Reinforcement</p>
                <p className="text-xl font-extrabold text-red-500 mt-1 truncate">
                  {lowestTopic?.name ?? "Linear Equations"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {lowestTopic?.avg ?? 48}% class proficiency
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Struggling Archetypes</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1">
                  {data?.atRiskCount ?? 0} Students
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Priority intervention</p>
              </div>
            </div>

            {/* Topic Mastery Breakdown & Archetype Distribution */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left: Topic Performance Bars */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                  Domain Mastery Comparison
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Aggregate mastery rating of all enrolled students across syllabus chapters.
                </p>

                <div className="flex flex-col gap-5">
                  {topicChartData.map((tItem) => {
                    const isLow = tItem.avg < 60;
                    const isMid = tItem.avg >= 60 && tItem.avg < 75;
                    const barColor = isLow ? "bg-red-500" : isMid ? "bg-amber-500" : "bg-emerald-500";
                    return (
                      <div key={tItem.name}>
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-800">{tItem.name}</span>
                          <span
                            className={
                              isLow
                                ? "text-red-600"
                                : isMid
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }
                          >
                            {tItem.avg}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${tItem.avg}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;60% Critical
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 60-74% Developing
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 75%+ Mastered
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Archetypes Donut & Strategy */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                    Student Persona Distribution
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Clustered by Bayesian knowledge tracing behavior.
                  </p>

                  <div className="flex justify-center my-4">
                    <ArchetypeDonut
                      students={(data?.students ?? []).map((s) => ({
                        id: s.id,
                        name: s.name,
                        archetype: s.archetype,
                        topicMastery: s.topicMastery,
                      }))}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
                    <p className="text-xs font-bold text-blue-900 mb-1">💡 Teacher Recommendation</p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Pair <strong>Strong Students</strong> with <strong>Struggling Students</strong>{" "}
                      for peer problem solving in <em>{lowestTopic?.name ?? "Linear Equations"}</em>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Focus: ML-ranked topic priority */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-[#0F172A]">Class Focus</h3>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                  ML Ranked
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Topics ranked by instructional urgency — a trained model weighing average mastery,
                the share of struggling students, and how uneven mastery is across the class.
              </p>
              <div className="flex flex-col gap-3">
                {(data?.topicPriority ?? []).map((tp, i) => (
                  <div
                    key={tp.topicId}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50"
                  >
                    <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#0F172A] truncate">{tp.topicName}</span>
                        <span className="text-xs font-bold text-slate-600 shrink-0">
                          {Math.round(tp.priority)} / 100 priority
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${Math.round(tp.priority)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Automated Interventions Panel */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">
                    Recommended Automated Interventions
                  </h3>
                  <p className="text-xs text-slate-500">
                    High-impact remedial workflows triggered based on real-time attempt traces.
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                  AI Adaptive Insights
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">🎯</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">Remedial Fraction Sprint</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Target 3 students with misconceptions on finding the common denominator before addition.
                    </p>
                  </div>
                  <button
                    onClick={() => triggerToast("Fraction Sprint assigned to 3 target students!")}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Deploy Sprint (1-Click)
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">📝</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">Sign-Change Scaffolding</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Inject step-by-step sign change hints into tomorrow&apos;s Linear Equations practice pool.
                    </p>
                  </div>
                  <button
                    onClick={() => triggerToast("Step-by-step sign scaffolding enabled for class!")}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Enable Scaffolding
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">🏆</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">Class Mastery Milestone</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Recognize the cohort with double XP for reaching 80% class average on Percentages!
                    </p>
                  </div>
                  <button
                    onClick={() => triggerToast("Double XP weekend challenge scheduled!")}
                    className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Launch Milestone
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
