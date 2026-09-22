"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getStudentId, useStudentId } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { getGamificationState } from "@/lib/gamification";
import { bandForScore, MASTERY_COLORS } from "@/lib/colors";
import { IconArrowRight } from "@/lib/icons";

interface TopicMastery {
  topicId: string;
  topicName: string;
  score: number;
}

interface AttemptItem {
  id: string;
  questionText: string;
  topicName: string;
  difficulty: number;
  correct: boolean;
  createdAt: string;
}

interface StudentSummary {
  name: string;
  className: string;
  overallMastery: number;
  topicMastery: TopicMastery[];
  totalAttempts: number;
  accuracy: number;
  recentAttempts: AttemptItem[];
}

export default function StudentProgressPage() {
  const router = useRouter();
  const { t } = useI18n();
  const studentId = useStudentId();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

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

  const gamification = studentId ? getGamificationState(studentId) : null;
  const overallPct = Math.round((summary?.overallMastery ?? 0.5) * 100);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="student" activeItem="progress" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-5xl">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {t("my_progress")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Detailed tracking of your accuracy, learning velocity, and syllabus mastery.
            </p>
          </div>
          <button
            onClick={() => setShowCertificate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>🏆</span>
            View Certificate of Achievement
          </button>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
            <div className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Overall Mastery</p>
                <p className="text-3xl font-extrabold text-blue-600 mt-1">{overallPct}%</p>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {overallPct >= 80 ? "🌟 Mastered" : overallPct >= 60 ? "📈 Developing" : "⚠️ Needs Practice"}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Total Solved</p>
                <p className="text-3xl font-extrabold text-[#0F172A] mt-1">
                  {summary?.totalAttempts ?? 0}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-1">Adaptive practice questions</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Accuracy Rate</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {summary?.accuracy ?? 0}%
                </p>
                <p className="text-xs text-emerald-600 font-medium mt-1">↑ Strong consistency</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <p className="text-xs font-semibold text-slate-500">Learning XP & Streak</p>
                <p className="text-3xl font-extrabold text-amber-500 mt-1">
                  {gamification?.xp ?? 0} XP
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  🔥 {gamification?.streak ?? 1} Day Streak
                </p>
              </div>
            </div>

            {/* Topic Mastery Progress Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Topic-by-Topic Breakdown</h3>
                  <p className="text-xs text-slate-500">
                    Your estimated proficiency across each mathematical chapter.
                  </p>
                </div>
                <Link
                  href="/practice"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Practice Weakest Topic <IconArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {(summary?.topicMastery ?? []).map((tItem) => {
                  const scorePct = Math.round(tItem.score * 100);
                  const colors = MASTERY_COLORS[bandForScore(tItem.score)];
                  return (
                    <div
                      key={tItem.topicId}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-[#0F172A]">{tItem.topicName}</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: colors.softBg, color: colors.text }}
                        >
                          {scorePct}% · {colors.label}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${scorePct}%`, backgroundColor: colors.bg }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Target: 80% to Master</span>
                        <Link
                          href={`/practice?topic=${tItem.topicId}`}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Practice Chapter →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Attempt History Log */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Recent Practice History</h3>
                  <p className="text-xs text-slate-500">
                    A log of your recent questions and performance traces.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  Last {summary?.recentAttempts?.length ?? 0} Attempts
                </span>
              </div>

              {(!summary?.recentAttempts || summary.recentAttempts.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No practice attempts recorded yet. Click &quot;Practice&quot; to begin!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                        <th className="py-3 px-3">Result</th>
                        <th className="py-3 px-3">Topic</th>
                        <th className="py-3 px-3">Question</th>
                        <th className="py-3 px-3 text-center">Level</th>
                        <th className="py-3 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.recentAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold ${
                                attempt.correct
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                              }`}
                            >
                              {attempt.correct ? "✓ Correct" : "✗ Review"}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-800">
                            {attempt.topicName}
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={attempt.questionText}>
                            {attempt.questionText}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-amber-600 font-bold">
                              {"★".repeat(attempt.difficulty)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border-4 border-amber-400/80 shadow-2xl w-full max-w-2xl p-8 relative overflow-hidden flex flex-col items-center text-center">
              {/* Close Button */}
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              {/* Decorative Corner Ornaments */}
              <div className="text-amber-500 text-2xl mb-1">⚜️ 🎓 ⚜️</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-wide uppercase">
                Certificate of Achievement
              </h2>
              <p className="text-xs text-amber-700 font-bold uppercase tracking-widest mt-1">
                PathLearn Adaptive Learning Excellence
              </p>

              <div className="w-24 h-0.5 bg-amber-400 my-4" />

              <p className="text-sm text-slate-600">This certificate is proudly awarded to</p>
              <h3 className="text-3xl font-extrabold text-blue-700 my-2">
                {summary?.name ?? "Student"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                for demonstrating dedicated mastery progression, continuous practice, and high
                accuracy in Mathematics syllabus chapters on the PathLearn Adaptive Engine.
              </p>

              <div className="grid grid-cols-3 gap-4 my-6 w-full max-w-md bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                <div>
                  <p className="text-[10px] text-amber-800 uppercase font-bold">Mastery</p>
                  <p className="text-lg font-extrabold text-slate-900">{overallPct}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-800 uppercase font-bold">Solved</p>
                  <p className="text-lg font-extrabold text-slate-900">{summary?.totalAttempts ?? 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-amber-800 uppercase font-bold">Award XP</p>
                  <p className="text-lg font-extrabold text-amber-600">{gamification?.xp ?? 0} XP</p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full max-w-md pt-4 border-t border-slate-200 text-xs text-slate-500">
                <div className="text-left">
                  <p className="font-bold text-slate-800">Date Issued:</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">Verified By:</p>
                  <p>PathLearn AI Engine</p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  🖨️ Print / Save as PDF
                </button>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
