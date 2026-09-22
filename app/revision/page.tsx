"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getStudentId } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { IconChevronRight, IconCheckCircle } from "@/lib/icons";

type WeakTopic = {
  topicId: string;
  topicName: string;
  mastery: number;
  status: "Weak" | "Needs Practice";
  recentAccuracy: string;
  attemptsToMastery: number;
};

const STATUS_STYLE: Record<WeakTopic["status"], string> = {
  Weak: "bg-red-50 text-red-600 border border-red-200",
  "Needs Practice": "bg-amber-50 text-amber-700 border border-amber-200",
};

const TOPIC_ICON_STYLE: Record<string, { bg: string; text: string; icon: string }> = {
  "Linear Equations": { bg: "bg-purple-100", text: "text-purple-700", icon: "📐" },
  Ratios: { bg: "bg-blue-100", text: "text-blue-700", icon: "⚖️" },
  Fractions: { bg: "bg-orange-100", text: "text-orange-700", icon: "½" },
  Percentages: { bg: "bg-teal-100", text: "text-teal-700", icon: "%" },
};

const HOW_IT_WORKS = [
  "Get targeted practice questions",
  "Revisit these topics after a few days",
  "Track improvement over time",
];

export default function RevisionPage() {
  const router = useRouter();
  const { t } = useI18n();
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
      .then((data) => {
        setWeakTopics(data.weakTopics ?? []);
      })
      .catch(() => {
        setWeakTopics([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  const topPick = weakTopics && weakTopics.length > 0 ? weakTopics[0] : null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="student" activeItem="revision" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {t("revision_plan")}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-1">
            Focused practice for your weak topics.
          </p>
        </header>

        {loading && (
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-24 bg-slate-200 rounded-2xl" />
            <div className="h-24 bg-slate-200 rounded-2xl" />
          </div>
        )}

        {!loading && weakTopics && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Topics to Focus On List */}
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">
                Topics to Focus On
              </h2>
              {weakTopics.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {weakTopics.map((tItem) => {
                    const iconStyle = TOPIC_ICON_STYLE[tItem.topicName] ?? {
                      bg: "bg-blue-100",
                      text: "text-blue-700",
                      icon: "📚",
                    };
                    return (
                      <Link
                        key={tItem.topicId}
                        href={`/practice?topic=${tItem.topicId}`}
                        className="group flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-xs transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${iconStyle.bg} ${iconStyle.text}`}
                          >
                            {iconStyle.icon}
                          </span>
                          <div>
                            <p className="font-bold text-[#0F172A] text-base">{tItem.topicName}</p>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                              Current mastery: {tItem.mastery}% · ~{tItem.attemptsToMastery} question
                              {tItem.attemptsToMastery === 1 ? "" : "s"} to mastery
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                              STATUS_STYLE[tItem.status]
                            }`}
                          >
                            {tItem.status}
                          </span>
                          <IconChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-xs">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="font-bold text-[#0F172A] text-base mb-1">
                    No weak topics right now
                  </p>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    Keep practicing — topics will be flagged here as soon as they require extra attention.
                  </p>
                </div>
              )}
            </div>

            {/* How it works Card */}
            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100/80 p-6 sm:p-7 shadow-xs">
              <h3 className="font-bold text-[#0F172A] text-base mb-3">How it works</h3>
              <ul className="flex flex-col gap-2.5">
                {HOW_IT_WORKS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <IconCheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Start Revision CTA */}
            <Link
              href={topPick ? `/practice?topic=${topPick.topicId}` : "/practice"}
              className="w-full text-center rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3.5 transition-all shadow-xs cursor-pointer block"
            >
              Start Revision →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
