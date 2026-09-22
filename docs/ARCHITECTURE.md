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
  page.tsx                     Landing page (role picker: Student / Teacher)
  practice/page.tsx            Student practice UI (diagnostic + adaptive),
                                 formerly quiz/page.tsx
  revision/page.tsx            Student's weak-topic list + "Practice this"
                                 + time-to-mastery estimate (Model 3)
  dashboard/page.tsx           Student's own home dashboard (progress rings,
                                 gamification bar, shortcuts) — NOT the
                                 teacher view, despite the name
  profile/page.tsx             Student profile page
  progress/page.tsx            Student progress page
  teacher/page.tsx              Teacher class dashboard: heatmap + archetype
                                 donut + declining-trend badges (Model 5)
  teacher/class-insights/page.tsx  Cohort diagnostics + Class Focus panel
                                 (Model 4) + persona distribution
  teacher/resources/page.tsx    Question bank management (create/view
                                 questions per topic)
  teacher/students/[id]/page.tsx  Per-student drill-down for teachers
  api/
    student/route.ts             POST create-or-find student (case-
                                   insensitive name match), GET list students
    student/[id]/summary/route.ts  GET one student's masteries, weak topics,
                                   attempts, and generated insights — powers
                                   the student dashboard/profile
    dashboard/route.ts            GET all students shaped for the teacher
                                   heatmap: archetype (Model 2), at-risk
                                   topics (Model 5), class-wide topic
                                   priority ranking (Model 4)
    dashboard/student/[id]/route.ts  GET one student's detail for the
                                   teacher drill-down view
    quiz/next/route.ts            GET next question (diagnostic or adaptive)
    quiz/answer/route.ts          POST an answer, updates Attempt + Mastery
    revision/route.ts             GET a student's weak topics with
                                   attempts-to-mastery estimate (Model 3)
    questions/route.ts            GET/POST the question bank (teacher
                                   resources page)

lib/
  prisma.ts                    Prisma client singleton
  session.ts                    Client-side localStorage session (no auth)
  colors.ts                     Mastery color-band mapping (status palette)
  brand.ts                      Shared copy constants (e.g. CLASS_LABEL)
  archetype.ts                  Builds the fixed-order mastery vector and
                                 calls Model 2's assignArchetype()
  student-data.ts               Shared per-student query helpers (mastery,
                                 weak topics, attempt counts) used by
                                 multiple API routes
  insights.ts                   Generates plain-English insight strings for
                                 the student summary endpoint — also reuses
                                 Model 5's estimateTrend() helper
  gamification.ts                Streaks/XP/badge logic for GamificationBar
  explanations.ts                Hand-written per-topic hint/step-by-step
                                 text shown after an incorrect answer (not
                                 ML — a lookup table, unlike selectDifficulty)
  topic-icons.ts                  Emoji icon per topic name, for UI badges
  adaptive-engine.ts             Core algorithm: pure functions, no DB access
  quiz-service.ts                DB-aware layer: wraps adaptive-engine with
                                 Prisma queries, handles the diagnostic phase
  ml/
    difficulty-model.ts          Inference for Model 1 (wired into engine)
    cluster-model.ts             Inference for Model 2 (wired into
                                   /teacher's heatmap)
    time-to-mastery-model.ts     Inference for Model 3 (wired into /revision)
    topic-priority-model.ts      Inference for Model 4 (wired into
                                   /teacher/class-insights)
    at-risk-model.ts             Inference for Model 5 (wired into
                                   /teacher's declining-trend badge)
  models/
    *.json                       Trained weights, one file per model

prisma/
  schema.prisma                 Data model (Student, Topic, Question, Attempt, Mastery)
  seed.ts                       Loads the 4 topics x 10 questions, idempotent
                                 per topic (safe to re-run)
  migrations/                   SQL migration history

scripts/
  train_*.py                    Python: generates synthetic data, trains a
                                 model, writes lib/models/*.json + data/*.csv
  test-*.ts                     TypeScript: sanity-checks each ml/*.ts layer
  test-engine.ts                Simulates 30 attempts through the adaptive
                                 engine, prints the mastery trajectory
  simulate-demo-data.ts          Plays fake students through the real
                                 engine (via Prisma directly) to seed a
                                 realistic-looking teacher dashboard

data/
  *.csv                          The synthetic training data each Python
                                 script generates (200k rows each)

components/
  Sidebar.tsx                    Student/teacher nav shell
  MasteryRing.tsx                Per-topic/overall mastery ring (student
                                 dashboard), successor to MasteryBar
  ArchetypeDonut.tsx              Archetype distribution chart (Model 2)
  GamificationBar.tsx             Streaks/XP/badges strip
  Confetti.tsx, GrowthIllustration.tsx, Logo.tsx, PitchDeckModal.tsx,
  Scratchpad.tsx                  Supporting UI
```

## Request flow: a student answers a question

```
Browser (app/practice/page.tsx)
  -> GET /api/quiz/next?studentId=...
       app/api/quiz/next/route.ts
         -> lib/quiz-service.ts: getNextQuestion()
              - counts the student's total attempts
              - if < topics.length x 2: diagnostic phase (see ADAPTIVE-ENGINE.md)
              - else: adaptive phase
                  -> lib/adaptive-engine.ts: selectTargetTopic()
                       - weighted interleaved sampling over unmastered
                         topics, not pure greedy weakest-first
                       -> lib/ml/difficulty-model.ts: selectDifficulty()
                            (Model 1 — logistic regression inference)
                  -> lib/adaptive-engine.ts: selectQuestion()
       <- { question, topic, reason, mode, questionNumber, totalDiagnostic }
  -> student picks an option
  -> POST /api/quiz/answer { studentId, questionId, selectedIdx }
       app/api/quiz/answer/route.ts
         - looks up the question's real answerIdx server-side (never sent
           to the client) to determine correct/incorrect
         - lib/adaptive-engine.ts: updateMastery() — Elo-style update
         - upserts the Mastery row in Postgres
       <- { correct, correctIdx, priorScore, newScore, scoreDelta,
            topicName, updatedMastery }
  -> mastery bar animates, feedback + reason shown
```

## Request flow: teacher dashboard

```
Browser (app/teacher/page.tsx, app/teacher/class-insights/page.tsx)
  -> GET /api/dashboard
       app/api/dashboard/route.ts
         - fetches all students with their Mastery rows and Attempt history
         - builds a 4-number mastery vector per student, in the FIXED
           topic order the cluster model was trained on (Fractions,
           Ratios, Linear Equations, Percentages) — order matters here,
           since it must match training time exactly
         -> lib/ml/cluster-model.ts: assignArchetype()
              (Model 2 — nearest-centroid KMeans inference)
         - for each student x topic: lib/ml/at-risk-model.ts estimateTrend()
           + isAtRisk() over their last 10 attempts on that topic
              (Model 5 — declining-trend detector)
         - aggregates class-wide avgMastery / pctStruggling / stdMastery
           per topic, then lib/ml/topic-priority-model.ts rankTopicsByPriority()
              (Model 4 — class-wide instructional priority)
       <- { students: [{ archetype, topicMastery, atRiskTopics, isAtRisk }],
            classAverage, atRiskCount, needsAttentionCount, decliningCount,
            topicPriority }
  -> /teacher renders the heatmap (color-coded cells, archetype badge,
     declining-trend flag per student)
  -> /teacher/class-insights renders the Class Focus panel from topicPriority
  -> clicking a student -> GET /api/dashboard/student/[id] for the teacher
     drill-down (a separate endpoint from the student's own summary)
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
