# Database

PostgreSQL via Prisma 6. (The build started on SQLite for a zero-setup
first pass, then was migrated to Postgres so the data could be browsed in
DBeaver like a normal relational database — see "Migration history" below.)

## Schema

**File:** `prisma/schema.prisma`

```prisma
model Student {
  id       String    @id @default(cuid())
  name     String
  attempts Attempt[]
  mastery  Mastery[]
}

model Topic {
  id        String     @id @default(cuid())
  name      String
  questions Question[]
  mastery   Mastery[]
}

model Question {
  id         String    @id @default(cuid())
  topicId    String
  topic      Topic     @relation(fields: [topicId], references: [id])
  text       String
  options    String[]  // 4 option strings, native Postgres array
  answerIdx  Int       // index into `options` of the correct answer
  difficulty Int       // 1, 2, or 3
  attempts   Attempt[]
}

model Attempt {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id])
  questionId String
  question   Question @relation(fields: [questionId], references: [id])
  correct    Boolean
  createdAt  DateTime @default(now())
}

model Mastery {
  id        String  @id @default(cuid())
  studentId String
  student   Student @relation(fields: [studentId], references: [id])
  topicId   String
  topic     Topic   @relation(fields: [topicId], references: [id])
  score     Float   @default(0.5)  // 0-1, Elo-style running estimate

  @@unique([studentId, topicId])  // one Mastery row per (student, topic) pair
}
```

`options` was originally a JSON-stringified string, a leftover from when
SQLite had no array column type. Once the app was fully on Postgres it was
migrated to a native `text[]` column (see "Migrations" below) — the
application code no longer does any `JSON.parse()`/`JSON.stringify()` at
the `lib/quiz-service.ts` / `prisma/seed.ts` boundary; Prisma returns and
accepts `options` as a plain `string[]`.

`Mastery` has exactly one row per `(studentId, topicId)` pair, enforced by
the `@@unique` constraint — `lib/adaptive-engine.ts`'s `updateMastery()`
result is written via `prisma.mastery.upsert()` against that same key.

## Local setup options

### Option A: Docker Compose (Recommended — Zero Configuration)
If you have Docker installed, this starts PostgreSQL with the credentials configured out-of-the-box:
```bash
docker compose up -d
```
Then copy the example env:
```bash
cp .env.example .env
# DATABASE_URL is already preset to: postgresql://postgres:postgres@localhost:5432/erodehack
npx prisma db push
npm run seed
```

### Option B: Local Postgres (Homebrew on macOS)
```bash
brew install postgresql@16   # or postgresql@18
brew services start postgresql@16
createdb erodehack
```

In `.env`:
```
DATABASE_URL="postgresql://<your-macos-username>@localhost:5432/erodehack"
```
*Note: Find your macOS username by running `whoami` in terminal. Homebrew Postgres uses trust auth for the local Unix user by default (no password).*

```bash
npx prisma db push
npm run seed
```

---

## Troubleshooting: "Please make sure to provide valid database credentials"

If Prisma outputs:
> `Authentication failed against database server at 'localhost', the provided database credentials for '...' are not valid. Please make sure to provide valid database credentials for the database server at the configured address.` (Prisma error `P1000`)

Here is how to fix it on your machine:

1. **Check if PostgreSQL is running:**
   ```bash
   pg_isready
   # Or on macOS Homebrew:
   brew services list
   ```
   If it is stopped, start it: `brew services start postgresql@16` or `docker compose up -d`.

2. **Verify your username & password:**
   - On macOS Homebrew: Run `whoami`. If your username is `johndoe`, your connection string must be:
     `DATABASE_URL="postgresql://johndoe@localhost:5432/erodehack"` (no password).
   - If using standard PostgreSQL with a `postgres` superuser password (e.g. `mypassword`):
     `DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/erodehack"`
   - If using Docker Compose:
     `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erodehack"`

3. **Verify the database exists:**
   ```bash
   # Create database if it does not exist:
   createdb erodehack
   # Or via psql:
   psql -U postgres -c "CREATE DATABASE erodehack;"
   ```

4. **Test connecting with psql directly:**
   ```bash
   psql "postgresql://<USER>:<PASS>@localhost:5432/erodehack"
   ```
   Once `psql` connects successfully, run `npx prisma db push && npm run seed`.

## Connecting with DBeaver

**Database -> New Database Connection -> PostgreSQL**, then:

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `erodehack` |
| Username | your macOS username |
| Password | *(leave blank)* |

Test Connection -> Finish. You'll see `Student`, `Topic`, `Question`,
`Attempt`, `Mastery` under the `public` schema.

## Migrations

**Directory:** `prisma/migrations/` — two migrations so far:

1. `..._init` — generated by `npx prisma migrate dev --name init` against
   the Postgres datasource.
2. `..._question_options_native_array` — converts `Question.options` from
   the JSON-stringified `TEXT` column to a native `TEXT[]`. Postgres
   doesn't allow a subquery directly in an `ALTER COLUMN ... USING`
   expression, so the migration adds a new `options_new TEXT[]` column,
   backfills it with `ARRAY(SELECT json_array_elements_text("options"::json))`
   per row (which preserves option order), then drops the old column and
   renames the new one into place — all inside the migration's transaction,
   so existing seeded questions keep their data.

Check current status any time with:

```bash
npx prisma migrate status
```

## Migration history: SQLite -> Postgres

The project was originally scaffolded with `datasource { provider = "sqlite" }`
and a `prisma/dev.db` file — genuinely zero-setup, useful for the first
build pass. When Postgres/DBeaver access was needed:

1. Changed `provider = "sqlite"` -> `provider = "postgresql"` in `schema.prisma`
2. Updated `DATABASE_URL` in `.env` to a Postgres connection string
3. Deleted the old SQLite-flavored `prisma/migrations/` (its SQL dialect
   doesn't carry over) and regenerated with `prisma migrate dev --name init`
   against the new datasource
4. Re-ran `npm run seed` and the demo-data simulation script

No application code changed — `lib/prisma.ts`'s `PrismaClient` and every
query in `app/api/**` are database-engine-agnostic through Prisma.

## Seeding

`prisma/seed.ts` creates the 4 fixed topics (Fractions, Ratios, Linear
Equations, Percentages) and 10 questions each (3-4 per difficulty level,
1-3), with plausible (not obviously wrong) distractor options. The seed is
idempotent per topic — it looks up each topic by name first and skips it
(logging `Skipping <name> — already seeded`) if it already exists, so
re-running `npm run seed` is safe and won't duplicate questions. To force a
clean reseed anyway (e.g. after editing the question bank), wipe the
tables first:

```bash
psql erodehack -c 'TRUNCATE "Attempt", "Mastery", "Question", "Topic", "Student" CASCADE;'
npm run seed
```
