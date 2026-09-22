-- Add Tamil translation columns. Defaulted to "" / {} so existing rows are
-- valid immediately; a backfill script fills in the real translations for
-- the seeded question bank.
ALTER TABLE "Question" ADD COLUMN "textTa" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Question" ADD COLUMN "optionsTa" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Topic" ADD COLUMN "nameTa" TEXT NOT NULL DEFAULT '';
