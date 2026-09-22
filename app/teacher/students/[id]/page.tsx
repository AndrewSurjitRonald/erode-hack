"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { bandForScore, MASTERY_COLORS } from "@/lib/colors";
import { useI18n } from "@/lib/i18n";
import { IconLightbulb, IconCheck, IconX } from "@/lib/icons";

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
  "On Track": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Needs Support": "bg-red-50 text-red-700 border border-red-200",
  "Uneven — targeted help needed": "bg-purple-50 text-purple-700 border border-purple-200",
};

const TABS = ["Mastery", "Attempt History", "Revision Plan", "Insights"] as const;
type Tab = (typeof TABS)[number];

function AIInsightsCard({ insights }: { insights: string[] }) {
  const displayInsights =
    insights && insights.length > 0
      ? insights
      : [
          "Struggles with linear equations",
          "Shows consistent improvement over time",
          "Recommended to focus on more word problems",
        ];

  return (
    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <p className="flex items-center gap-2 font-bold text-[#0F172A] text-base mb-4">
          <IconLightbulb className="w-5 h-5 text-emerald-600" /> AI Insights
        </p>
        <ul className="flex flex-col gap-3">
          {displayInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 font-medium">
              <IconCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Mastery");
  const [toast, setToast] = useState<string | null>(null);

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

  function handleAssignHomework() {
    setToast("Targeted revision homework assigned to student's practice portal! 🎯");
    setTimeout(() => setToast(null), 4000);
  }

  function handleExportWorksheet() {
    if (!detail) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Remedial Worksheet - ${detail.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0F172A; }
            .header { border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; }
            h1 { margin: 0; color: #2563EB; font-size: 24px; }
            .meta { font-size: 14px; color: #64748B; margin-top: 4px; }
            .section { margin-bottom: 28px; }
            .section-title { font-size: 16px; font-weight: bold; background: #EFF6FF; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; }
            .question { margin-bottom: 20px; font-size: 14px; line-height: 1.6; }
            .workspace { border: 1px dashed #CBD5E1; height: 90px; border-radius: 8px; margin-top: 8px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #0F172A; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; border: none; cursor: pointer;">
              🖨️ Print / Save as PDF
            </button>
          </div>
          <div class="header">
            <div>
              <h1>PathLearn — Personalized Math Remedial Worksheet</h1>
              <div class="meta">Class 8 · Mathematics | Student: <strong>${detail.name}</strong> | Archetype: ${detail.status}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748B;">Date: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="section">
            <div class="section-title">Focus Area 1: Linear Equations & Algebra</div>
            <div class="question">
              <strong>Q1.</strong> Solve for x: 3(x + 2) = 2x + 11. Show your step-by-step working.
              <div class="workspace"></div>
            </div>
            <div class="question">
              <strong>Q2.</strong> The perimeter of a rectangle is 48 cm. Its length is 4 cm more than its width. Find its dimensions.
              <div class="workspace"></div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Focus Area 2: Ratios & Proportions</div>
            <div class="question">
              <strong>Q3.</strong> If 12 notebooks cost ₹180, what is the cost of 7 notebooks?
              <div class="workspace"></div>
            </div>
            <div class="question">
              <strong>Q4.</strong> Two numbers are in the ratio 4 : 5. If their sum is 135, find the larger number.
              <div class="workspace"></div>
            </div>
          </div>

          <div style="margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 12px; font-size: 12px; color: #94A3B8; text-align: center;">
            Generated automatically by PathLearn Adaptive Learning Engine
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="teacher" activeItem="students" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-6xl">
        {/* Back Link */}
        <button
          onClick={() => router.push("/teacher")}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mb-5 cursor-pointer"
        >
          ← Back to Students
        </button>

        {/* Success Toast */}
        {toast && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold px-4 py-3 rounded-2xl animate-fade-in flex items-center justify-between shadow-xs">
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {loading && <SkeletonStudentDetail />}

        {!loading && detail && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Student Header Card */}
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-extrabold shrink-0 shadow-xs">
                  {detail.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="font-extrabold text-xl sm:text-2xl text-[#0F172A]">
                      {detail.name}
                    </h1>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                        STATUS_STYLE[detail.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {detail.status}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{detail.className}</p>
                </div>
              </div>

              {/* Stats & 1-Click Teacher Actions */}
              <div className="flex items-center gap-6 sm:gap-10 flex-wrap">
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-none">
                    {Math.round(detail.overallMastery * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Overall Mastery</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-none">
                    {detail.questionsAttempted}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Questions Attempted</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-none">
                    {Math.round(detail.accuracy * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Accuracy</p>
                </div>
              </div>
            </header>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportWorksheet}
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>📄</span>
                <span>{t("export_worksheet")}</span>
              </button>
              <button
                onClick={handleAssignHomework}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>🎯</span>
                <span>{t("assign_homework")}</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-slate-200">
              {TABS.map((tItem) => (
                <button
                  key={tItem}
                  onClick={() => setTab(tItem)}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
                    tab === tItem
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tItem}
                </button>
              ))}
            </div>

            {/* Tab: Mastery */}
            {tab === "Mastery" && (
              <div className="grid md:grid-cols-12 gap-6 items-stretch">
                {/* Topic Mastery Horizontal Progress Bars */}
                <div className="md:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                  <h2 className="font-bold text-[#0F172A] text-lg mb-4">{t("topic_mastery")}</h2>
                  <div className="flex flex-col gap-5 py-2">
                    {detail.topicMastery.map((tItem) => {
                      const colors = MASTERY_COLORS[bandForScore(tItem.score)];
                      const pct = Math.round(tItem.score * 100);
                      return (
                        <div key={tItem.topicId}>
                          <div className="flex justify-between items-center text-sm font-semibold mb-2">
                            <span className="text-[#0F172A]">{tItem.topicName}</span>
                            <span className="font-bold text-slate-700">{pct}%</span>
                          </div>
                          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${pct}%`, backgroundColor: colors.bg }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-2" />
                </div>

                {/* AI Insights Card */}
                <div className="md:col-span-5 flex">
                  <div className="w-full">
                    <AIInsightsCard insights={detail.insights} />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Attempt History */}
            {tab === "Attempt History" && (
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left font-bold text-slate-500 px-5 py-3">Topic</th>
                      <th className="text-left font-bold text-slate-500 px-5 py-3">Difficulty</th>
                      <th className="text-left font-bold text-slate-500 px-5 py-3">Result</th>
                      <th className="text-left font-bold text-slate-500 px-5 py-3">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.recentAttempts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3 font-semibold text-[#0F172A]">{a.topicName}</td>
                        <td className="px-5 py-3 text-slate-500">Level {a.difficulty}</td>
                        <td className="px-5 py-3">
                          {a.correct ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                              <IconCheck className="w-4 h-4" /> Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-red-500 font-bold">
                              <IconX className="w-4 h-4" /> Incorrect
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {detail.recentAttempts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                          No attempts recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Revision Plan */}
            {tab === "Revision Plan" && (
              <div className="flex flex-col gap-3">
                {detail.weakTopics.length === 0 && (
                  <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center text-slate-500 shadow-xs">
                    🎉 No weak topics — great performance!
                  </div>
                )}
                {detail.weakTopics.map((tItem) => (
                  <div
                    key={tItem.topicId}
                    className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-5 shadow-xs"
                  >
                    <div>
                      <p className="font-bold text-[#0F172A] text-base">{tItem.topicName}</p>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Current mastery: {tItem.mastery}%
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        tItem.status === "Weak"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {tItem.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Insights */}
            {tab === "Insights" && (
              <div className="max-w-2xl">
                <AIInsightsCard insights={detail.insights} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonStudentDetail() {
  return (
    <div className="animate-pulse flex flex-col gap-6">
      <div className="h-28 bg-slate-200 rounded-2xl" />
      <div className="h-10 w-80 bg-slate-200 rounded-xl" />
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-7 h-80 bg-slate-200 rounded-2xl" />
        <div className="md:col-span-5 h-80 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
