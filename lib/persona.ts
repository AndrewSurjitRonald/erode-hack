// Demo student profiles offered on the landing and profile pages
export const DEMO_STUDENT_NAMES = ["Aarav Sharma", "Arjun", "Diya", "Meera"];

export type StudentListItem = { id: string; name: string; overallMastery: number };

/** Short label for a student's overall mastery, used on the demo persona buttons. */
export function personaLabel(overallMastery: number): string {
  if (overallMastery >= 0.8) return "Mastered";
  if (overallMastery >= 0.65) return "Near-Mastery";
  if (overallMastery >= 0.5) return "Developing";
  return "Struggling";
}

export function personaTone(overallMastery: number): string {
  if (overallMastery >= 0.65) return "text-emerald-400";
  if (overallMastery >= 0.5) return "text-amber-400";
  return "text-red-400";
}
