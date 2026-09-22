"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { GrowthIllustration } from "@/components/GrowthIllustration";
import { saveStudentSession, saveTeacherSession } from "@/lib/session";
import { IconArrowRight, IconUser, IconUsers } from "@/lib/icons";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "student-name">("choose");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickTeacher() {
    saveTeacherSession();
    router.push("/teacher");
  }

  async function submitStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      const data = await res.json();
      saveStudentSession(data.id, data.name);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted">
          <a href="#about" className="hover:text-ink transition-colors">
            About
          </a>
          <a href="#how" className="hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
        </nav>
        <button
          onClick={() => setMode("student-name")}
          className="rounded-lg bg-primary text-white text-sm font-bold px-4 py-2.5 hover:bg-dark transition-colors"
        >
          Get Started
        </button>
      </header>

      <main className="flex-1 flex items-center px-6 sm:px-10 py-12">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-dark leading-tight">
              Personalized Learning
              <br />
              Path Generator
            </h1>
            <p className="text-xl font-semibold text-primary">
              Adaptive learning for brighter futures.
            </p>
            <p className="text-muted max-w-md">
              An AI-driven practice tool for Class 8 Mathematics that adapts to each student,
              helps them grow, and gives teachers real-time insights.
            </p>

            {mode === "choose" && (
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => setMode("student-name")}
                  className="group text-left rounded-xl bg-card-bg border border-border p-5 hover:border-primary hover:shadow-md transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3">
                    <IconUser className="w-5 h-5" />
                  </span>
                  <p className="font-bold text-dark mb-1">I&apos;m a Student</p>
                  <p className="text-sm text-muted mb-3">
                    Practice, learn and grow with a personalized path
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                    Get started
                    <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

                <button
                  onClick={pickTeacher}
                  className="group text-left rounded-xl bg-card-bg border border-border p-5 hover:border-primary hover:shadow-md transition-all"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10 text-secondary mb-3">
                    <IconUsers className="w-5 h-5" />
                  </span>
                  <p className="font-bold text-dark mb-1">I&apos;m a Teacher</p>
                  <p className="text-sm text-muted mb-3">
                    View class insights and support your students
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-secondary">
                    Get started
                    <IconArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            )}

            {mode === "student-name" && (
              <form
                onSubmit={submitStudent}
                className="mt-2 rounded-xl bg-card-bg border border-border p-5 flex flex-col gap-4 animate-fade-in max-w-md"
              >
                <div>
                  <label htmlFor="name" className="text-sm font-bold text-dark">
                    What&apos;s your name?
                  </label>
                  <input
                    id="name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-ink outline-none focus:border-primary transition-colors"
                  />
                </div>
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("choose")}
                    className="rounded-lg border border-border text-ink px-4 py-2.5 text-sm font-bold hover:border-primary/50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className="flex-1 rounded-lg bg-primary text-white py-2.5 text-sm font-bold hover:bg-dark disabled:opacity-50 transition-colors"
                  >
                    {submitting ? "Starting…" : "Start"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="flex flex-col items-center gap-4">
            <GrowthIllustration />
            <p className="text-center text-muted italic text-sm max-w-xs">
              &ldquo;Every student can learn. Just not on the same day or in the same
              way.&rdquo;
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
