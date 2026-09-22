"""
Trains a logistic regression that predicts P(correct | mastery, difficulty)
on synthetic attempt data, then exports the learned weights as JSON for a
TypeScript inference layer to consume at runtime (lib/ml/difficulty-model.ts).
"""
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split

RNG = np.random.default_rng(42)
N = 200_000
# Steepness of the ground-truth sigmoid: higher means mastery/difficulty more
# strongly determine the outcome (less irreducible label noise), which raises
# the achievable accuracy ceiling. Tuned so held-out accuracy lands ~85-90%.
STEEPNESS = 11
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def main():
    mastery = RNG.uniform(0, 1, N)
    difficulty = RNG.integers(1, 4, N)  # 1, 2, or 3

    p = sigmoid(STEEPNESS * (mastery - 0.2 * difficulty))
    correct = RNG.binomial(1, p)

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_path = DATA_DIR / "difficulty_training_data.csv"
    np.savetxt(
        csv_path,
        np.column_stack([mastery, difficulty, correct]),
        delimiter=",",
        header="mastery,difficulty,correct",
        comments="",
        fmt=["%.6f", "%d", "%d"],
    )
    print(f"Wrote {csv_path} ({N} rows)")

    X = np.column_stack([mastery, difficulty])
    y = correct

    # Held-out evaluation: fit on 80%, report accuracy/AUC on the untouched 20%.
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    eval_model = LogisticRegression().fit(X_train, y_train)
    y_pred = eval_model.predict(X_test)
    y_proba = eval_model.predict_proba(X_test)[:, 1]
    test_accuracy = accuracy_score(y_test, y_pred)
    test_auc = roc_auc_score(y_test, y_proba)
    # Ground-truth-optimal accuracy: how well the TRUE generating p(correct)
    # would classify, i.e. the noise ceiling — no model can beat this on
    # average, since `correct` was itself sampled from a coin flip.
    p_true_test = sigmoid(STEEPNESS * (X_test[:, 0] - 0.2 * X_test[:, 1]))
    bayes_accuracy = accuracy_score(y_test, (p_true_test > 0.5).astype(int))
    print(f"\nHeld-out test accuracy: {test_accuracy:.4f}")
    print(f"Held-out test ROC AUC: {test_auc:.4f}")
    print(f"Bayes-optimal accuracy ceiling (from true p, same noise): {bayes_accuracy:.4f}")

    # Final model: refit on the full dataset for the shipped weights.
    model = LogisticRegression().fit(X, y)

    print("\ncoef_ (mastery, difficulty):", model.coef_)
    print("intercept_:", model.intercept_)

    mastery_coef = model.coef_[0][0]
    difficulty_coef = model.coef_[0][1]
    assert mastery_coef > 0, "mastery coefficient should be positive"
    assert difficulty_coef < 0, "difficulty coefficient should be negative"
    print("Sign check passed: mastery(+), difficulty(-)")

    print("\nSanity predictions:")
    print("P(correct | mastery=0.8, difficulty=1) =", model.predict_proba([[0.8, 1]])[0][1])
    print("P(correct | mastery=0.2, difficulty=3) =", model.predict_proba([[0.2, 3]])[0][1])

    out = {
        "weights": {
            "mastery": float(mastery_coef),
            "difficulty": float(difficulty_coef),
        },
        "bias": float(model.intercept_[0]),
        "evaluation": {
            "testAccuracy": float(test_accuracy),
            "testRocAuc": float(test_auc),
            "bayesOptimalAccuracy": float(bayes_accuracy),
            "testSize": int(len(y_test)),
        },
    }

    out_path = Path(__file__).resolve().parent.parent / "lib" / "models" / "difficulty-model.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    main()
