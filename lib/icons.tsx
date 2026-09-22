type IconProps = { className?: string };

const base = "stroke-current fill-none";

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M3 11.5 12 4l9 7.5" />
      <path className={base} d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function IconBookOpen({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M12 6.5c-1.5-1.3-4-2-7-2v13c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V4.5c-3 0-5.5.7-7 2Z" />
      <path className={base} d="M12 6.5v13" />
    </svg>
  );
}

export function IconFileText({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path className={base} d="M14 3v5h5" />
      <path className={base} d="M8 13h8M8 17h8M8 9h3" />
    </svg>
  );
}

export function IconTrendingUp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m3 17 6-6 4 4 8-8" />
      <path className={base} d="M15 7h6v6" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle className={base} cx="12" cy="8" r="3.5" />
      <path className={base} d="M4.5 20c1.5-3.8 5-5.5 7.5-5.5s6 1.7 7.5 5.5" />
    </svg>
  );
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle className={base} cx="9" cy="8" r="3" />
      <path className={base} d="M2.5 19c1.2-3.2 4-4.7 6.5-4.7s5.3 1.5 6.5 4.7" />
      <circle className={base} cx="17.5" cy="8.5" r="2.5" />
      <path className={base} d="M15.5 14.5c2 .2 4 1.6 5 4.5" />
    </svg>
  );
}

export function IconBarChart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function IconLightbulb({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M9 18h6M10 21h4" />
      <path className={base} d="M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.9v.2h5v-.2c0-.8.4-1.5 1-1.9A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function IconLogOut({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path className={base} d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconGraduationCap({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m2 9 10-5 10 5-10 5-10-5Z" />
      <path className={base} d="M6 11.5V17c0 1.4 2.7 3 6 3s6-1.6 6-3v-5.5" />
      <path className={base} d="M22 9v6" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function IconAlertTriangle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M12 3.5 22 20H2L12 3.5Z" />
      <path className={base} d="M12 10v4M12 17h.01" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle className={base} cx="12" cy="12" r="9" />
      <path className={base} d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function IconFlag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="M6 3v18" />
      <path className={base} d="M6 4h11l-2.5 3.5L17 11H6" />
    </svg>
  );
}

export function IconMountain({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path className={base} d="m4 20 6-11 4 6 2-3 4 8H4Z" />
      <path className={base} d="M9 20 14.5 9" />
    </svg>
  );
}
