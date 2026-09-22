"""
Trains a linear regression that scores how urgently a teacher should focus
whole-class instruction on a topic (0-100), from three class-wide stats for
that topic: average mastery, the fraction of students struggling (<0.5),
and the spread (std dev) of mastery across the class.

Ground truth is a noisy sigmoid-based formula (topics with low average
mastery, a high struggling fraction, or high spread are more urgent), and
the regression has to recover that relationship from noisy samples.

Exports lib/models/topic-priority-model.json for
lib/ml/topic-priority-model.ts, used to rank topics on the teacher
dashboard's "class focus" panel.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

RNG = np.random.default_rng(42)
N = 200_000
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def main():
    avg_mastery = RNG.uniform(0, 1, N)
    # pct_struggling correlates with low avg_mastery but has independent noise
    pct_struggling = np.clip(
        (1 - avg_mastery) * RNG.uniform(0.4, 1.1, N) + RNG.normal(0, 0.08, N), 0, 1
    )
    std_mastery = RNG.uniform(0, 0.3, N)

    ground_truth = 100 * sigmoid(
        6 * (0.5 - avg_mastery) + 3 * pct_struggling + 4 * std_mastery
    )
    priority = np.clip(ground_truth + RNG.normal(0, 4, N), 0, 100)  # tuned for R^2 ~0.86

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "topic_priority_training_data.csv"
    np.savetxt(
        csv_path,
        np.column_stack([avg_mastery, pct_struggling, std_mastery, priority]),
        delimiter=",",
        header="avg_mastery,pct_struggling,std_mastery,priority",
        comments="",
        fmt="%.6f",
    )
    print(f"Wrote {csv_path} ({N} rows)")

    X = np.column_stack([avg_mastery, pct_struggling, std_mastery])
    y = priority

    # Held-out evaluation: fit on 80%, report R^2 / MAE on the untouched 20%.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    eval_model = LinearRegression().fit(X_train, y_train)
    y_pred = eval_model.predict(X_test)
    test_r2 = r2_score(y_test, y_pred)
    test_mae = mean_absolute_error(y_test, y_pred)
    print(f"\nHeld-out test R^2: {test_r2:.4f}")
    print(f"Held-out test MAE: {test_mae:.2f} priority points (0-100 scale)")

    model = LinearRegression().fit(X, y)
    print("\ncoef_ (avg_mastery, pct_struggling, std_mastery):", model.coef_)
    print("intercept_:", model.intercept_)

    m_coef, s_coef, sd_coef = model.coef_
    assert m_coef < 0, "higher avg mastery should mean lower priority"
    assert s_coef > 0, "more struggling students should mean higher priority"
    assert sd_coef > 0, "more spread (unevenness) should mean higher priority"
    print("Sign check passed: avg_mastery(-), pct_struggling(+), std_mastery(+)")

    print("\nSanity predictions:")
    print(
        "priority(avg=0.85, struggling=0.05, std=0.05) =",
        model.predict([[0.85, 0.05, 0.05]])[0],
        "(expect low)",
    )
    print(
        "priority(avg=0.2, struggling=0.8, std=0.2) =",
        model.predict([[0.2, 0.8, 0.2]])[0],
        "(expect high)",
    )

    out = {
        "weights": {
            "avg_mastery": float(m_coef),
            "pct_struggling": float(s_coef),
            "std_mastery": float(sd_coef),
        },
        "bias": float(model.intercept_),
        "evaluation": {
            "testR2": float(test_r2),
            "testMae": float(test_mae),
            "testSize": int(len(y_test)),
        },
    }

    out_path = Path(__file__).resolve().parent.parent / "lib" / "models" / "topic-priority-model.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
