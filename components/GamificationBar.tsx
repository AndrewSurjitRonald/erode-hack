"use client";

import { useI18n } from "@/lib/i18n";
import type { GamificationState } from "@/lib/gamification";

export function GamificationBar({ state }: { state: GamificationState }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-xs">
      <div className="flex items-center gap-5">
        {/* Streak */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t("streak")}</p>
            <p className="font-extrabold text-[#0F172A] text-sm leading-none mt-0.5">
              {state.streak} {state.streak === 1 ? "Day" : "Days"}
            </p>
          </div>
        </div>

        {/* XP Points */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <span className="text-xl">⭐</span>
          <div>
            <p className="text-xs text-slate-500 font-medium">{t("xp_points")}</p>
            <p className="font-extrabold text-blue-600 text-sm leading-none mt-0.5">
              {state.xp} XP
            </p>
          </div>
        </div>
      </div>

      {/* Badges preview */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Badges:</span>
        <div className="flex items-center gap-1.5">
          {state.badges.map((b) => (
            <span
              key={b.id}
              title={`${b.title} — ${b.desc}${b.unlocked ? "" : " (locked)"}`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
                b.unlocked
                  ? "bg-amber-50 border border-amber-200 text-amber-700 shadow-2xs"
                  : "bg-slate-100 border border-slate-200 text-slate-400 opacity-40 grayscale"
              }`}
            >
              {b.icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
