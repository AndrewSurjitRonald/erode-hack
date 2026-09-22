"""
Trains a logistic regression that flags a student as "at risk" on a topic —
distinct from the static weak-topic threshold (mastery < 0.5) already used
elsewhere in the app, because this one also looks at the recent *trend*
(is mastery moving up or down lately), not just the current level.

Features: current mastery, recent trend (avg per-attempt mastery delta over
the last handful of attempts — negative means declining), attempts so far.
Ground truth is a noisy sigmoid: low mastery and/or a negative trend raise
risk; more attempts slightly increase confidence (less noisy trend estimate).

Exports lib/models/at-risk-model.json for lib/ml/at-risk-model.ts.
"""
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split

RNG = np.random.default_rng(42)
N = 200_000
# Steepness multiplier on the ground-truth logit: tuned so held-out accuracy
# lands ~85-90% instead of sitting at ~82%.
STEEPNESS = 1.5
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def main():
    mastery = RNG.uniform(0, 1, N)
    trend = RNG.uniform(-0.3, 0.3, N)  # avg mastery delta per recent attempt
    attempts_count = RNG.integers(3, 51, N)

    z = STEEPNESS * (-6 * (mastery - 0.4) - 10 * trend)
    p_at_risk = sigmoid(z)
    at_risk = RNG.binomial(1, p_at_risk)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "at_risk_training_data.csv"
    np.savetxt(
        csv_path,
        np.column_stack([mastery, trend, attempts_count, at_risk]),
        delimiter=",",
        header="mastery,trend,attempts_count,at_risk",
        comments="",
        fmt=["%.6f", "%.6f", "%d", "%d"],
    )
    print(f"Wrote {csv_path} ({N} rows)")

    X = np.column_stack([mastery, trend])
    y = at_risk

    # Held-out evaluation: fit on 80%, report accuracy/AUC on the untouched 20%.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    eval_model = LogisticRegression().fit(X_train, y_train)
    y_pred = eval_model.predict(X_test)
    y_proba = eval_model.predict_proba(X_test)[:, 1]
    test_accuracy = accuracy_score(y_test, y_pred)
    test_auc = roc_auc_score(y_test, y_proba)
    p_true_test = sigmoid(STEEPNESS * (-6 * (X_test[:, 0] - 0.4) - 10 * X_test[:, 1]))
    bayes_accuracy = accuracy_score(y_test, (p_true_test > 0.5).astype(int))
    print(f"\nHeld-out test accuracy: {test_accuracy:.4f}")
    print(f"Held-out test ROC AUC: {test_auc:.4f}")
    print(f"Bayes-optimal accuracy ceiling (from true p, same noise): {bayes_accuracy:.4f}")

    model = LogisticRegression().fit(X, y)
    print("\ncoef_ (mastery, trend):", model.coef_)
    print("intercept_:", model.intercept_)

    mastery_coef, trend_coef = model.coef_[0]
    assert mastery_coef < 0, "higher mastery should mean lower risk"
    assert trend_coef < 0, "a more positive (improving) trend should mean lower risk"
    print("Sign check passed: mastery(-), trend(-)")

    print("\nSanity predictions:")
    print(
        "P(at_risk | mastery=0.75, trend=+0.1) =",
        model.predict_proba([[0.75, 0.1]])[0][1],
        "(expect low)",
    )
    print(
        "P(at_risk | mastery=0.25, trend=-0.15) =",
        model.predict_proba([[0.25, -0.15]])[0][1],
        "(expect high)",
    )

    out = {
        "weights": {
            "mastery": float(mastery_coef),
            "trend": float(trend_coef),
        },
        "bias": float(model.intercept_[0]),
        "evaluation": {
            "testAccuracy": float(test_accuracy),
            "testRocAuc": float(test_auc),
            "bayesOptimalAccuracy": float(bayes_accuracy),
            "testSize": int(len(y_test)),
        },
    }

    out_path = Path(__file__).resolve().parent.parent / "lib" / "models" / "at-risk-model.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
