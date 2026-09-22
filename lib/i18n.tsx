"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

export type Language = "en" | "ta";

type I18nContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
};

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    welcome_back: "Welcome back",
    continue_journey: "Let's continue your learning journey.",
    learning_progress: "Your Learning Progress",
    overall_mastery: "Overall Mastery",
    doing_great: "You're doing great! Keep going.",
    topic_mastery: "Topic Mastery",
    continue_practice: "Continue Practice",
    next_question_ready: "Next question is ready for you!",
    start_practice: "Start Practice",
    revision_plan: "Revision Plan",
    view_revision_plan: "View Revision Plan",
    quote_banner: "Practice today for a better tomorrow.",
    class_label: "Class 8 · Mathematics",
    home: "Home",
    practice: "Practice",
    revision: "Revision",
    my_progress: "My Progress",
    profile: "Profile",
    logout: "Log out",
    dashboard: "Dashboard",
    students: "Students",
    class_insights: "Class Insights",
    resources: "Resources",
    diagnostic_quiz: "Diagnostic Quiz",
    practice_question: "Practice Question",
    previous: "← Previous",
    next: "Next →",
    submit: "Submit →",
    need_hint: "Need a Hint?",
    scratchpad: "Rough Sheet / Scratchpad",
    clear: "Clear",
    pen: "Pen",
    eraser: "Eraser",
    listen: "Listen",
    class_dashboard: "Class Dashboard",
    overview_trends: "Overview of class performance and learning trends.",
    class_average: "Class Average",
    at_risk: "At Risk",
    need_attention: "Need Attention",
    heatmap_title: "Topic Mastery Heatmap",
    archetypes_title: "Student Learning Archetypes",
    on_track: "On Track",
    needs_support: "Needs Support",
    uneven: "Uneven — Targeted Help",
    export_worksheet: "Export Remedial Worksheet",
    assign_homework: "Assign Targeted Revision",
    streak: "Day Streak",
    xp_points: "XP Earned",
  },
  ta: {
    welcome_back: "மீண்டும் வருக",
    continue_journey: "உங்கள் கணித கற்றல் பயணத்தை தொடருங்கள்.",
    learning_progress: "உங்கள் கற்றல் முன்னேற்றம்",
    overall_mastery: "ஒட்டுமொத்த தேர்ச்சி",
    doing_great: "அற்புதம்! தொடர்ந்து பயிற்சி செய்யுங்கள்.",
    topic_mastery: "பாடவாரியான தேர்ச்சி",
    continue_practice: "பயிற்சியைத் தொடரவும்",
    next_question_ready: "அடுத்த கேள்வி தயார்!",
    start_practice: "பயிற்சி தொடங்கு",
    revision_plan: "மீள்நோக்கு திட்டம்",
    view_revision_plan: "மீள்நோக்கு திட்டத்தைப் பார்க்க",
    quote_banner: "இன்றைய பயிற்சி நாளைய வெற்றிக்கு அடித்தளம்.",
    class_label: "வகுப்பு 8 · கணிதம்",
    home: "முகப்பு",
    practice: "பயிற்சி",
    revision: "மீள்நோக்கு",
    my_progress: "முன்னேற்றம்",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",
    dashboard: "தகவல் பலகை",
    students: "மாணவர்கள்",
    class_insights: "வகுப்பு நுண்ணறிவு",
    resources: "கற்றல் வளங்கள்",
    diagnostic_quiz: "நிலைக் கண்டறியும் தேர்வு",
    practice_question: "பயிற்சி வினா",
    previous: "← முந்தைய",
    next: "அடுத்து →",
    submit: "சமர்ப்பி →",
    need_hint: "குறிப்பு தேவையா?",
    scratchpad: "கணக்கீட்டு தாள் (ரஃப் ஷீட்)",
    clear: "அழி",
    pen: "எழுதுகோல்",
    eraser: "ரப்பர்",
    listen: "கேட்க",
    class_dashboard: "வகுப்பறை தகவல் பலகை",
    overview_trends: "வகுப்பின் ஒட்டுமொத்த கற்றல் முன்னேற்றம்.",
    class_average: "வகுப்பு சராசரி",
    at_risk: "கவனம் தேவை",
    need_attention: "ஆதரவு தேவை",
    heatmap_title: "பாடவாரியான வெப்பப் படம் (Heatmap)",
    archetypes_title: "மாணவர் கற்றல் முறைகள்",
    on_track: "சரியான பாதையில்",
    needs_support: "கூடுதல் பயிற்சி தேவை",
    uneven: "மாறுபட்ட தேர்ச்சி",
    export_worksheet: "பயிற்சி தாள் பதிவிறக்கு",
    assign_homework: "வீட்டுப்பாடம் ஒதுக்கு",
    streak: "நாள் தொடர்ச்சி",
    xp_points: "பெற்ற புள்ளிகள் (XP)",
  },
};

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

function subscribeLang(callback: () => void) {
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
    window.addEventListener("pathlearn_lang_change", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("pathlearn_lang_change", callback);
    };
  }
  return () => {};
}

function getStoredLang(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("pathlearn_lang");
  if (saved === "en" || saved === "ta") return saved;
  return "en";
}

function getServerLang(): Language {
  return "en";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getStoredLang, getServerLang);

  function setLang(newLang: Language) {
    if (typeof window !== "undefined") {
      localStorage.setItem("pathlearn_lang", newLang);
      window.dispatchEvent(new Event("pathlearn_lang_change"));
    }
  }

  function t(key: string): string {
    return DICTIONARY[lang]?.[key] ?? DICTIONARY.en[key] ?? key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="inline-flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 text-xs font-semibold">
      <button
        onClick={() => setLang("en")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          lang === "en" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        English
      </button>
      <button
        onClick={() => setLang("ta")}
        className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
          lang === "ta" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
        }`}
      >
        தமிழ்
      </button>
    </div>
  );
}
