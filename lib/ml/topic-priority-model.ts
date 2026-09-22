import model from "../models/topic-priority-model.json";

export type TopicStats = {
  topicId: string;
  topicName: string;
  avgMastery: number;
  pctStruggling: number;
  stdMastery: number;
};

export type RankedTopic = TopicStats & { priority: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function predictPriority(avgMastery: number, pctStruggling: number, stdMastery: number): number {
  const raw =
    model.weights.avg_mastery * avgMastery +
    model.weights.pct_struggling * pctStruggling +
    model.weights.std_mastery * stdMastery +
    model.bias;
  return clamp(raw, 0, 100);
}

/**
 * Ranks topics by how urgently a teacher should focus whole-class
 * instruction on them, highest priority first.
 */
export function rankTopicsByPriority(topics: TopicStats[]): RankedTopic[] {
  return topics
    .map((t) => ({ ...t, priority: predictPriority(t.avgMastery, t.pctStruggling, t.stdMastery) }))
    .sort((a, b) => b.priority - a.priority);
}
