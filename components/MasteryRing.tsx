import { bandForScore, MASTERY_COLORS } from "@/lib/colors";

export function MasteryRing({
  score,
  size = 120,
  strokeWidth = 10,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const pct = Math.round(score * 100);
  const color = MASTERY_COLORS[bandForScore(score)].bg;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
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
            style={{ transition: "stroke-dashoffset 0.4s ease-out, stroke 0.4s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-extrabold text-ink" style={{ fontSize: size * 0.22 }}>
            {pct}%
          </span>
        </div>
      </div>
      {label && <span className="text-sm font-semibold text-muted text-center">{label}</span>}
    </div>
  );
}
