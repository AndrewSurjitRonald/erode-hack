export const TOPIC_ICONS: Record<string, string> = {
  Fractions: "🍰",
  Ratios: "⚖️",
  "Linear Equations": "➗",
  Percentages: "💯",
};

export function topicIcon(topicName: string): string {
  return TOPIC_ICONS[topicName] ?? "📘";
}
