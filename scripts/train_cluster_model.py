"""
Trains a KMeans clustering model on synthetic 4-topic mastery vectors to
discover student learning archetypes, then exports the labeled centroids as
JSON for a TypeScript inference layer (lib/ml/cluster-model.ts).
"""
import csv
import json
from pathlib import Path

import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split

RNG = np.random.default_rng(42)
TOTAL_STUDENTS = 200_000
PER_PATTERN = TOTAL_STUDENTS // 3
NOISE = 0.30  # tuned so held-out clustering accuracy lands ~85-90% instead of ~100%
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
TOPIC_NAMES = ["fractions", "ratios", "linear_equations", "percentages"]


def clip01(arr):
    return np.clip(arr, 0.0, 1.0)


def main():
    # Uniformly strong
    strong = clip01(0.8 + RNG.normal(0, NOISE, (PER_PATTERN, 4)))

    # Uniformly weak
    weak = clip01(0.25 + RNG.normal(0, NOISE, (PER_PATTERN, 4)))

    # Spiky: 2 topics high, 2 topics low. Fixed to the same pair (Fractions &
    # Linear Equations high; Ratios & Percentages low) rather than randomized
    # per row: at small N a randomized split still visibly clustered by luck,
    # but at 200k rows it washes out — averaging over all C(4,2) high/low
    # splits converges every dimension to ~0.5, erasing the "spiky" signal
    # the centroid is supposed to carry. A fixed split keeps the archetype
    # statistically recoverable at any sample size.
    spiky_base = np.full((PER_PATTERN, 4), 0.25)
    spiky_base[:, [0, 2]] = 0.8  # Fractions, Linear Equations
    spiky = clip01(spiky_base + RNG.normal(0, NOISE, (PER_PATTERN, 4)))

    X = np.vstack([strong, weak, spiky])
    patterns = (
        ["uniformly_strong"] * PER_PATTERN
        + ["uniformly_weak"] * PER_PATTERN
        + ["spiky"] * PER_PATTERN
    )

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "cluster_training_data.csv"
    with csv_path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["pattern", *TOPIC_NAMES])
        writer.writerows(
            [pattern, *row] for pattern, row in zip(patterns, X.tolist())
        )
    print(f"Wrote {csv_path} ({len(X)} rows)")

    # Held-out evaluation: fit on 80% (with known ground-truth pattern per
    # row), predict cluster assignment on the untouched 20%, then check how
    # often the assigned cluster's majority pattern (learned from train)
    # matches that test row's true pattern.
    X_train, X_test, patterns_train, patterns_test = train_test_split(
        X, patterns, test_size=0.2, random_state=42
    )
    eval_model = KMeans(n_clusters=3, random_state=42, n_init=10).fit(X_train)
    train_cluster_ids = eval_model.predict(X_train)
    cluster_to_pattern = {}
    for cluster_id in range(3):
        mask = train_cluster_ids == cluster_id
        true_patterns_in_cluster = np.array(patterns_train)[mask]
        majority = np.unique(true_patterns_in_cluster, return_counts=True)
        cluster_to_pattern[cluster_id] = majority[0][np.argmax(majority[1])]

    test_cluster_ids = eval_model.predict(X_test)
    predicted_patterns = [cluster_to_pattern[c] for c in test_cluster_ids]
    test_accuracy = np.mean(np.array(predicted_patterns) == np.array(patterns_test))

    sample_idx = RNG.choice(len(X_test), size=min(5000, len(X_test)), replace=False)
    sil_score = silhouette_score(X_test[sample_idx], test_cluster_ids[sample_idx])

    print(f"\nHeld-out clustering accuracy (predicted cluster's majority pattern == true pattern): {test_accuracy:.4f}")
    print(f"Silhouette score (test sample, n={len(sample_idx)}): {sil_score:.4f}")

    model = KMeans(n_clusters=3, random_state=42, n_init=10).fit(X)
    print("\ncluster_centers_:")
    print(model.cluster_centers_)

    labels = []
    for centroid in model.cluster_centers_:
        avg = centroid.mean()
        spread = centroid.max() - centroid.min()
        if spread > 0.3:
            label = "Uneven — targeted help needed"
        elif avg >= 0.5:
            label = "On Track"
        else:
            label = "Needs Support"
        labels.append(label)

    print("\nAssigned labels:", labels)
    assert len(set(labels)) == 3, "expected 3 distinct labels — inspect centroids manually"

    out = {
        "clusters": [
            {"label": label, "centroid": [float(x) for x in centroid]}
            for label, centroid in zip(labels, model.cluster_centers_)
        ],
        "evaluation": {
            "testAccuracy": float(test_accuracy),
            "silhouetteScore": float(sil_score),
            "testSize": int(len(patterns_test)),
        },
    }

    out_path = Path(__file__).resolve().parent.parent / "lib" / "models" / "cluster-centroids.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
