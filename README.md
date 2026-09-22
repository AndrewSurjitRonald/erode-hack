# Personalized Learning Path Generator

An adaptive Class 8 Mathematics practice tool. It diagnoses a student's level,
adapts question difficulty in real time using a trained ML model, tracks
per-topic mastery with an Elo-style algorithm, and gives teachers a live
dashboard — a heatmap, ML-derived learning archetypes, and per-student drill-down.

Built as a hackathon prototype: one full-stack Next.js app (no separate
backend service), SQLite-simple-to-Postgres database via Prisma, and a small
set of genuinely trained (not hand-coded) ML models whose weights are
exported as plain JSON and read at runtime with zero Python dependency.

**Full documentation lives in [`docs/`](docs/):**

| Doc | Covers |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit together, folder structure, request flow |
| [docs/ADAPTIVE-ENGINE.md](docs/ADAPTIVE-ENGINE.md) | The mastery-tracking + question-selection algorithm, line by line |
| [docs/ML-MODELS.md](docs/ML-MODELS.md) | All 5 trained models: what they predict, training data, accuracy, how to retrain |
| [docs/API.md](docs/API.md) | Every API route: method, params, request/response shape |
| [docs/DATABASE.md](docs/DATABASE.md) | Prisma schema, Postgres setup, migrations |

---

## Quickstart

```bash
npm install
npx prisma migrate dev   # applies schema to Postgres
npm run seed              # loads 4 topics x 10 questions
npm run dev                # http://localhost:3000
```

Requires a running Postgres instance and `DATABASE_URL` set in `.env`
(see [docs/DATABASE.md](docs/DATABASE.md) for local setup). No API keys
required — there is no external LLM call in this build.

To populate the teacher dashboard with realistic-looking data before a demo:

```bash
BASE_URL=http://localhost:3000 npx tsx scripts/simulate-demo-data.ts
```

To retrain the ML models (optional — trained weights are already committed
to `lib/models/*.json`):

```bash
python3 -m venv venv && source venv/bin/activate
pip install scikit-learn numpy
python scripts/train_difficulty_model.py
python scripts/train_cluster_model.py
python scripts/train_time_to_mastery_model.py
python scripts/train_topic_priority_model.py
python scripts/train_at_risk_model.py
```

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4**
- **Prisma 6** + **PostgreSQL** (local, via Homebrew)
- **Recharts** (installed; the dashboard heatmap is hand-rolled HTML/CSS per
  accessibility guidance — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md))
- **scikit-learn** (Python, training-time only) — logistic/linear regression
  and KMeans, exported to JSON for zero-dependency TypeScript inference

## What's genuinely "ML" here vs. hand-coded

Two things are commonly hand-coded in prototypes like this and were instead
**trained on data** (synthetic, since there's no real student data yet):

1. **Question difficulty selection** — a logistic regression, not an
   if/else ladder. See [docs/ML-MODELS.md](docs/ML-MODELS.md#model-1).
2. **Student learning archetypes** on the teacher dashboard — a KMeans
   clustering model, not a hardcoded rule. See
   [docs/ML-MODELS.md](docs/ML-MODELS.md#model-2).

Three more models were built alongside these (time-to-mastery estimation,
class-wide topic-priority ranking, an at-risk/declining-trend detector) —
trained and tested, but not all are wired into the UI. See
[docs/ML-MODELS.md](docs/ML-MODELS.md) for the full picture, including honest
accuracy numbers and where each model's fit is genuinely strong vs. weak.
