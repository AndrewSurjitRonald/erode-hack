# API Reference

All routes are Next.js App Router route handlers under `app/api/`. There is
no authentication — `studentId` is a plain `cuid()` the client holds in
`localStorage` (see `lib/session.ts`) and passes explicitly.

## `POST /api/student`

Creates a student and seeds a `Mastery` row (score `0.5`) for every topic.

**File:** `app/api/student/route.ts`

**Request body:**
```json
{ "name": "Priya Sharma" }
```

**Response `200`:**
```json
{ "student": { "id": "cuid...", "name": "Priya Sharma" } }
```

**Response `400`:** `{ "error": "Name is required" }` if `name` is empty/missing.

---

## `GET /api/student`

Lists all students, alphabetically by name. (Not currently used by any
page — available for future use.)

**Response `200`:**
```json
{ "students": [{ "id": "...", "name": "..." }, ...] }
```

---

## `GET /api/student/[id]`

One student's masteries, weak topics, and full attempt history — powers
`/revision` and the dashboard's student drill-down panel.

**File:** `app/api/student/[id]/route.ts`

**Response `200`:**
```json
{
  "student": { "id": "...", "name": "..." },
  "masteries": [
    { "topicId": "...", "topicName": "Fractions", "score": 0.63 },
    ...
  ],
  "weakTopics": [
    { "topicId": "...", "topicName": "Ratios", "score": 0.31, "attemptCount": 7 }
  ],
  "attempts": [
    {
      "id": "...",
      "questionText": "2/3 + 1/6 = ?",
      "topicName": "Fractions",
      "difficulty": 2,
      "correct": true,
      "createdAt": "2026-09-22T..."
    },
    ...
  ]
}
```
Attempts are ordered newest-first. `weakTopics` uses the same rule as the
adaptive engine (`mastery < 0.5` AND `attemptCount >= 3`), sorted weakest first.

**Response `404`:** `{ "error": "Student not found" }`

---

## `GET /api/quiz/next?studentId=<id>&topicId=<optional>`

Returns the next question to serve, using the diagnostic-then-adaptive
logic in `lib/quiz-service.ts`. Pass `topicId` (from the `/revision` page's
"Practice this" button, or `?topic=` on `/quiz`) to restrict to one topic
and skip the diagnostic phase entirely.

**File:** `app/api/quiz/next/route.ts`

**Response `200` (diagnostic phase):**
```json
{
  "question": {
    "id": "...", "text": "2/3 + 1/6 = ?",
    "options": ["5/6", "3/9", "1/2", "4/6"],
    "difficulty": 2, "topicId": "...", "topicName": "Fractions"
  },
  "reason": "Diagnostic question 1 of 8 for Fractions — establishing your baseline.",
  "phase": "diagnostic",
  "diagnosticProgress": { "current": 1, "total": 8 }
}
```

**Response `200` (adaptive phase):** same shape, `phase: "adaptive"`,
`diagnosticProgress` omitted, `reason` explains the topic choice (see
[ADAPTIVE-ENGINE.md](ADAPTIVE-ENGINE.md#3-adaptive-phase-after-the-diagnostic)).

Note: `options` never includes which index is correct — that's resolved
server-side in `/api/quiz/answer` so it can never leak to the client.

**Response `400`:** `{ "error": "studentId is required" }`
**Response `404`:** `{ "error": "No question available" }` (e.g. restricted
to a topic with no questions matching the target difficulty band, which
shouldn't happen with the seeded data but is handled defensively)

---

## `POST /api/quiz/answer`

Records an attempt, updates that topic's `Mastery` row, returns whether
the answer was correct.

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
  "topicId": "...",
  "mastery": 0.425
}
```
`mastery` is the topic's *new* score after this attempt's update.

**Response `400`:** missing/wrong-typed fields.
**Response `404`:** `{ "error": "Question not found" }`

---

## `GET /api/dashboard`

Everything the teacher dashboard needs in one call: per-student mastery by
topic, archetype badge, weak topics, and attempt counts.

**File:** `app/api/dashboard/route.ts`

**Response `200`:**
```json
{
  "topics": [{ "id": "...", "name": "Fractions" }, ...],
  "students": [
    {
      "id": "...", "name": "Aisha Khan",
      "masteryByTopic": { "<topicId>": 0.78, ... },
      "totalAttempts": 25, "correctAttempts": 23,
      "weakTopics": [],
      "archetype": "On Track"
    },
    ...
  ]
}
```
`archetype` comes from Model 2 ([ML-MODELS.md](ML-MODELS.md#model-2)) — the
mastery vector passed to it is built in a **fixed topic order**
(Fractions, Ratios, Linear Equations, Percentages) regardless of the order
`topics` is returned in, because that's the order the model was trained on.
