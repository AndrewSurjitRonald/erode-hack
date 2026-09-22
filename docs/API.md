# API Reference

All routes are Next.js App Router route handlers under `app/api/`. There is
no authentication — `studentId` is a plain `cuid()` the client holds in
`localStorage` (see `lib/session.ts`) and passes explicitly.

## `POST /api/student`

Creates a student (or returns an existing one with a case-insensitive
matching name — the most-active match if there are duplicates) and seeds a
`Mastery` row (score `0.5`) for every topic on first creation.

**File:** `app/api/student/route.ts`

**Request body:**
```json
{ "name": "Priya Sharma" }
```

**Response `200`:**
```json
{ "id": "cuid...", "name": "Priya Sharma" }
```

**Response `400`:** `{ "error": "Name is required" }` if `name` is empty/missing.

---

## `GET /api/student`

Lists all students, alphabetically by name.

**Response `200`:**
```json
{ "students": [{ "id": "...", "name": "..." }, ...] }
```

---

## `GET /api/student/[id]/summary`

One student's masteries, overall progress, and recent attempts — powers
the student's own `/dashboard` home page.

**File:** `app/api/student/[id]/summary/route.ts`

**Response `200`:**
```json
{
  "name": "Priya Sharma",
  "className": "Class 8 · Mathematics",
  "overallMastery": 0.63,
  "topicMastery": [
    { "topicId": "...", "topicName": "Fractions", "score": 0.63 },
    ...
  ],
  "hasNextQuestion": true,
  "weakTopicCount": 1,
  "totalAttempts": 42,
  "accuracy": 71,
  "recentAttempts": [
    {
      "id": "...", "questionText": "2/3 + 1/6 = ?", "topicName": "Fractions",
      "difficulty": 2, "correct": true, "createdAt": "2026-09-22T..."
    },
    ...
  ]
}
```
`recentAttempts` returns up to 20, newest-first. `weakTopicCount` uses the
same weak-topic rule as the adaptive engine.

**Response `404`:** `{ "error": "Student not found" }`

---

## `GET /api/quiz/next?studentId=<id>&topicId=<optional>`

Returns the next question to serve, using the diagnostic-then-adaptive
logic in `lib/quiz-service.ts`. Pass `topicId` (from the `/revision` page's
"Practice this" button, or `?topic=` on `/practice`) to restrict to one
topic and skip the diagnostic phase entirely.

**File:** `app/api/quiz/next/route.ts`

**Response `200` (diagnostic phase):**
```json
{
  "question": {
    "id": "...", "text": "2/3 + 1/6 = ?",
    "options": ["5/6", "3/9", "1/2", "4/6"],
    "difficulty": 2
  },
  "topic": { "id": "...", "name": "Fractions" },
  "reason": "Diagnostic question 1 of 8 for Fractions — establishing your baseline.",
  "mode": "diagnostic",
  "questionNumber": 1,
  "totalDiagnostic": 8
}
```

