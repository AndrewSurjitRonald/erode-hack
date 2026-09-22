import { assignArchetype, MasteryVector } from "@/lib/ml/cluster-model";
import { TopicMastery } from "@/lib/student-data";

// Must match the topic order the cluster model was trained on
// (scripts/train_cluster_model.py): Fractions, Ratios, Linear Equations, Percentages.
const ARCHETYPE_TOPIC_ORDER = ["Fractions", "Ratios", "Linear Equations", "Percentages"];

export function studentArchetype(topicMastery: TopicMastery[]): string {
  const byName = new Map(topicMastery.map((t) => [t.topicName, t.score]));
  const vector = ARCHETYPE_TOPIC_ORDER.map((name) => byName.get(name) ?? 0.5) as MasteryVector;
  return assignArchetype(vector);
}
