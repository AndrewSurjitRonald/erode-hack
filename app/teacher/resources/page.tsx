"use client";

import { useEffect, useState, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useI18n } from "@/lib/i18n";
import { IconFileText } from "@/lib/icons";

interface QuestionItem {
  id: string;
  topicId: string;
  topicName: string;
  text: string;
  options: string[];
  answerIdx: number;
  difficulty: number;
  totalAttempts: number;
  passRate: number | null;
}

export default function TeacherResourcesPage() {
  const { t } = useI18n();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | "All">("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New question form state
  const [newTopicName, setNewTopicName] = useState("Fractions");
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswerIdx, setNewAnswerIdx] = useState(0);
  const [newDifficulty, setNewDifficulty] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then((data) => {
        if (data.questions) setQuestions(data.questions);
      })
      .finally(() => setLoading(false));
  }, []);

  const topics = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.topicName));
    return ["All", ...Array.from(set)];
  }, [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchTopic = selectedTopic === "All" || q.topicName === selectedTopic;
      const matchDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
      return matchTopic && matchDiff;
    });
  }, [questions, selectedTopic, selectedDifficulty]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handlePrintWorksheet() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const itemsToPrint = filtered.length > 0 ? filtered.slice(0, 10) : questions.slice(0, 10);
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PathLearn - Practice Worksheet</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; }
            .header { border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
            .title { font-size: 24px; font-weight: 800; color: #2563EB; }
            .meta { font-size: 14px; color: #64748B; margin-top: 4px; }
            .student-info { display: flex; gap: 30px; margin-bottom: 30px; font-size: 14px; border: 1px dashed #CBD5E1; padding: 12px; border-radius: 8px; }
            .item { margin-bottom: 24px; page-break-inside: avoid; }
            .q-num { font-weight: bold; color: #2563EB; margin-right: 8px; }
            .q-text { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
            .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-left: 20px; }
            .opt { font-size: 14px; color: #334155; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; background: #EFF6FF; color: #1D4ED8; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PathLearn Adaptive Worksheet</div>
              <div class="meta">Topic: ${selectedTopic} · Generated on ${new Date().toLocaleDateString()}</div>
            </div>
            <button onclick="window.print()" style="padding: 8px 16px; background: #2563EB; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">🖨️ Print Now</button>
          </div>
          <div class="student-info">
            <div><strong>Student Name:</strong> _____________________________</div>
            <div><strong>Date:</strong> _______________</div>
            <div><strong>Score:</strong> _____ / ${itemsToPrint.length}</div>
          </div>
          ${itemsToPrint
            .map(
              (q, i) => `
            <div class="item">
              <div class="q-text">
                <span class="q-num">${i + 1}.</span>
                <span>${q.text}</span>
                <span class="badge">${q.topicName} · Level ${q.difficulty}</span>
              </div>
              <div class="options">
                ${q.options.map((opt, oIdx) => `<div class="opt">( ${String.fromCharCode(65 + oIdx)} ) &nbsp; ${opt}</div>`).join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  async function handleAddQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim() || newOptions.some((o) => !o.trim())) {
      alert("Please fill all options and question text");
      return;
    }

    setSaving(true);
    // Find topicId from existing questions
    const matchingTopic = questions.find((q) => q.topicName === newTopicName);
    const topicId = matchingTopic ? matchingTopic.topicId : questions[0]?.topicId;

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          text: newText.trim(),
          options: newOptions.map((o) => o.trim()),
          answerIdx: newAnswerIdx,
          difficulty: newDifficulty,
        }),
      });

      if (res.ok) {
        showToast("✨ New Question Added to Bank!");
        setShowAddModal(false);
        setNewText("");
        setNewOptions(["", "", "", ""]);
        // refresh list
        const refreshed = await fetch("/api/questions").then((r) => r.json());
        if (refreshed.questions) setQuestions(refreshed.questions);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <Sidebar variant="teacher" activeItem="resources" />

      <main className="flex-1 px-6 sm:px-10 lg:px-12 py-8 max-w-7xl">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 font-semibold text-sm animate-fade-in flex items-center gap-2">
            <span>🎉</span>
            {toastMessage}
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {t("resources")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Curated adaptive question bank, concept exercises, and printable remedial worksheets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintWorksheet}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <IconFileText />
              Print Worksheet
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <span>➕</span>
              Add Question
            </button>
          </div>
        </header>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Total Questions</p>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-1">{questions.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Topics Covered</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">{Math.max(1, topics.length - 1)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Difficulty Levels</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">3 Tiers</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-500">Filtered View</p>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">{filtered.length} Items</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200">
          {/* Topic Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">TOPIC:</span>
            {topics.map((tName) => (
              <button
                key={tName}
                onClick={() => setSelectedTopic(tName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTopic === tName
                    ? "bg-[#0F172A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tName}
              </button>
            ))}
          </div>

          {/* Difficulty Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">LEVEL:</span>
            {(["All", 1, 2, 3] as const).map((diff) => (
              <button
                key={String(diff)}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {diff === "All" ? "All Levels" : `Lvl ${diff}`}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 font-medium">No questions found matching your filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:border-blue-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                      {q.topicName}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                      {"★".repeat(q.difficulty)} Level {q.difficulty}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] leading-snug mb-3">
                    {q.text}
                  </h3>

                  {/* Options List */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-1.5 ${
                          idx === q.answerIdx
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                            : "bg-slate-50 border-slate-200 text-slate-700 font-medium"
                        }`}
                      >
                        <span className="text-[10px] text-slate-400">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{opt}</span>
                        {idx === q.answerIdx && <span className="ml-auto text-emerald-600">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer info & action */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <span>
                    {q.totalAttempts > 0
                      ? `${q.totalAttempts} attempts · ${q.passRate}% pass rate`
                      : "Unattempted in test"}
                  </span>
                  <button
                    onClick={() => showToast(`Assigned question to active practice sets!`)}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Assign to Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Question Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                <h3 className="font-bold text-[#0F172A] text-base">➕ Add New Question</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-300 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddQuestion} className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <select
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-[#0F172A] focus:outline-blue-600"
                  >
                    {topics.filter((t) => t !== "All").map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows={2}
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="e.g. Solve for x: 3x - 9 = 12"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-[#0F172A] focus:outline-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Options (Select the radio of correct option)
                  </label>
                  <div className="flex flex-col gap-2">
                    {newOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newAnswerIdx === i}
                          onChange={() => setNewAnswerIdx(i)}
                          className="accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-400">
                          {String.fromCharCode(65 + i)}:
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...newOptions];
                            updated[i] = e.target.value;
                            setNewOptions(updated);
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-[#0F172A]"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((lvl) => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setNewDifficulty(lvl)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                          newDifficulty === lvl
                            ? "bg-amber-500 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {"★".repeat(lvl)} Level {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {saving ? "Saving..." : "Save Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
