# The Adaptive Engine

Source: [`lib/adaptive-engine.ts`](../lib/adaptive-engine.ts) (pure functions,
no database access — fully unit-testable) and
[`lib/quiz-service.ts`](../lib/quiz-service.ts) (the DB-aware layer that
calls it).

## 1. Mastery tracking (Elo-inspired)

Every student has a `Mastery` row per topic: a float in `[0.05, 0.95]`
starting at `0.5` (assumed 50/50 before any evidence). After every answered
question, `updateMastery()` nudges it toward the observed outcome:

```ts
// lib/adaptive-engine.ts
const LEARNING_RATE = 0.15; // "K" — how fast mastery reacts to new evidence

function updateMastery(currentMastery: number, correct: boolean): number {
  const expected = currentMastery;      // treat current score as P(correct)
  const actual = correct ? 1 : 0;
  const next = currentMastery + LEARNING_RATE * (actual - expected);
  return clamp(next, 0.05, 0.95);        // never fully certain either way
}
```

This is the same shape as an Elo rating update: the score moves toward
whatever just happened, by an amount proportional to how surprising the
outcome was (a correct answer from someone with `mastery=0.9` barely moves
the needle; a correct answer from someone at `mastery=0.1` moves it a lot).

The clamp to `[0.05, 0.95]` matters for two reasons: it keeps the score
usable as a probability-like input to the ML difficulty model (which can't
handle exactly 0 or 1), and it means no single answer can ever fully
"prove" mastery or its absence — consistent with treating this as a noisy
signal, not ground truth.

## 2. Diagnostic phase (first 8 questions)

Before there's any evidence, the app can't yet tell which topic is weak. So
the first `topics.length x 2 = 8` questions cycle through each of the 4
topics twice, always at difficulty 2 (the "medium" band), to seed a rough
mastery baseline for every topic before switching to adaptive mode. This
logic lives in `getNextQuestion()` in `lib/quiz-service.ts`:

```ts
const topicOrder = [Fractions, Ratios, LinearEq, Percentages,   // round 1
                     Fractions, Ratios, LinearEq, Percentages]; // round 2
const targetTopicId = topicOrder[totalAttemptsSoFar];
```

It picks a difficulty-2 question in that topic the student hasn't already
been asked, falling back to "any difficulty-2 question in that topic" if
they've somehow exhausted the unseen ones.

## 3. Adaptive phase (after the diagnostic)

Once 8+ attempts exist, every subsequent question goes through
`selectTargetTopic()` then `selectQuestion()`.

### Picking the topic: weakest-first

```ts
function selectTargetTopic(masteries, restrictToTopicId?) {
  const candidates = restrictToTopicId
    ? masteries.filter(m => m.topicId === restrictToTopicId)   // "Practice this" mode
    : masteries.filter(m => m.score < MASTERY_THRESHOLD);       // 0.8 — not yet mastered
  const pool = candidates.length > 0 ? candidates : masteries;   // fallback: everything mastered
  const weakest = [...pool].sort((a, b) => a.score - b.score)[0];
  ...
}
```

Among topics not yet "mastered" (`score < 0.8`), it picks the single
weakest one and serves a question there. This is a greedy strategy — it
will keep hammering the same weak topic across many consecutive questions
until that topic's mastery rises above whatever the next-weakest topic is.
That's intentional: the goal is remediation, not balanced topic rotation.

If `restrictToTopicId` is set (the `/revision` page's "Practice this"
button, via `?topic=<id>` on the quiz URL), the topic choice is skipped
entirely and every question comes from that one topic.

### Picking the difficulty: the ML model, not a hand-coded ladder

```ts
const targetDifficulty = selectDifficulty(weakest.score); // lib/ml/difficulty-model.ts
```

This calls **Model 1** (logistic regression — see
[ML-MODELS.md](ML-MODELS.md#model-1)), which was trained to predict
`P(correct | mastery, difficulty)` and picks whichever of difficulty 1/2/3
puts the student closest to a 75% success rate — the "desirable
difficulty" zone from learning science. This replaced an earlier hand-coded
`if (score < 0.4) return 1; ...` ladder.

### The explainability string

Every returned question comes with a plain-English `reason`:

```
"Recommended because your Ratios mastery is 22% — lower than your other topics (avg 61%)."
```

or, in "Practice this" mode:

```
"Practicing Ratios — your mastery here is 22%."
```

This is a template string (not an LLM call — an earlier plan considered
calling Claude per-question for this, but that was never wired in; see the
"What's genuinely ML" note in the root README). It's shown on the student
quiz UI as a named feature so the reasoning behind each question is never
opaque.

### Picking the specific question: no-repeat rule

```ts
function selectQuestion(questions, targetTopicId, targetDifficulty, recentAttempts) {
  const recentOnTopic = recentAttempts.filter(a => a.topicId === targetTopicId).slice(-5);
  const recentlyCorrectIds = new Set(recentOnTopic.filter(a => a.correct).map(a => a.questionId));
  const eligible = topicQuestions.filter(q =>
    q.difficulty === targetDifficulty && !recentlyCorrectIds.has(q.id)
  );
  ...
}
```

Within the target topic and difficulty, a question already answered
*correctly* in the last 5 attempts on that topic is excluded (so a student
doesn't just see the same easy win repeatedly). If that leaves nothing,
it progressively relaxes: same difficulty regardless of recency, then any
difficulty not recently seen, then anything at all — the app should never
hard-stop just because the no-repeat rule ran out of room in a 10-question
topic pool.

## 4. Weak-topic / revision plan

```ts
const WEAK_THRESHOLD = 0.5;
const WEAK_MIN_ATTEMPTS = 3;

function getWeakTopics(masteries, attemptCounts) {
  return masteries
    .filter(m => m.score < WEAK_THRESHOLD && attemptCounts[m.topicId] >= WEAK_MIN_ATTEMPTS)
    .sort((a, b) => a.score - b.score);
}
```

A topic only counts as "weak" (and shows up on `/revision`) once there's
been at least 3 attempts on it — otherwise a single unlucky first answer
would immediately flag a topic the student hasn't really been tested on
yet. Sorted weakest-first so the most urgent topic is at the top.

## Testing this in isolation

`scripts/test-engine.ts` simulates 30 attempts for a fake student with a
known skill profile per topic (e.g. 80% success on Fractions, 20% on
Ratios) and prints the mastery trajectory round by round — useful for
eyeballing that the engine converges sensibly without needing the database
or the UI at all:

```bash
npx tsx scripts/test-engine.ts
```
