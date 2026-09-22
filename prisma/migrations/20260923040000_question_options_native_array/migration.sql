-- Convert Question.options from a JSON-stringified array (a SQLite-era leftover) to a native Postgres text[].
ALTER TABLE "Question" ADD COLUMN "options_new" TEXT[];

UPDATE "Question"
SET "options_new" = ARRAY(SELECT json_array_elements_text("options"::json));

ALTER TABLE "Question" ALTER COLUMN "options_new" SET NOT NULL;
ALTER TABLE "Question" DROP COLUMN "options";
ALTER TABLE "Question" RENAME COLUMN "options_new" TO "options";
