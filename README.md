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
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Start database (Choose Option A or Option B):
# Option A (Easiest - Docker):
docker compose up -d

# Option B (Local Mac Postgres):
# brew services start postgresql
# createdb erodehack
# (ensure DATABASE_URL in .env matches: postgresql://<your-username>@localhost:5432/erodehack)

# 4. Apply schema and seed initial questions
npx prisma db push
npm run seed              # loads 4 topics x 10 questions

# 5. Start dev server
npm run dev                # http://localhost:3000 (or 3001)
```

Requires a running Postgres instance and `DATABASE_URL` set in `.env`
(see [docs/DATABASE.md](docs/DATABASE.md) for detailed credentials setup & troubleshooting). No API keys
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

Three more models are wired in alongside these: time-to-mastery estimation
(`/revision`'s "attempts to mastery" estimate), class-wide topic-priority
ranking (`/teacher/class-insights`'s Class Focus panel), and an
at-risk/declining-trend detector (`/teacher`'s heatmap flag). See
[docs/ML-MODELS.md](docs/ML-MODELS.md) for the full picture, including honest
accuracy numbers and where each model's fit is genuinely strong vs. weak.
