"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getStudentId } from "@/lib/session";
import { topicIcon } from "@/lib/topic-icons";
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
};

const DIFFICULTY_META: Record<number, { label: string; className: string }> = {
  1: { label: "Easy", className: "bg-accent/15 text-secondary" },
  2: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  3: { label: "Hard", className: "bg-red-100 text-red-600" },
};

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicFilter = searchParams.get("topic") ?? undefined;

  const [studentId, setStudentId] = useState<string | null>(null);
  const [current, setCurrent] = useState<NextQuestion | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [reason, setReason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getStudentId();
    if (!id) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage on mount
    setStudentId(id);
  }, [router]);

  const loadNextQuestion = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setSelectedIdx(null);
      setResult(null);
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
    if (!studentId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kicks off async load on mount
    loadNextQuestion(studentId);
  }, [studentId, loadNextQuestion]);

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
      } finally {
        setSubmitting(false);
      }
    } else {
      loadNextQuestion(studentId);
    }
  }

  if (!studentId) return null;

  const isDiagnostic = current?.mode === "diagnostic";
  const progressPct = current ? (current.questionNumber / current.totalDiagnostic) * 100 : 0;

  return (
    <div className="flex flex-1">
      <Sidebar variant="student" activeItem="practice" />
      <main className="flex-1 px-6 sm:px-10 py-8 max-w-3xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold text-dark">
            {topicFilter ? "Practice Session" : isDiagnostic ? "Diagnostic Quiz" : "Practice Question"}
          </h1>
          <p className="text-muted mt-1">
            {topicFilter
              ? "Focused practice on your selected topic."
              : isDiagnostic
              ? "Let's find your current level. Answer 8 questions (2 from each topic)."
              : "Questions adapt to your level in real time."}
          </p>
        </header>

        {loading && <SkeletonQuestion />}

        {!loading && error && (
          <div className="rounded-xl bg-card-bg border border-border p-10 text-center">
            <p className="text-dark font-bold mb-1">🎉 All caught up!</p>
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {!loading && !error && current && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span />
              <span className="text-xs font-bold text-muted">
                Question {current.questionNumber} of {current.totalDiagnostic}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-card-bg overflow-hidden mb-6">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="rounded-xl border border-border p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold">
                  {topicIcon(current.topic.name)} {current.topic.name}
                </span>
                {!isDiagnostic && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                      DIFFICULTY_META[current.question.difficulty]?.className ?? ""
                    }`}
                  >
                    {DIFFICULTY_META[current.question.difficulty]?.label ?? "—"}
                  </span>
                )}
              </div>

              <p className="text-xl font-bold text-dark mb-6">{current.question.text}</p>

              <div className="flex flex-col gap-3">
                {current.question.options.map((opt, idx) => {
                  const isSelected = selectedIdx === idx;
                  const isCorrectOpt = result && idx === result.correctIdx;
                  const isWrongSelected = result && isSelected && !result.correct;

                  let rowCls = "border-border hover:border-primary/40";
                  let circleCls = "border-2 border-border";
                  if (!result && isSelected) {
                    rowCls = "border-primary bg-primary/5";
                    circleCls = "border-primary bg-primary";
                  }
                  if (result) {
                    if (isCorrectOpt) {
                      rowCls = "border-secondary bg-secondary/5";
                      circleCls = "border-secondary bg-secondary";
                    } else if (isWrongSelected) {
                      rowCls = "border-red-400 bg-red-50";
                      circleCls = "border-red-400 bg-red-400";
                    } else {
                      rowCls = "border-border opacity-60";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={!!result}
                      onClick={() => setSelectedIdx(idx)}
                      className={`flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-lg border transition-all disabled:cursor-default ${rowCls}`}
                    >
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${circleCls}`}
                      >
                        {result && isCorrectOpt && <IconCheck className="w-3 h-3 text-white" />}
                        {result && isWrongSelected && <IconX className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-ink font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {result && (
                <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3 animate-fade-in">
                  <p
                    className={`font-bold flex items-center gap-2 ${
                      result.correct ? "text-secondary" : "text-red-500"
                    }`}
                  >
                    {result.correct ? (
                      <>
                        <IconCheck className="w-5 h-5" /> Correct!
                      </>
                    ) : (
                      <>
                        <IconX className="w-5 h-5" /> Not quite.
                      </>
                    )}
                  </p>
                  <p className="flex items-start gap-2 text-sm text-muted bg-card-bg rounded-lg px-3.5 py-3">
                    <IconLightbulb className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                    {reason}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                disabled
                title="Not available — questions are one-way"
                className="rounded-lg border border-border text-muted px-5 py-2.5 text-sm font-bold opacity-40 cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handlePrimaryAction}
                disabled={(selectedIdx === null && !result) || submitting}
                className="rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {result ? "Next →" : submitting ? "Checking…" : isDiagnostic ? "Next →" : "Submit →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonQuestion() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-2 w-full bg-card-bg rounded-full" />
      <div className="h-56 bg-card-bg rounded-xl" />
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
