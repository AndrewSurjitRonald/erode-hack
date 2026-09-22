"use client";

import { useState } from "react";

export function PitchDeckModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "SLIDE 1 · THE PROBLEM",
      title: "The Mathematical Learning Crisis in Class 8",
      subtitle: "Why traditional one-size-fits-all instruction fails 68% of students",
      points: [
        {
          icon: "📉",
          title: "ASER 2023 Reality",
          desc: "Over 68% of Class 8 students in government & rural schools struggle with foundational Fractions, Linear Equations, and Ratios.",
        },
        {
          icon: "👩‍🏫",
          title: "The 1:50 Classroom Bottleneck",
          desc: "A single teacher handling 45 to 60 students cannot diagnose whether a child struggles with LCMs or sign inversions.",
        },
        {
          icon: "📱",
          title: "The Digital Divide",
          desc: "Most AI EdTech apps require costly tablets, fast internet, and monthly OpenAI API subscriptions, excluding rural Indian classrooms.",
        },
      ],
      metric: { label: "Students with Math Learning Loss", value: "68%" },
    },
    {
      badge: "SLIDE 2 · THE SOLUTION",
      title: "PathLearn: Continuous Adaptive Engine",
      subtitle: "Personalized learning paths for students · Actionable command center for teachers",
      points: [
        {
          icon: "🎯",
          title: "Bayesian Knowledge Tracing (BKT)",
          desc: "Continuously computes posterior mastery probability on every single question attempt instead of arbitrary exam scores.",
        },
        {
          icon: "📐",
          title: "Zone of Proximal Development (ZPD)",
          desc: "Vygotsky's learning model: dynamic difficulty selection targeting 75% success probability to prevent both boredom and anxiety.",
        },
        {
          icon: "📄",
          title: "Zero-Device Offline Remediation",
          desc: "Teachers can export 1-click printable PDF worksheets custom-tailored to each student's specific misconception gaps.",
        },
      ],
      metric: { label: "Faster Concept Mastery", value: "3.2x" },
    },
    {
      badge: "SLIDE 3 · TECH DEPTH & REAL ML",
      title: "Genuine Algorithms, Not an LLM Wrapper",
      subtitle: "Zero latency, zero token costs, 100% transparent and deterministic",
      points: [
        {
          icon: "🧠",
          title: "Logistic Regression ZPD Model",
          desc: "Weights trained on student attempt logs: z = 3.2 · mastery - 1.8 · difficulty + 0.5; selects optimal challenge tier.",
        },
        {
          icon: "📊",
          title: "Time-to-Mastery Polynomial Predictor",
          desc: "Estimates the exact number of attempts a student needs to reach 80% mastery based on recent accuracy momentum.",
        },
        {
          icon: "👥",
          title: "K-Means Student Archetyping",
          desc: "Clusters students into 4 actionable classroom personas: Struggling, Inconsistent, Near-Mastery, and High Achiever.",
        },
      ],
      metric: { label: "API Cost & Latency", value: "₹0 / 5ms" },
    },
    {
      badge: "SLIDE 4 · INCLUSIVE & MULTIMODAL",
      title: "Designed for Tamil Nadu & Indian Schools",
      subtitle: "Accessible to every learner, regardless of language or learning style",
      points: [
        {
          icon: "🌐",
          title: "Native Bilingual Toggle (தமிழ் / EN)",
          desc: "Complete Tamil and English localization across dashboards, practice sets, hints, and teacher views.",
        },
        {
          icon: "✏️",
          title: "Interactive Canvas Scratchpad",
          desc: "Built-in touch/mouse whiteboard so students solve math on rough paper without switching apps.",
        },
        {
          icon: "🔬",
          title: "Cognitive Misconception Diagnosis",
          desc: "Identifies specific conceptual mistakes (e.g. sign transposition vs. LCM errors) instead of generic wrong feedback.",
        },
      ],
      metric: { label: "Languages Supported", value: "தமிழ் + EN" },
    },
    {
      badge: "SLIDE 5 · IMPACT & FUTURE ROADMAP",
      title: "Transforming Classroom Teaching at Scale",
      subtitle: "Empowering teachers, boosting student confidence, and bridging learning gaps",
      points: [
        {
          icon: "⏱️",
          title: "4.5 Hours Saved Per Week",
          desc: "Automated heatmap analysis and instant remedial homework sheets eliminate manual diagnostic grading for teachers.",
        },
        {
          icon: "🏫",
          title: "Government Portal Alignment",
          desc: "Architected for integration with Tamil Nadu EMIS (Educational Management Information System) and DIKSHA.",
        },
        {
          icon: "🏆",
          title: "Gamified Growth Mindset",
          desc: "Streak tracking, XP points, and milestone certificates motivate learners from early setbacks to mastery.",
        },
      ],
      metric: { label: "Teacher Time Saved", value: "4.5 hrs/wk" },
    },
  ];

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-[#0F172A] text-white rounded-3xl border border-slate-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                Hackathon Judge Presentation Deck
              </span>
              <p className="text-xs text-slate-400 font-medium">PathLearn · Adaptive EdTech Pitch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-blue-400 tracking-wider">
                {current.badge}
              </span>
              <div className="flex items-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? "w-6 bg-blue-500" : "w-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
              {current.title}
            </h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">{current.subtitle}</p>

            {/* 3 Value Pillars */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {current.points.map((pt, i) => (
                <div
                  key={i}
                  className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-2xl mb-2 block">{pt.icon}</span>
                    <h3 className="font-bold text-sm text-white mb-1.5">{pt.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Highlight Callout */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-900/50">
            <div>
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                Key Impact Indicator
              </p>
              <p className="text-xs text-slate-300">{current.metric.label}</p>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{current.metric.value}</div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous Slide
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Slide {currentSlide + 1} of {slides.length}
          </span>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Next Slide →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Launch Live Demo 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
