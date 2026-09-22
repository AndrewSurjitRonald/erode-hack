"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_STUDENT_NAMES, personaLabel, personaTone, StudentListItem } from "@/lib/persona";
import { Logo } from "@/components/Logo";
import { GrowthIllustration } from "@/components/GrowthIllustration";
import { saveStudentSession, saveTeacherSession } from "@/lib/session";
import { IconArrowRight } from "@/lib/icons";
import { LanguageToggle } from "@/lib/i18n";
import { PitchDeckModal } from "@/components/PitchDeckModal";

function StudentIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      {/* Desk */}
      <rect x="15" y="72" width="90" height="6" rx="3" fill="#E2E8F0" />
      <rect x="25" y="78" width="6" height="18" rx="2" fill="#CBD5E1" />
      <rect x="89" y="78" width="6" height="18" rx="2" fill="#CBD5E1" />
      {/* Laptop */}
      <rect x="42" y="52" width="36" height="22" rx="3" fill="#3B82F6" />
      <rect x="45" y="55" width="30" height="16" rx="2" fill="#EFF6FF" />
      <path d="M 36 74 L 84 74 L 80 72 L 40 72 Z" fill="#1E293B" />
      {/* Student body & head */}
      <rect x="46" y="34" width="28" height="28" rx="8" fill="#2563EB" />
      <circle cx="60" cy="22" r="13" fill="#FCD34D" />
      {/* Hair */}
      <path d="M 48 20 C 48 8, 70 6, 72 16 C 73 20, 71 24, 67 24 C 65 19, 62 16, 56 17 Z" fill="#1E293B" />
      {/* Smile */}
      <path d="M 57 26 Q 60 28 63 26" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TeacherIllustration() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" fill="none">
      {/* Whiteboard / backdrop */}
      <rect x="20" y="10" width="80" height="52" rx="6" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
      <line x1="28" y1="24" x2="52" y2="24" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="28" y1="32" x2="64" y2="32" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Teacher body & head */}
      <rect x="46" y="44" width="28" height="34" rx="8" fill="#10B981" />
      <circle cx="60" cy="28" r="13" fill="#FCD34D" />
      {/* Hair (flowing dark hair) */}
      <path d="M 46 28 C 45 14, 75 14, 74 28 C 74 38, 70 42, 68 44 C 64 36, 56 36, 52 44 Z" fill="#1E293B" />
      {/* Smile */}
      <path d="M 57 32 Q 60 34 63 32" stroke="#1E293B" strokeWidth="1.2" strokeLinecap="round" />
      {/* Tablet held in hand */}
      <rect x="70" y="52" width="22" height="28" rx="3" fill="#0F172A" />
      <rect x="72" y="54" width="18" height="24" rx="2" fill="#EFF6FF" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [showStudentInput, setShowStudentInput] = useState(false);
  const [name, setName] = useState("Arjun");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPitchDeck, setShowPitchDeck] = useState(false);
  const [students, setStudents] = useState<StudentListItem[]>([]);

  useEffect(() => {
    fetch("/api/student")
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((data) => setStudents(data.students ?? []))
      .catch(() => {});
  }, []);

  // Demo personas with their live mastery (falls back to just the name until loaded)
  const demos = DEMO_STUDENT_NAMES.map((demoName) => {
    const match = students.find((s) => s.name.toLowerCase() === demoName.toLowerCase());
    return {
      name: demoName,
      mastery: match?.overallMastery ?? null,
    };
  });
  const describe = (mastery: number | null) =>
    mastery === null ? "Demo student" : `${personaLabel(mastery)} (${Math.round(mastery * 100)}%)`;

  function pickTeacher() {
    saveTeacherSession();
    router.push("/teacher");
  }

  async function handleStudentLogin(studentName: string) {
    if (!studentName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: studentName.trim() }),
      });
      if (!res.ok) {
        setError("Something went wrong. Try again.");
        return;
      }
      const data = await res.json();
      saveStudentSession(data.id, data.name);
      router.push("/dashboard");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 sm:px-12 py-5 bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <Logo />
        <nav className="hidden md:flex items-center gap-10 text-sm font-semibold text-slate-500">
          <a href="#about" className="hover:text-slate-900 transition-colors">
            About
          </a>
          <a href="#how" className="hover:text-slate-900 transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-slate-900 transition-colors">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPitchDeck(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-extrabold text-xs hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <span>🏆</span>
            <span>Judge Pitch Deck</span>
          </button>
          <LanguageToggle />
          <button
            onClick={() => setShowStudentInput(true)}
            className="rounded-full bg-[#0F172A] text-white text-sm font-semibold px-6 py-2.5 hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center px-6 sm:px-12 py-10 lg:py-16">
        <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading & Role Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] leading-[1.15] tracking-tight">
                Personalized
                <br />
                Learning Path
                <br />
                Generator
              </h1>
              <p className="text-lg sm:text-xl font-bold text-blue-600 mt-4">
                Adaptive learning for brighter futures.
              </p>
              <p className="text-slate-500 text-sm sm:text-base mt-2 max-w-lg leading-relaxed">
                An AI-driven practice tool for Class 8 Mathematics that adapts to each student,
                helps them grow, and gives teachers real-time insights.
              </p>
            </div>

            {!showStudentInput ? (
              <div className="grid sm:grid-cols-2 gap-4 mt-2">
                {/* Student Card */}
                <div
                  onClick={() => setShowStudentInput(true)}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-center w-full py-2 mb-2">
                      <StudentIllustration />
                    </div>
                    <p className="font-bold text-[#0F172A] text-lg text-center">I&apos;m a Student</p>
                    <p className="text-xs sm:text-sm text-slate-500 text-center mt-1">
                      Practice, learn and grow with a personalized path
                    </p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <span className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center group-hover:bg-blue-700 group-hover:scale-105 transition-all shadow-xs">
                      <IconArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Teacher Card */}
                <div
                  onClick={pickTeacher}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-center w-full py-2 mb-2">
                      <TeacherIllustration />
                    </div>
                    <p className="font-bold text-[#0F172A] text-lg text-center">I&apos;m a Teacher</p>
                    <p className="text-xs sm:text-sm text-slate-500 text-center mt-1">
                      View class insights and support your students
                    </p>
                  </div>
                  <div className="flex justify-center mt-4">
                    <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center group-hover:bg-emerald-700 group-hover:scale-105 transition-all shadow-xs">
                      <IconArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStudentLogin(name);
                }}
                className="mt-2 rounded-2xl bg-white border border-slate-200 p-6 flex flex-col gap-4 animate-fade-in shadow-md max-w-md"
              >
                <div>
                  <label htmlFor="student-name" className="text-sm font-bold text-[#0F172A]">
                    Enter student name or pick demo profile:
                  </label>
                  <input
                    id="student-name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arjun"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  />
                    <div className="flex flex-wrap gap-2 mt-2.5">
                    {demos.map((demo) => (
                      <button
                        type="button"
                        key={demo.name}
                        onClick={() => {
                          setName(demo.name);
                          handleStudentLogin(demo.name);
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <span className="font-bold">{demo.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{describe(demo.mastery)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowStudentInput(false)}
                    className="rounded-xl border border-slate-200 text-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || submitting}
                    className="flex-1 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {submitting ? "Continuing…" : "Continue as Student →"}
                  </button>
                </div>
              </form>
            )}

            {/* Hackathon Fast Pass Dock */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>🏆</span> Hackathon Fast-Pass: 1-Click Personas
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Judge Demo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {demos.slice(0, 2).map((demo) => (
                  <button
                    key={demo.name}
                    type="button"
                    disabled={submitting}
                    onClick={() => handleStudentLogin(demo.name)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left transition-colors cursor-pointer border border-slate-700/60 disabled:opacity-60"
                  >
                    <p className={`text-xs font-bold ${demo.mastery === null ? "text-slate-200" : personaTone(demo.mastery)}`}>
                      {demo.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{describe(demo.mastery)}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={pickTeacher}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-left transition-colors cursor-pointer border border-slate-700/60"
                >
                  <p className="text-xs font-bold text-blue-400">👩‍🏫 Mrs. Lakshmi</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Teacher Heatmap</p>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowPitchDeck(true)}
                className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📊</span>
                <span>View 5-Slide Hackathon Pitch Deck (Problem, ML Tech & Impact) →</span>
              </button>
            </div>
          </div>

          {/* Right Column: Growth Staircase Illustration & Motivational Quote */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <GrowthIllustration />
            <p className="text-center text-slate-500 italic text-sm max-w-sm mx-auto mt-4">
              &ldquo;Every student can learn. Just not on the same day or in the same way.&rdquo;
            </p>
          </div>
        </div>
      </main>

      {/* How It Works Section */}
      <section id="how" className="py-16 px-6 sm:px-12 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Architecture & Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
              How PathLearn Delivers Mastery
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Combining Bayesian Knowledge Tracing, Vygotsky&apos;s Zone of Proximal Development, and real-time teacher orchestration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <span className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-extrabold text-lg flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="font-bold text-base text-[#0F172A] mb-2">
                Continuous Knowledge Tracing
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rather than static quizzes, every question attempt updates an Elo-calibrated posterior probability of mastery across Fractions, Ratios, Equations, and Percentages.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 font-extrabold text-lg flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="font-bold text-base text-[#0F172A] mb-2">
                Zone of Proximal Development (ZPD)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                A trained logistic regression model selects item difficulty calibrated to a 75% target success probability — keeping students challenged without frustration.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-extrabold text-lg flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="font-bold text-base text-[#0F172A] mb-2">
                Automated Teacher Remediation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Teachers receive real-time class heatmaps, archetype clustering (Struggling, Inconsistent, Near-Mastery), and 1-click printable remedial worksheet exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-16 px-6 sm:px-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Built for Real Indian Classrooms
            </span>
            <h2 className="text-3xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
              Inclusive, Interactive & Multimodal
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-2xl mb-2 block">🌐</span>
              <h4 className="font-bold text-sm text-[#0F172A]">Bilingual (தமிழ் / EN)</h4>
              <p className="text-xs text-slate-500 mt-1">
                Full Tamil and English interface translation with 1-click header and sidebar toggles.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-2xl mb-2 block">✏️</span>
              <h4 className="font-bold text-sm text-[#0F172A]">In-App Scratchpad</h4>
              <p className="text-xs text-slate-500 mt-1">
                Integrated touch canvas rough sheet with pen colors, eraser, and stroke size selector.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-2xl mb-2 block">🔬</span>
              <h4 className="font-bold text-sm text-[#0F172A]">Misconception Diagnosis</h4>
              <p className="text-xs text-slate-500 mt-1">
                Cognitive distractor analysis detecting root errors like sign inversions and common denominators.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-2xl mb-2 block">📄</span>
              <h4 className="font-bold text-sm text-[#0F172A]">Printable Remedial Sheets</h4>
              <p className="text-xs text-slate-500 mt-1">
                1-click PDF/print worksheets customized to each student&apos;s specific weak concept gaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-8 px-6 sm:px-12 bg-white border-t border-slate-200 text-center text-xs text-slate-400">
        <p className="font-medium">
          PathLearn © 2026 · Built for Erode Hackathon · Powered by Bayesian Knowledge Tracing & Next.js 16
        </p>
      </footer>

      <PitchDeckModal isOpen={showPitchDeck} onClose={() => setShowPitchDeck(false)} />
    </div>
  );
}
