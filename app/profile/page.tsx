"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useStudentId, getStudentName, saveStudentSession, clearSession } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { getGamificationState, GamificationState } from "@/lib/gamification";
import { IconLogOut } from "@/lib/icons";

interface StudentSummary {
  name: string;
  className: string;
  overallMastery: number;
  totalAttempts: number;
  accuracy: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const studentId = useStudentId();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetGoal, setTargetGoal] = useState("80%");

  useEffect(() => {
    if (!studentId) {
      // If no session on client after mounting, redirect to landing
      if (typeof window !== "undefined" && !localStorage.getItem("lp_student_id")) {
        router.replace("/");
      }
      return;
    }

    fetch(`/api/student/${studentId}/summary`)
      .then((r) => r.json())
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [studentId, router]);

  const gamification: GamificationState | null = studentId
    ? getGamificationState(studentId)
    : null;

  async function handleSwitchStudent(demoName: string) {
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: demoName }),
      });
      if (res.ok) {
        const data = await res.json();
        saveStudentSession(data.id, data.name);
        window.location.reload();
      }
    } catch {
      // fallback
    }
  }

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="student" activeItem="profile" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {t("profile")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your student profile, academic progress goals, and learning preferences.
          </p>
        </header>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 bg-slate-200 rounded-3xl" />
            <div className="h-44 bg-slate-200 rounded-3xl" />
          </div>
        )}

        {!loading && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Student ID Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-4xl font-extrabold shadow-md shrink-0">
                {summary?.name ? summary.name.charAt(0) : "S"}
              </div>

              {/* Information */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                  <h2 className="text-2xl font-extrabold text-[#0F172A]">
                    {summary?.name ?? getStudentName() ?? "Student"}
                  </h2>
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Class 8 · Mathematics
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Tamil Nadu Samacheer Kalvi · Roll No: #TN8-2026-
                  {studentId ? studentId.slice(-4) : "0001"}
                </p>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                  <div className="p-3 rounded-2xl bg-slate-50 text-center">
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Mastery</p>
                    <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                      {Math.round((summary?.overallMastery ?? 0.5) * 100)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 text-center">
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Solved</p>
                    <p className="text-lg font-extrabold text-[#0F172A] mt-0.5">
                      {summary?.totalAttempts ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 text-center">
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Accuracy</p>
                    <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                      {summary?.accuracy ?? 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges & Achievements Showcase */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A]">Earned Badges & Milestones</h3>
                  <p className="text-xs text-slate-500">Unlocked through consistent daily practice</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  ⭐ {gamification?.xp ?? 0} Total XP
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(gamification?.badges ?? []).map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      b.unlocked
                        ? "bg-amber-50/50 border-amber-200 shadow-2xs"
                        : "bg-slate-50 border-slate-200 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl mb-1.5">{b.icon}</span>
                    <p className="font-bold text-xs text-[#0F172A]">{b.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences & Accessibility */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h3 className="text-base font-bold text-[#0F172A] mb-4">Learning Preferences</h3>

              <div className="flex flex-col divide-y divide-slate-100">
                {/* Language setting */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">Interface Language</p>
                    <p className="text-xs text-slate-500">Choose between English and Tamil தமிழ்</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLang("en")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        lang === "en"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLang("ta")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        lang === "ta"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>

                {/* Target Mastery Goal */}
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-[#0F172A]">Target Mastery Threshold</p>
                    <p className="text-xs text-slate-500">Benchmark score for full chapter completion</p>
                  </div>
                  <div className="flex gap-1.5">
                    {["75%", "80%", "90%"].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setTargetGoal(pct)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          targetGoal === pct
                            ? "bg-[#0F172A] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {pct}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Switch Demo Persona (Hackathon Feature) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs">
              <h3 className="text-base font-bold text-[#0F172A] mb-1">
                Switch Student Profile (Demo Mode)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Instantly switch learning trajectories to inspect different student personas:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { name: "Aarav Sharma", status: "Struggling (38%)" },
                  { name: "Arjun", status: "High Achiever (76%)" },
                  { name: "Diya", status: "Inconsistent (58%)" },
                  { name: "Meera", status: "Mastered (82%)" },
                ].map((demo) => (
                  <button
                    key={demo.name}
                    onClick={() => handleSwitchStudent(demo.name)}
                    className="p-3 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all cursor-pointer"
                  >
                    <p className="font-bold text-xs text-[#0F172A]">{demo.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{demo.status}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <IconLogOut className="w-4 h-4" />
                Log Out of Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
