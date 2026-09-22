# Architecture

## Why one Next.js app, not separate services

The scope decision from day one: build this as **one full-stack Next.js
(App Router) application** in TypeScript, not separate frontend/backend
services. The "adaptive engine" and "ML inference" logic live in plain
TypeScript modules under `lib/`, called directly from Next.js API routes.
This keeps the whole thing runnable with one `npm run dev` and trivially
deployable, while still being accurate to describe as "an adaptive engine
with a trained ML model" — it genuinely is one, just not a microservice.

## Folder structure

```
app/
  page.tsx                    Landing page (role picker: Student / Teacher)
  quiz/page.tsx                Student quiz UI (diagnostic + adaptive)
  revision/page.tsx            Student's weak-topic list + "Practice this"
  dashboard/page.tsx           Teacher heatmap + student drill-down
  api/
    student/route.ts            POST create student, GET list students
    student/[id]/route.ts       GET one student's masteries/weak topics/attempts
    quiz/next/route.ts          GET next question (diagnostic or adaptive)
    quiz/answer/route.ts        POST an answer, updates Attempt + Mastery
    dashboard/route.ts          GET all students shaped for the heatmap

lib/
  prisma.ts                    Prisma client singleton
  session.ts                   Client-side localStorage session (no auth)
  colors.ts                    Mastery color-band mapping (status palette)
  adaptive-engine.ts            Core algorithm: pure functions, no DB access
  quiz-service.ts               DB-aware layer: wraps adaptive-engine with
                                 Prisma queries, handles the diagnostic phase
  ml/
    difficulty-model.ts          Inference for Model 1 (wired into engine)
    cluster-model.ts             Inference for Model 2 (wired into dashboard)
    time-to-mastery-model.ts     Inference for Model 3 (trained, not wired)
    topic-priority-model.ts      Inference for Model 4 (trained, not wired)
    at-risk-model.ts             Inference for Model 5 (trained, not wired)
  models/
    *.json                       Trained weights, one file per model

prisma/
  schema.prisma                 Data model (Student, Topic, Question, Attempt, Mastery)
  seed.ts                       Loads the 4 topics x 10 questions
  migrations/                   SQL migration history

scripts/
  train_*.py                    Python: generates synthetic data, trains a
                                 model, writes lib/models/*.json + data/*.csv
  test-*.ts                     TypeScript: sanity-checks each ml/*.ts layer
  test-engine.ts                Simulates 30 attempts through the adaptive
                                 engine, prints the mastery trajectory
  simulate-demo-data.ts          Plays 3 fake students through the real
                                 engine (via Prisma directly) to seed a
                                 realistic-looking teacher dashboard

data/
  *.csv                          The synthetic training data each Python
                                 script generates (200k rows each)

components/
  MasteryBar.tsx                 Animated per-topic mastery bar (quiz page)
```

## Request flow: a student answers a question

```
Browser (app/quiz/page.tsx)
  -> GET /api/quiz/next?studentId=...
       app/api/quiz/next/route.ts
         -> lib/quiz-service.ts: getNextQuestion()
              - counts the student's total attempts
              - if < 8: diagnostic phase (see ADAPTIVE-ENGINE.md)
              - else: adaptive phase
                  -> lib/adaptive-engine.ts: selectTargetTopic()
                       -> lib/ml/difficulty-model.ts: selectDifficulty()
                            (Model 1 — logistic regression inference)
                  -> lib/adaptive-engine.ts: selectQuestion()
       <- { question, reason, phase }
  -> student picks an option
  -> POST /api/quiz/answer { studentId, questionId, selectedIdx }
       app/api/quiz/answer/route.ts
         - looks up the question's real answerIdx server-side (never sent
           to the client) to determine correct/incorrect
         - lib/adaptive-engine.ts: updateMastery() — Elo-style update
         - upserts the Mastery row in Postgres
       <- { correct, correctIdx, mastery }
  -> mastery bar animates, feedback + reason shown
```

## Request flow: teacher dashboard

```
Browser (app/dashboard/page.tsx)
  -> GET /api/dashboard
       app/api/dashboard/route.ts
         - fetches all students with their Mastery rows
         - builds a 4-number mastery vector per student, in the FIXED
           topic order the cluster model was trained on (Fractions,
           Ratios, Linear Equations, Percentages) — order matters here,
           since it must match training time exactly
         -> lib/ml/cluster-model.ts: assignArchetype()
              (Model 2 — nearest-centroid KMeans inference)
         - computes weak topics per student (lib/adaptive-engine.ts)
       <- { topics, students: [{ masteryByTopic, archetype, weakTopics, ... }] }
  -> heatmap renders (color-coded cells, archetype badge per student)
  -> clicking a student -> GET /api/student/[id] for attempt history
```

## No authentication, by design

This is a demo prototype: the landing page is a hardcoded role picker
(Student / Teacher), no passwords. A student's identity is just a `cuid()`
stored in `localStorage` (`lib/session.ts`) — there's no session/JWT/cookie
layer. Do not use this auth pattern outside a demo context.

## Database: SQLite -> Postgres

The build started on SQLite (Prisma's zero-setup option for a fast start),
then was migrated to a local PostgreSQL instance (via Homebrew) so the data
could be inspected in DBeaver like a normal relational database. See
[DATABASE.md](DATABASE.md) for the full schema and connection details. The
switch only touched `prisma/schema.prisma`'s `datasource` block and
`DATABASE_URL` — application code is unaware of which database engine is
behind Prisma.

## Why the heatmap isn't a Recharts component

Recharts is installed (per the original tech-stack spec) but has no native
heatmap primitive. The teacher dashboard's topic x student grid is
hand-rolled as a colored HTML table instead, following a dataviz
accessibility pass: cells use a fixed 3-step status palette (red/amber/green)
with the percentage always printed as visible text inside the cell — so
identity/severity is never color-alone, and the page works for colorblind
viewers without relying on hue discrimination.
