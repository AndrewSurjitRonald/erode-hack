"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ScratchpadModal } from "@/components/Scratchpad";
import { getHintAndExplanation, detectCognitiveMisconception } from "@/lib/explanations";
import { awardXP } from "@/lib/gamification";
import { triggerConfetti } from "@/components/Confetti";
import { useI18n } from "@/lib/i18n";
import { getStudentId } from "@/lib/session";
import { IconCheck, IconX, IconLightbulb } from "@/lib/icons";

type NextQuestion = {
  question: { id: string; text: string; options: string[]; difficulty: number };
  topic: { id: string; name: string };
  reason: string;
  mode: "diagnostic" | "adaptive";
  questionNumber: number;
  totalDiagnostic: number;
};

type AnswerResult = {
  correct: boolean;
  correctIdx: number;
  priorScore?: number;
  newScore?: number;
  scoreDelta?: number;
  topicName?: string;
};

const DIFFICULTY_META: Record<number, { label: string; className: string }> = {
  1: { label: "Easy", className: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  2: { label: "Medium", className: "bg-orange-50 text-orange-700 border border-orange-200" },
  3: { label: "Hard", className: "bg-red-50 text-red-700 border border-red-200" },
};

const TOPIC_BADGE_STYLE: Record<string, string> = {
  Fractions: "bg-blue-50 text-blue-700 border border-blue-200",
  Ratios: "bg-purple-50 text-purple-700 border border-purple-200",
  "Linear Equations": "bg-amber-50 text-amber-700 border border-amber-200",
  Percentages: "bg-teal-50 text-teal-700 border border-teal-200",
};

function PracticeContent() {
  const router = useRouter();
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const topicFilter = searchParams.get("topic") ?? undefined;

  const [studentId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return getStudentId();
    }
    return null;
  });
  const [current, setCurrent] = useState<NextQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New enhancement states:
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const loadNextQuestion = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setSelectedIdx(null);
      setResult(null);
      setShowHint(false);
      setShowSteps(false);
      try {
        const url = topicFilter
          ? `/api/quiz/next?studentId=${id}&topicId=${topicFilter}`
          : `/api/quiz/next?studentId=${id}`;
        const res = await fetch(url);
        if (!res.ok) {
          setError("You've answered every question available right now.");
          setCurrent(null);
          return;
        }
        const data: NextQuestion = await res.json();
        setCurrent(data);
        setReason(data.reason);
      } finally {
        setLoading(false);
      }
    },
    [topicFilter]
  );

  useEffect(() => {
    const id = getStudentId();
    if (!id) {
      router.replace("/");
      return;
    }
    const url = topicFilter
      ? `/api/quiz/next?studentId=${id}&topicId=${topicFilter}`
      : `/api/quiz/next?studentId=${id}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          setError("You've answered every question available right now.");
          setCurrent(null);
          return;
        }
        const data: NextQuestion = await res.json();
        setCurrent(data);
        setReason(data.reason);
      })
      .finally(() => setLoading(false));
  }, [router, topicFilter]);

  async function handlePrimaryAction() {
    if (!studentId || !current) return;

    if (!result) {
      if (selectedIdx === null) return;
      setSubmitting(true);
      try {
        const res = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            questionId: current.question.id,
            selectedIdx,
          }),
        });
        const data: AnswerResult = await res.json();
        setResult(data);

        // If correct, reward XP points & trigger confetti!
        if (data.correct) {
          awardXP(studentId, 20);
          triggerConfetti();
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      loadNextQuestion(studentId);
    }
  }

  if (!studentId) return null;

  const isDiagnostic = current?.mode === "diagnostic";
  const totalCount = isDiagnostic ? current.totalDiagnostic : 15;
  const progressPct = current ? (current.questionNumber / totalCount) * 100 : 0;

  // Math explanation calculation
  const solution = current
    ? getHintAndExplanation(
        current.question.text,
        current.topic.name,
        result ? current.question.options[result.correctIdx] : current.question.options[0]
      )
    : null;

  const misconception =
    result && !result.correct && current && selectedIdx !== null
      ? detectCognitiveMisconception(
          current.topic.name,
          current.question.options[selectedIdx],
          current.question.options[result.correctIdx]
        )
      : null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="student" activeItem="practice" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {topicFilter
                ? "Practice Session"
                : isDiagnostic
                ? t("diagnostic_quiz")
                : t("practice_question")}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base mt-1">
              {topicFilter
                ? "Focused practice on your selected topic."
                : isDiagnostic
                ? "Let's find your current level. Answer 8 questions (2 from each topic)."
                : "Questions adapt to your level in real time."}
            </p>
          </div>

          {/* Quick Actions: Scratchpad toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScratchpad(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-xs cursor-pointer"
            >
              <span>✏️</span>
              <span>{t("scratchpad")}</span>
            </button>
          </div>
        </header>

        {loading && <SkeletonQuestion />}

        {!loading && error && (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center shadow-xs">
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-[#0F172A] font-bold text-lg mb-1">All caught up!</p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
          </div>
        )}

        {!loading && !error && current && (
          <div className="animate-fade-in flex flex-col gap-6">
            {/* Main Question Card */}
            <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
              {/* Top Progress Bar & Counter */}
              <div className="flex items-center justify-between mb-2">
                <span />
                <span className="text-xs font-bold text-slate-500">
                  Question {current.questionNumber} of {totalCount}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-6">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(progressPct, 100)}%` }}
                />
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    TOPIC_BADGE_STYLE[current.topic.name] ?? "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {current.topic.name}
                </span>
                {!isDiagnostic && (
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      DIFFICULTY_META[current.question.difficulty]?.className ?? ""
                    }`}
                  >
                    {DIFFICULTY_META[current.question.difficulty]?.label ?? "Medium"}
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-6 leading-snug">
                {current.question.text}
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {current.question.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrectOpt = result && idx === result.correctIdx;
                  const isWrongSelected = result && isSelected && !result.correct;

                  let containerCls = "border-slate-200 hover:border-blue-400 bg-white";
                  let circleCls = "border-2 border-slate-300 bg-white";

                  if (!result && isSelected) {
                    containerCls = "border-blue-600 bg-blue-50/40 shadow-xs";
                    circleCls = "border-blue-600 bg-blue-600";
                  }

                  if (result) {
                    if (isCorrectOpt) {
                      containerCls = "border-emerald-500 bg-emerald-50/50";
                      circleCls = "border-emerald-600 bg-emerald-600";
                    } else if (isWrongSelected) {
                      containerCls = "border-red-400 bg-red-50/60";
                      circleCls = "border-red-500 bg-red-500";
                    } else {
                      containerCls = "border-slate-100 opacity-50 bg-slate-50";
                      circleCls = "border-slate-200";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!result}
                      onClick={() => setSelectedIdx(idx)}
                      className={`flex items-center gap-4 w-full text-left px-5 py-4 rounded-xl border transition-all cursor-pointer disabled:cursor-default ${containerCls}`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${circleCls}`}
                      >
                        {!result && isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white" />
                        )}
                        {result && isCorrectOpt && <IconCheck className="w-3 h-3 text-white" />}
                        {result && isWrongSelected && <IconX className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-[#0F172A] font-medium text-base">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Progressive Hint Button (before submitting) */}
              {!result && solution && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                  >
                    <span>💡</span>
                    <span>{showHint ? "Hide Hint" : t("need_hint")}</span>
                  </button>

                  {showHint && (
                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 animate-fade-in">
                      {solution.hint}
                    </p>
                  )}
                </div>
              )}

              {/* Answer Result Feedback + Step-by-Step Breakdown */}
              {result && (
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <p
                      className={`font-bold flex items-center gap-2 ${
                        result.correct ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {result.correct ? (
                        <>
                          <IconCheck className="w-5 h-5" /> Correct! (+20 XP ⭐)
                        </>
                      ) : (
                        <>
                          <IconX className="w-5 h-5" /> Not quite.
                        </>
                      )}
                    </p>

                    {solution && (
                      <button
                        type="button"
                        onClick={() => setShowSteps(!showSteps)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {showSteps ? "Hide Steps" : "📝 Step-by-Step Solution"}
                      </button>
                    )}
                  </div>

                  {/* Bayesian Adaptive Engine Live Telemetry */}
                  {result.priorScore !== undefined && result.newScore !== undefined && (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-4 py-2.5 rounded-xl bg-[#0F172A] text-white shadow-xs animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🧠</span>
                        <span>
                          <strong className="text-blue-300">
                            {result.topicName ?? current.topic.name}:
                          </strong>{" "}
                          Mastery {Math.round(result.priorScore * 100)}% ➔{" "}
                          <span className="font-bold text-white">
                            {Math.round(result.newScore * 100)}%
                          </span>
                        </span>
                      </div>
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded-md text-[11px] ${
                          (result.scoreDelta ?? 0) >= 0
                            ? "bg-emerald-500 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {(result.scoreDelta ?? 0) >= 0 ? "+" : ""}
                        {Math.round((result.scoreDelta ?? 0) * 100)}% BKT Telemetry
                      </span>
                    </div>
                  )}

                  {/* Cognitive Misconception Diagnosis */}
                  {misconception && (
                    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 flex items-start gap-3 shadow-2xs animate-fade-in">
                      <span className="text-xl shrink-0">🔬</span>
                      <div>
                        <p className="font-extrabold uppercase text-[10px] text-amber-700 tracking-wider mb-1">
                          AI Cognitive Misconception Diagnosis
                        </p>
                        <p className="leading-relaxed font-semibold">{misconception}</p>
                      </div>
                    </div>
                  )}

                  <p className="flex items-start gap-2.5 text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <IconLightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                    {reason}
                  </p>

                  {/* Step-by-Step Explanation */}
                  {showSteps && solution && (
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 animate-fade-in">
                      <p className="font-bold text-[#0F172A] text-sm mb-3">
                        Detailed Mathematical Derivation:
                      </p>
                      <ol className="list-decimal list-inside flex flex-col gap-2 text-xs sm:text-sm text-slate-700">
                        {solution.steps.map((st, i) => (
                          <li key={i} className="leading-relaxed">
                            {st}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between">
              <button
                disabled
                title="Questions adapt progressively"
                className="rounded-xl border border-slate-200 text-slate-400 px-5 py-2.5 text-sm font-semibold opacity-40 cursor-not-allowed bg-white"
              >
                {t("previous")}
              </button>
              <button
                onClick={handlePrimaryAction}
                disabled={(selectedIdx === null && !result) || submitting}
                className="rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white px-7 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              >
                {result
                  ? t("next")
                  : submitting
                  ? "Checking…"
                  : isDiagnostic
                  ? t("next")
                  : t("submit")}
              </button>
            </div>
          </div>
        )}

        {/* Scratchpad Canvas Modal */}
        <ScratchpadModal
          isOpen={showScratchpad}
          onClose={() => setShowScratchpad(false)}
        />
      </main>
    </div>
  );
}

function SkeletonQuestion() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeContent />
    </Suspense>
  );
}
