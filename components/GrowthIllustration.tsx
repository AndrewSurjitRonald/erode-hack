const STEPS = [
  { label: "Practice", x: 30, y: 210, w: 90, h: 40 },
  { label: "Improve", x: 130, y: 150, w: 90, h: 70 },
  { label: "Master", x: 230, y: 90, w: 90, h: 110 },
];

export function GrowthIllustration() {
  return (
    <div className="relative">
      <svg viewBox="0 0 360 260" className="w-full max-w-md mx-auto">
        {STEPS.map((s) => (
          <g key={s.label}>
            <rect
              x={s.x}
              y={s.y}
              width={s.w}
              height={s.h}
              rx={10}
              fill="var(--card-bg)"
              stroke="var(--border)"
              strokeWidth={2}
            />
            <text
              x={s.x + s.w / 2}
              y={s.y + s.h - 14}
              textAnchor="middle"
              fontSize={13}
              fontWeight={700}
              fill="var(--muted)"
            >
              {s.label}
            </text>
          </g>
        ))}
        {/* flag on top step */}
        <g transform="translate(255, 55)">
          <line x1="0" y1="0" x2="0" y2="35" stroke="var(--dark)" strokeWidth={3} strokeLinecap="round" />
          <path d="M0 2 L28 10 L0 20 Z" fill="var(--accent)" />
        </g>
        {/* climbing figure, on the "Improve" step */}
        <g transform="translate(163, 118)">
          <circle cx="12" cy="8" r="8" fill="var(--primary)" />
          <rect x="4" y="16" width="16" height="20" rx="6" fill="var(--secondary)" />
        </g>
        {/* dashed path */}
        <path
          d="M50 210 C 90 190, 140 170, 175 130 S 260 90, 280 60"
          fill="none"
          stroke="var(--secondary)"
          strokeWidth={2}
          strokeDasharray="6 6"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute -top-2 right-0 sm:right-6 rotate-[-4deg] text-secondary font-bold text-sm bg-accent/10 px-3 py-1.5 rounded-lg border border-dashed border-accent">
        Small Steps, Big Progress ✦
      </div>
    </div>
  );
}