**Response `200` (adaptive phase):** same shape, `mode: "adaptive"`,
`reason` is one of the "Targeted Remediation" / "Interleaved
Reinforcement" / "Focused Practice" templates explaining the topic choice
(see [ADAPTIVE-ENGINE.md](ADAPTIVE-ENGINE.md#picking-the-topic-weighted-interleaved-sampling)),
`questionNumber` cycles `1..ADAPTIVE_SESSION_LENGTH` (15) for the
progress bar.

Note: `options` never includes which index is correct — that's resolved
server-side in `/api/quiz/answer` so it can never leak to the client.

**Response `400`:** `{ "error": "studentId is required" }`
**Response `404`:** `{ "error": "No question available" }` (e.g. restricted
to a topic with no questions matching the target difficulty band, which
shouldn't happen with the seeded data but is handled defensively)

---

## `POST /api/quiz/answer`

Records an attempt, updates that topic's `Mastery` row, returns whether
the answer was correct plus the student's full updated mastery snapshot.

**File:** `app/api/quiz/answer/route.ts`

**Request body:**
```json
{ "studentId": "...", "questionId": "...", "selectedIdx": 2 }
```

**Response `200`:**
```json
{
  "correct": false,
  "correctIdx": 0,
  "priorScore": 0.5,
  "newScore": 0.425,
  "scoreDelta": -0.075,
  "topicName": "Fractions",
  "updatedMastery": [
    { "topicId": "...", "topicName": "Fractions", "score": 0.425 },
    ...
  ]
}
```

**Response `400`:** missing/wrong-typed fields.
**Response `404`:** `{ "error": "Question not found" }`

---

## `GET /api/revision?studentId=<id>`

A student's weak topics with a time-to-mastery estimate for each — powers
`/revision`.

**File:** `app/api/revision/route.ts`

**Response `200`:**
```json
{
  "weakTopics": [
    {
      "topicId": "...", "topicName": "Ratios",
      "mastery": 22, "status": "Weak", "recentAccuracy": "18%",
      "attemptsToMastery": 34
    },
    ...
  ]
}
```
Uses the same weak-topic rule as the adaptive engine (`mastery < 0.5` AND
`attemptCount >= 3`); if that yields nothing, falls back to any
not-yet-mastered topic (`score < 0.8`), sorted weakest first.
`attemptsToMastery` comes from Model 3 (`predictAttemptsToMastery()`),
given the topic's current mastery and the student's recent accuracy on it
as an aptitude proxy.

---

## `GET /api/questions`

Lists every question with its topic name and observed pass rate — powers
the teacher `/teacher/resources` question-bank page.

**File:** `app/api/questions/route.ts`

**Response `200`:**
```json
{
  "questions": [
    {
      "id": "...", "topicId": "...", "topicName": "Fractions",
      "text": "1/2 + 1/4 = ?", "options": ["3/4", "1/6", "2/6", "1/8"],
      "answerIdx": 0, "difficulty": 1,
      "totalAttempts": 12, "passRate": 83
    },
    ...
  ]
}
```

## `POST /api/questions`

Adds a new question to the bank.

**Request body:**
```json
{ "topicId": "...", "text": "...", "options": ["a", "b", "c", "d"], "answerIdx": 0, "difficulty": 2 }
```

**Response `201`:** the created `Question` row.
**Response `400`:** `{ "error": "Missing required fields" }`
**Response `500`:** `{ "error": "<message>" }` on unexpected failure.

---

## `GET /api/dashboard`

Everything the teacher dashboard needs in one call: per-student mastery by
topic, archetype badge, at-risk/declining-trend flags, class-wide stats,
and topic-priority ranking.

**File:** `app/api/dashboard/route.ts`

**Response `200`:**
```json
{
  "students": [
    {
      "id": "...", "name": "Aisha Khan",
      "archetype": "On Track",
      "topicMastery": [
        { "topicId": "...", "topicName": "Fractions", "score": 0.78, "atRisk": false },
        ...
      ],
      "atRiskTopics": ["Percentages"],
      "isAtRisk": true
    },
    ...
  ],
  "classAverage": 0.61,
  "atRiskCount": 2,
  "needsAttentionCount": 1,
  "decliningCount": 5,
  "topicPriority": [
    {
      "topicId": "...", "topicName": "Ratios",
      "avgMastery": 0.49, "pctStruggling": 0.44, "stdMastery": 0.16,
      "priority": 71.5
    },
    ...
  ]
}
```
`archetype` comes from Model 2 ([ML-MODELS.md](ML-MODELS.md#model-2)) — the
mastery vector passed to it is built in a **fixed topic order** (Fractions,
Ratios, Linear Equations, Percentages), because that's the order the model
was trained on. `atRisk` / `atRiskTopics` / `isAtRisk` / `decliningCount`
come from Model 5 ([ML-MODELS.md](ML-MODELS.md#model-5)) — a per-topic
trend estimate over each student's last 10 attempts on that topic, distinct
from the static mastery-threshold-based `atRiskCount` (which counts
`Needs Support` archetypes). `topicPriority` comes from Model 4
([ML-MODELS.md](ML-MODELS.md#model-4)), ranked highest-priority first.

---

## `GET /api/dashboard/student/[id]`

One student's detail for the **teacher** drill-down view
(`/teacher/students/[id]`) — a separate, richer endpoint from the
student's own `/api/student/[id]/summary`, since a teacher wants the
archetype label and generated insights that a student's own home page
doesn't show.

**File:** `app/api/dashboard/student/[id]/route.ts`

**Response `200`:**
```json
{
  "name": "Priya Sharma",
  "className": "Class 8 · Mathematics",
  "status": "On Track",
  "overallMastery": 0.63,
  "questionsAttempted": 42,
  "accuracy": 0.71,
  "topicMastery": [
    { "topicId": "...", "topicName": "Fractions", "score": 0.63 },
    ...
  ],
  "recentAttempts": [
    {
      "id": "...", "topicName": "Fractions", "difficulty": 2,
      "correct": true, "createdAt": "2026-09-22T..."
    },
    ...
  ],
  "weakTopics": [
    { "topicId": "...", "topicName": "Ratios", "mastery": 31, "status": "Weak" }
  ],
  "insights": ["..."]
}
```
`status` is the Model 2 archetype label. `insights` is a small set of
data-driven observation strings (`lib/insights.ts`) — not an LLM call; it
reuses Model 5's `estimateTrend()` helper against the student's own recent
attempts. `recentAttempts` returns up to 30, newest-first.

**Response `404`:** `{ "error": "Student not found" }`

---

## `POST /api/explain`

Generates a question-specific step-by-step solution and, if the student
answered incorrectly, a misconception diagnosis — powers the "Step-by-Step
Solution" panel on `/practice`, called right after `/api/quiz/answer`
returns.

**File:** `app/api/explain/route.ts`

**Request body:**
```json
{
  "questionText": "2/3 + 1/6 = ?",
  "topicName": "Fractions",
  "options": ["5/6", "3/9", "1/2", "4/6"],
  "correctIdx": 0,
  "selectedIdx": 2,
  "lang": "en"
}
```
`selectedIdx` is `null`/omitted when the student answered correctly (no
misconception to diagnose). `lang` is `"en"` or `"ta"` — the response
strings come back in that language.

**Response `200`:**
```json
{
  "hint": "Find a common denominator before adding.",
  "steps": [
    "The denominators are 3 and 6.",
    "The LCM of 3 and 6 is 6, so rewrite 2/3 as 4/6.",
    "4/6 + 1/6 = 5/6."
  ],
  "misconception": "You likely added the denominators directly (3 + 6 = 9) instead of finding their LCM.",
  "source": "llm"
}
```
This is the one place in the app that calls an external LLM (the Groq API
via `groq-sdk`, model `llama-3.3-70b-versatile`, JSON-object response mode
with a hand-written shape check — no structured-output schema enforcement)
— everything else (question selection, difficulty, mastery tracking, the
five trained ML models) is either deterministic or a local scikit-learn
model. When `GROQ_API_KEY` is unset, the response doesn't parse as JSON, or
it doesn't match the expected `{hint, steps, misconception}` shape, this
route falls back to the static per-topic text in `lib/explanations.ts` and
returns `"source": "fallback"` instead of `"llm"` — the route never errors
out just because the key is missing or the model misbehaves.

**Response `400`:** `{ "error": "Missing required fields" }`
