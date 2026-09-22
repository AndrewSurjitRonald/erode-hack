export function GrowthIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center py-4">
      {/* Soft background blue glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/60 via-sky-50/50 to-blue-200/40 rounded-3xl blur-2xl -z-10 transform scale-95" />

      <svg viewBox="0 0 520 420" className="w-full h-auto drop-shadow-sm select-none" fill="none">
        <defs>
          <linearGradient id="stepPractice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="stepImprove" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="stepMaster" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="flagGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1E3A8A" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Ambient clouds in background */}
        <g fill="url(#cloudGrad)" opacity="0.85">
          <path d="M60 360 C50 340, 70 320, 100 325 C115 310, 145 315, 155 335 C175 335, 185 355, 170 375 Z" />
          <path d="M410 240 C400 220, 425 205, 450 210 C465 195, 495 200, 505 220 C520 225, 525 245, 510 260 Z" />
          <path d="M340 370 C330 350, 355 330, 385 335 C400 320, 430 325, 440 345 C460 350, 465 370, 445 385 Z" opacity="0.9" />
        </g>

        {/* Star decorations */}
        <path d="M90 140 Q95 145 100 140 Q95 135 90 140 Z" fill="#93C5FD" />
        <text x="440" y="300" fill="#93C5FD" fontSize="18" fontWeight="bold">✦</text>
        <text x="210" y="80" fill="#60A5FA" fontSize="14" fontWeight="bold">✦</text>
        <text x="70" y="240" fill="#93C5FD" fontSize="16" fontWeight="bold">✦</text>

        {/* STAIR 1: "Practice" */}
        <g filter="url(#softShadow)">
          <path
            d="M 120 310 L 220 310 L 220 390 L 120 390 Z"
            fill="url(#stepPractice)"
            rx="12"
          />
          <text
            x="170"
            y="355"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            Practice
          </text>
        </g>

        {/* STAIR 2: "Improve" */}
        <g filter="url(#softShadow)">
          <path
            d="M 230 220 L 330 220 L 330 390 L 230 390 Z"
            fill="url(#stepImprove)"
            rx="12"
          />
          <text
            x="280"
            y="265"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            Improve
          </text>
        </g>

        {/* STAIR 3: "Master" */}
        <g filter="url(#softShadow)">
          <path
            d="M 340 130 L 440 130 L 440 390 L 340 390 Z"
            fill="url(#stepMaster)"
            rx="12"
          />
          <text
            x="390"
            y="175"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="16"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            Master
          </text>
        </g>

        {/* Top Flag on Step 3 */}
        <g transform="translate(420, 65)">
          {/* Flagpole */}
          <line x1="0" y1="0" x2="0" y2="65" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          {/* Flag cloth */}
          <path
            d="M 0 5 Q 24 -2 45 10 Q 24 22 0 16 Z"
            fill="url(#flagGrad)"
          />
          {/* Flag ball tip */}
          <circle cx="0" cy="0" r="3.5" fill="#F59E0B" />
        </g>

        {/* STUDENT CHARACTER climbing from step 1 towards step 2 */}
        <g transform="translate(145, 140)">
          {/* Shadow beneath student */}
          <ellipse cx="65" cy="170" rx="20" ry="5" fill="#1E3A8A" opacity="0.2" />

          {/* Student Backpack (Navy/Teal) */}
          <rect x="36" y="70" width="18" height="28" rx="7" fill="#1E3A8A" />
          <path d="M 44 74 L 44 92" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />

          {/* Student Legs */}
          {/* Back leg standing on step 1 */}
          <path d="M 52 118 L 50 162" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
          {/* Shoe */}
          <ellipse cx="48" cy="164" rx="7" ry="4" fill="#3B82F6" />

          {/* Front leg stepping up onto step 2 */}
          <path d="M 64 118 L 74 140 L 92 145" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
          {/* Front Shoe */}
          <ellipse cx="94" cy="145" rx="7" ry="4" fill="#3B82F6" />

          {/* Student Body (Blue shirt) */}
          <path
            d="M 48 68 Q 62 65 72 70 L 68 120 Q 56 122 48 120 Z"
            fill="#2563EB"
            rx="8"
          />

          {/* Student Head & Hair */}
          <circle cx="68" cy="42" r="14" fill="#FCD34D" />
          {/* Hair (Dark) */}
          <path
            d="M 55 40 C 55 24, 78 20, 80 32 C 82 36, 80 44, 76 44 C 74 38, 70 35, 64 36 Z"
            fill="#1E293B"
          />
          {/* Cheerful eye & smile */}
          <circle cx="73" cy="40" r="1.5" fill="#1E293B" />
          <path d="M 72 46 Q 75 49 78 47" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Student Arm reaching forward and up */}
          <path
            d="M 58 74 L 78 88 L 94 76"
            stroke="#FCD34D"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* SPEECH BUBBLE: "Small Steps Big Progress" */}
        <g transform="translate(195, 30) rotate(-6)">
          <rect
            x="0"
            y="0"
            width="170"
            height="46"
            rx="23"
            fill="#FFFFFF"
            stroke="#93C5FD"
            strokeWidth="2"
            filter="url(#softShadow)"
          />
          {/* Little speech tail pointing down */}
          <path d="M 30 44 L 24 54 L 38 45 Z" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="1.5" />
          <text
            x="85"
            y="20"
            textAnchor="middle"
            fill="#1E293B"
            fontSize="12"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            Small Steps
          </text>
          <text
            x="85"
            y="35"
            textAnchor="middle"
            fill="#2563EB"
            fontSize="13"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
          >
            Big Progress
          </text>
        </g>
      </svg>
    </div>
  );
}
