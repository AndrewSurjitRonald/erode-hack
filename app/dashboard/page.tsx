"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MasteryRing } from "@/components/MasteryRing";
import { GamificationBar } from "@/components/GamificationBar";
import { getStudentId, getStudentName } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { IconBookOpen, IconFileText, IconArrowRight } from "@/lib/icons";

type Summary = {
  name: string;
  className: string;
  overallMastery: number;
  topicMastery: { topicId: string; topicName: string; score: number }[];
  hasNextQuestion: boolean;
  weakTopicCount: number;
};

function MountainIllustration() {
  return (
    <svg viewBox="0 0 160 80" className="w-28 sm:w-36 h-auto shrink-0" fill="none">
      <circle cx="110" cy="25" r="14" fill="#FEF08A" opacity="0.6" />
      <polygon points="60,65 105,20 150,65" fill="#93C5FD" />
      <polygon points="105,20 95,32 105,35 115,30" fill="#FFFFFF" opacity="0.9" />
      <polygon points="20,70 65,15 110,70" fill="#3B82F6" />
      <polygon points="65,15 54,30 65,34 76,28" fill="#FFFFFF" />
      <polygon points="5,70 35,45 65,70" fill="#60A5FA" />
      <text x="25" y="25" fill="#93C5FD" fontSize="10">✦</text>
      <text x="135" y="15" fill="#60A5FA" fontSize="8">✦</text>
    </svg>
  );
}

const TOPIC_COLORS: Record<string, string> = {
  Fractions: "#10B981",
  Ratios: "#0D9488",
  "Linear Equations": "#F97316",
  Percentages: "#10B981",
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [studentId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return getStudentId();
    }
    return null;
  });
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
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="student" activeItem="home" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-6xl">
        {loading && <SkeletonDashboard />}

        {!loading && summary && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                  {t("welcome_back")}, {getStudentName() ?? summary.name}! 👋
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  {t("continue_journey")}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200/80 px-4 py-1.5 text-xs font-semibold text-blue-600 whitespace-nowrap shadow-xs">
                {t("class_label")}
              </span>
            </header>

            {/* Gamification Bar: Streaks, XP points, Badges */}
            {studentId && <GamificationBar studentId={studentId} />}

            {/* Upper Grid: Learning Progress & Topic Mastery */}
            <div className="grid md:grid-cols-12 gap-6">
              {/* Overall Progress Card */}
              <section className="md:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col items-center text-center justify-between shadow-xs">
                <h2 className="font-bold text-[#0F172A] text-base self-start">
                  {t("learning_progress")}
                </h2>
                <div className="py-4">
                  <MasteryRing
                    score={summary.overallMastery}
                    size={144}
                    strokeWidth={14}
                    customColor="#0D9488"
                  />
                </div>
                <div className="text-center">
                  <p className="font-bold text-[#0F172A] text-base">{t("overall_mastery")}</p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {t("doing_great")}
                  </p>
                </div>
              </section>

              {/* Topic Mastery Card */}
              <section className="md:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs">
                <h2 className="font-bold text-[#0F172A] text-base mb-2">{t("topic_mastery")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 items-center">
                  {summary.topicMastery.map((tItem) => (
                    <MasteryRing
                      key={tItem.topicId}
                      score={tItem.score}
                      size={82}
                      strokeWidth={8}
                      customColor={TOPIC_COLORS[tItem.topicName]}
                      label={tItem.topicName}
                    />
                  ))}
                </div>
                <div className="h-2" />
              </section>
            </div>

            {/* Action Cards: Continue Practice & Revision Plan */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Continue Practice Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <IconBookOpen className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg">{t("continue_practice")}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {summary.hasNextQuestion
                        ? t("next_question_ready")
                        : "Great job! All questions complete for today."}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Link
                    href="/practice"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 transition-all shadow-xs"
                  >
                    {t("start_practice")}
                    <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Revision Plan Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-emerald-400 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                    <IconFileText className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#0F172A] text-lg">{t("revision_plan")}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {summary.weakTopicCount > 0
                        ? `${summary.weakTopicCount} weak topic${summary.weakTopicCount === 1 ? "" : "s"} need your attention`
                        : "2 weak topics need your attention"}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <Link
                    href="/revision"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#064E3B] hover:bg-emerald-950 text-white font-semibold text-sm px-6 py-2.5 transition-all shadow-xs"
                  >
                    {t("view_revision_plan")}
                    <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Motivational Quote Banner */}
            <div className="rounded-2xl bg-white border border-slate-200/90 px-6 sm:px-8 py-5 flex items-center justify-between shadow-xs overflow-hidden">
              <div className="flex items-center gap-4">
                <span className="text-slate-300 font-serif text-5xl leading-none select-none">
                  &ldquo;
                </span>
                <p className="italic text-slate-700 font-medium text-sm sm:text-base">
                  {t("quote_banner")}
                </p>
              </div>
              <MountainIllustration />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-5 h-64 bg-slate-200 rounded-2xl" />
        <div className="md:col-span-7 h-64 bg-slate-200 rounded-2xl" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-40 bg-slate-200 rounded-2xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
      <div className="h-20 bg-slate-200 rounded-2xl" />
    </div>
  );
}
