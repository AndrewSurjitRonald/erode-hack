"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ArchetypeDonut } from "@/components/ArchetypeDonut";
import { useI18n } from "@/lib/i18n";
import { escapeHtml, openPrintWindow } from "@/lib/print";

interface StudentData {
  id: string;
  name: string;
  archetype: string;
  topicMastery: { topicId: string; topicName: string; score: number }[];
  isAtRisk: boolean;
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
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`dashboard ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  function triggerToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  const students = data?.students ?? [];

  // Class average per topic
  const topicAverages = new Map<string, { id: string; name: string; sum: number; count: number }>();
  for (const s of students) {
    for (const tm of s.topicMastery) {
      const entry = topicAverages.get(tm.topicId) ?? { id: tm.topicId, name: tm.topicName, sum: 0, count: 0 };
      entry.sum += tm.score;
      entry.count += 1;
      topicAverages.set(tm.topicId, entry);
    }
  }
  const topicChartData = [...topicAverages.values()].map((e) => ({
    id: e.id,
    name: e.name,
    avg: Math.round((e.sum / e.count) * 100),
  }));

  const lowestTopic = topicChartData.length ? [...topicChartData].sort((a, b) => a.avg - b.avg)[0] : null;
  const highestTopic = topicChartData.length ? [...topicChartData].sort((a, b) => b.avg - a.avg)[0] : null;
  const strugglingOnLowest = lowestTopic
    ? students.filter((s) => (s.topicMastery.find((tm) => tm.topicId === lowestTopic.id)?.score ?? 1) < 0.5)
    : [];
  const decliningStudents = students.filter((s) => s.isAtRisk);

  async function assignLowestTopicToClass() {
    if (!lowestTopic) return;
    setAssigning(true);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: lowestTopic.id, questionCount: 5 }),
      });
      if (!res.ok) throw new Error(`assign ${res.status}`);
      triggerToast(`Assigned 5 ${lowestTopic.name} questions to all ${students.length} students.`);
    } catch {
      triggerToast("Couldn't assign — please try again.");
    } finally {
      setAssigning(false);
    }
  }

  function exportReport() {
    if (!data) return;
    const write = openPrintWindow();
    if (!write) {
      triggerToast("Allow pop-ups for this site to open the report.");
      return;
    }
    const topicRows = topicChartData
      .map((tp) => `<tr><td>${escapeHtml(tp.name)}</td><td>${tp.avg}%</td></tr>`)
      .join("");
    const priorityRows = data.topicPriority
      .map(
        (tp, i) =>
          `<tr><td>${i + 1}</td><td>${escapeHtml(tp.topicName)}</td><td>${Math.round(tp.priority)}</td><td>${Math.round(
            tp.pctStruggling * 100
          )}%</td></tr>`
      )
      .join("");
    const topicHeaders = topicChartData.map((tp) => `<th>${escapeHtml(tp.name)}</th>`).join("");
    const studentRows = students
      .map(
        (s) =>
          `<tr><td>${escapeHtml(s.name)}${s.isAtRisk ? " ⚑" : ""}</td><td>${escapeHtml(s.archetype)}</td>${topicChartData
            .map((tp) => {
              const score = s.topicMastery.find((tm) => tm.topicId === tp.id)?.score;
              return `<td>${score === undefined ? "—" : `${Math.round(score * 100)}%`}</td>`;
            })
            .join("")}</tr>`
      )
      .join("");

    write(
      "PathLearn - Class Report",
      `<div class="header">
        <div>
          <h1>PathLearn — Class Progress Report</h1>
          <div class="meta">Class 8 · Mathematics · ${students.length} students · Class average ${Math.round(
            data.classAverage * 100
          )}%</div>
        </div>
        <div class="meta">${escapeHtml(new Date().toLocaleDateString())}</div>
      </div>
      <div class="section"><div class="section-title">Summary</div>
        <table><tbody>
          <tr><td>Needs support</td><td>${data.atRiskCount} students</td></tr>
          <tr><td>Uneven — targeted help needed</td><td>${data.needsAttentionCount} students</td></tr>
          <tr><td>Declining trend (⚑)</td><td>${data.decliningCount} students</td></tr>
        </tbody></table>
      </div>
      <div class="section"><div class="section-title">Class mastery by topic</div>
        <table><thead><tr><th>Topic</th><th>Class average</th></tr></thead><tbody>${topicRows}</tbody></table>
      </div>
      <div class="section"><div class="section-title">Teaching priority (ML ranked)</div>
        <table><thead><tr><th>#</th><th>Topic</th><th>Priority / 100</th><th>Students below 50%</th></tr></thead><tbody>${priorityRows}</tbody></table>
      </div>
      <div class="section"><div class="section-title">Student mastery</div>
        <table><thead><tr><th>Student</th><th>Profile</th>${topicHeaders}</tr></thead><tbody>${studentRows}</tbody></table>
      </div>`
    );
  }

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
              Cohort diagnostics, cross-topic mastery distribution, and data-driven interventions.
            </p>
          </div>
          <button
            onClick={exportReport}
            disabled={!data || students.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>📊</span>
            Export Class Report (PDF)
          </button>
        </header>

        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
            <div className="h-72 bg-slate-200 animate-pulse rounded-3xl" />
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-2xl bg-white border border-red-200 p-10 text-center shadow-xs">
            <p className="font-bold text-[#0F172A] mb-1">Couldn&apos;t load class data</p>
            <p className="text-sm text-slate-500">Check that the server and database are running, then refresh.</p>
          </div>
        )}

        {!loading && data && students.length === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-xs">
            <p className="font-bold text-[#0F172A] mb-1">No students yet</p>
            <p className="text-sm text-slate-500">Insights appear once students start practicing.</p>
          </div>
        )}

        {!loading && data && students.length > 0 && (
          <div className="flex flex-col gap-8">
            {/* Macro Insight Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Cohort Average</p>
                <p className="text-3xl font-extrabold text-[#0F172A] mt-1">
                  {Math.round(data.classAverage * 100)}%
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Across {students.length} students</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Strongest Topic</p>
                <p className="text-xl font-extrabold text-emerald-600 mt-1 truncate">{highestTopic?.name ?? "—"}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {highestTopic ? `${highestTopic.avg}% class mastery` : "No data"}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Needs Reinforcement</p>
                <p className="text-xl font-extrabold text-red-500 mt-1 truncate">{lowestTopic?.name ?? "—"}</p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {lowestTopic ? `${lowestTopic.avg}% class mastery` : "No data"}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Needs Support</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1">
                  {data.atRiskCount} {data.atRiskCount === 1 ? "Student" : "Students"}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {data.decliningCount} with a declining trend
                </p>
              </div>
            </div>

            {/* Topic Mastery Breakdown & Archetype Distribution */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">Topic Mastery Comparison</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Average mastery of all students in each chapter.
                </p>

                <div className="flex flex-col gap-5">
                  {topicChartData.map((tItem) => {
                    const isLow = tItem.avg < 60;
                    const isMid = tItem.avg >= 60 && tItem.avg < 75;
                    const barColor = isLow ? "bg-red-500" : isMid ? "bg-amber-500" : "bg-emerald-500";
                    return (
                      <div key={tItem.id}>
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-800">{tItem.name}</span>
                          <span className={isLow ? "text-red-600" : isMid ? "text-amber-600" : "text-emerald-600"}>
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

                <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-500">
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

              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A] mb-1">Student Profile Distribution</h3>
                  <p className="text-xs text-slate-500 mb-4">Clustered by per-topic mastery pattern.</p>
                  <div className="flex justify-center my-4">
                    <ArchetypeDonut students={students} />
                  </div>
                </div>

                {lowestTopic && highestTopic && lowestTopic.id !== highestTopic.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100">
                      <p className="text-xs font-bold text-blue-900 mb-1">💡 Teacher Recommendation</p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Pair students who are <strong>On Track</strong> with those who{" "}
                        <strong>Need Support</strong> for peer problem solving in <em>{lowestTopic.name}</em>, the
                        class&apos;s weakest topic.
                      </p>
                    </div>
                  </div>
                )}
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
                Topics ranked by instructional urgency — a trained model weighing average mastery, the share of
                struggling students, and how uneven mastery is across the class.
              </p>
              <div className="flex flex-col gap-3">
                {data.topicPriority.map((tp, i) => (
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

            {/* Data-driven interventions */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Recommended Interventions</h3>
                  <p className="text-xs text-slate-500">Generated from the class&apos;s current mastery data.</p>
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
                  Live
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">🎯</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">{lowestTopic?.name ?? "Topic"} Practice Sprint</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {strugglingOnLowest.length} of {students.length} students are below 50% in{" "}
                      {lowestTopic?.name ?? "this topic"}. Assign 5 targeted questions to the whole class — it
                      appears on every student&apos;s dashboard.
                    </p>
                  </div>
                  <button
                    onClick={assignLowestTopicToClass}
                    disabled={!lowestTopic || assigning}
                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {assigning ? "Assigning…" : "Assign to Class"}
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">📝</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">Printable {lowestTopic?.name ?? ""} Worksheet</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Open the question bank filtered to {lowestTopic?.name ?? "the weakest topic"} and print a
                      worksheet with an answer key for classroom revision.
                    </p>
                  </div>
                  <Link
                    href={lowestTopic ? `/teacher/resources?topic=${encodeURIComponent(lowestTopic.name)}` : "/teacher/resources"}
                    className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors text-center"
                  >
                    Open Worksheet Builder
                  </Link>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <span className="text-2xl mb-2 block">⚑</span>
                    <h4 className="font-bold text-sm text-[#0F172A]">Check In With Declining Students</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {decliningStudents.length > 0
                        ? `${decliningStudents.map((s) => s.name).join(", ")} ${
                            decliningStudents.length === 1 ? "has" : "have"
                          } a declining accuracy trend. Review their learning path.`
                        : "No students currently show a declining trend."}
                    </p>
                  </div>
                  <Link
                    href={decliningStudents[0] ? `/teacher/students/${decliningStudents[0].id}` : "/teacher"}
                    className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors text-center"
                  >
                    {decliningStudents[0] ? `Open ${decliningStudents[0].name}'s Profile` : "View Class Heatmap"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
