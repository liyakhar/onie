-- Each Money plan envelope has one clear job. The default preserves existing rows
-- until the backfill below classifies current future envelopes without removing data.
CREATE TYPE "BudgetBucketPurpose" AS ENUM ('SPENDING', 'RESERVE', 'GOAL');

ALTER TABLE "BudgetBucket"
ADD COLUMN "purpose" "BudgetBucketPurpose" NOT NULL DEFAULT 'SPENDING';

-- Existing Future envelopes represented saving/future money. Preserve that behavior
-- as goals, with the common Tax envelope promoted to a reserve. Any household can
-- change this in the Money plan editor after migration.
UPDATE "BudgetBucket"
SET "purpose" = CASE
  WHEN "group" = 'FUTURE' AND lower(trim("name")) IN ('tax', 'taxes', 'vat', 'income tax') THEN 'RESERVE'::"BudgetBucketPurpose"
  WHEN "group" = 'FUTURE' THEN 'GOAL'::"BudgetBucketPurpose"
  ELSE 'SPENDING'::"BudgetBucketPurpose"
END;
