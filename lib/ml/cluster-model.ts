import clusterData from "../models/cluster-centroids.json";

export type MasteryVector = [number, number, number, number];

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function assignArchetype(masteryVector: MasteryVector): string {
  let best = clusterData.clusters[0];
  let bestDistance = euclideanDistance(masteryVector, best.centroid);

  for (const cluster of clusterData.clusters.slice(1)) {
    const distance = euclideanDistance(masteryVector, cluster.centroid);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = cluster;
    }
  }

  return best.label;
}
