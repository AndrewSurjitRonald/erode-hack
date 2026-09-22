import { bandForScore, MASTERY_COLORS } from "@/lib/colors";

export function MasteryRing({
  score,
  size = 120,
  strokeWidth = 10,
  customColor,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  customColor?: string;
  label?: string;
}) {
  const pct = Math.round(score * 100);
  const color = customColor ?? MASTERY_COLORS[bandForScore(score)].bg;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-extrabold text-slate-800 tracking-tight" style={{ fontSize: size * 0.23 }}>
            {pct}%
          </span>
        </div>
      </div>
      {label && <span className="text-xs sm:text-sm font-semibold text-slate-600 text-center">{label}</span>}
    </div>
  );
}
