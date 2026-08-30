-- CreateEnum
CREATE TYPE "BudgetBucketGroup" AS ENUM ('FIXED', 'FLEXIBLE', 'FUTURE');

-- CreateEnum
CREATE TYPE "BudgetAllocationRuleType" AS ENUM ('FIXED', 'PERCENT_OF_INCOME', 'REMAINDER');

-- CreateTable
CREATE TABLE "BudgetBucket" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "BudgetBucketGroup" NOT NULL DEFAULT 'FLEXIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetBucketCategory" (
    "id" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetBucketCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocationRule" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "type" "BudgetAllocationRuleType" NOT NULL,
    "fixedMinor" INTEGER,
    "percentageBasisPoints" INTEGER,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BudgetAllocationRule_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BudgetAllocationRule_priority_check" CHECK ("priority" >= 0),
    CONSTRAINT "BudgetAllocationRule_value_check" CHECK (
      ("type" = 'FIXED'::"BudgetAllocationRuleType" AND "fixedMinor" IS NOT NULL AND "fixedMinor" >= 0 AND "percentageBasisPoints" IS NULL)
      OR ("type" = 'PERCENT_OF_INCOME'::"BudgetAllocationRuleType" AND "fixedMinor" IS NULL AND "percentageBasisPoints" BETWEEN 1 AND 10000)
      OR ("type" = 'REMAINDER'::"BudgetAllocationRuleType" AND "fixedMinor" IS NULL AND "percentageBasisPoints" IS NULL)
    )
);

-- Create indexes before the backfill so its conflict handling is deterministic.
CREATE UNIQUE INDEX "BudgetBucket_workspaceId_name_key" ON "BudgetBucket"("workspaceId", "name");
CREATE INDEX "BudgetBucket_workspaceId_idx" ON "BudgetBucket"("workspaceId");
CREATE UNIQUE INDEX "BudgetBucketCategory_categoryId_key" ON "BudgetBucketCategory"("categoryId");
CREATE UNIQUE INDEX "BudgetBucketCategory_bucketId_categoryId_key" ON "BudgetBucketCategory"("bucketId", "categoryId");
CREATE INDEX "BudgetBucketCategory_bucketId_idx" ON "BudgetBucketCategory"("bucketId");
CREATE UNIQUE INDEX "BudgetAllocationRule_bucketId_key" ON "BudgetAllocationRule"("bucketId");
CREATE INDEX "BudgetAllocationRule_workspaceId_priority_idx" ON "BudgetAllocationRule"("workspaceId", "priority");
CREATE UNIQUE INDEX "BudgetAllocationRule_one_remainder_per_workspace" ON "BudgetAllocationRule"("workspaceId") WHERE "type" = 'REMAINDER'::"BudgetAllocationRuleType";

-- Existing manual category limits become fixed envelopes. The newest calendar month
-- is authoritative for each workspace/category; original allocations remain intact.
WITH latest_allocations AS (
  SELECT DISTINCT ON (month."workspaceId", allocation."categoryId")
    month."workspaceId",
    allocation."categoryId",
    category."name" AS "categoryName",
    allocation."allocatedMinor"
  FROM "BudgetAllocation" allocation
  JOIN "BudgetMonth" month ON month."id" = allocation."budgetMonthId"
  JOIN "TransactionCategory" category ON category."id" = allocation."categoryId"
  ORDER BY month."workspaceId", allocation."categoryId", month."month" DESC, allocation."updatedAt" DESC
)
INSERT INTO "BudgetBucket" (
  "id", "workspaceId", "name", "group", "createdAt", "updatedAt"
)
SELECT
  CONCAT('bbk_', MD5(latest."workspaceId" || ':' || latest."categoryId")),
  latest."workspaceId",
  latest."categoryName",
  CASE
    WHEN latest."categoryName" IN ('Housing', 'Subscriptions') THEN 'FIXED'::"BudgetBucketGroup"
    WHEN latest."categoryName" = 'Savings' THEN 'FUTURE'::"BudgetBucketGroup"
    ELSE 'FLEXIBLE'::"BudgetBucketGroup"
  END,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM latest_allocations latest
ON CONFLICT ("workspaceId", "name") DO NOTHING;

WITH latest_allocations AS (
  SELECT DISTINCT ON (month."workspaceId", allocation."categoryId")
    month."workspaceId",
    allocation."categoryId",
    category."name" AS "categoryName",
    allocation."allocatedMinor"
  FROM "BudgetAllocation" allocation
  JOIN "BudgetMonth" month ON month."id" = allocation."budgetMonthId"
  JOIN "TransactionCategory" category ON category."id" = allocation."categoryId"
  ORDER BY month."workspaceId", allocation."categoryId", month."month" DESC, allocation."updatedAt" DESC
)
INSERT INTO "BudgetBucketCategory" (
  "id", "bucketId", "categoryId", "createdAt", "updatedAt"
)
SELECT
  CONCAT('bbm_', MD5(latest."workspaceId" || ':' || latest."categoryId")),
  bucket."id",
  latest."categoryId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM latest_allocations latest
JOIN "BudgetBucket" bucket
  ON bucket."workspaceId" = latest."workspaceId"
 AND bucket."name" = latest."categoryName"
ON CONFLICT ("categoryId") DO NOTHING;

WITH latest_allocations AS (
  SELECT DISTINCT ON (month."workspaceId", allocation."categoryId")
    month."workspaceId",
    allocation."categoryId",
    category."name" AS "categoryName",
    allocation."allocatedMinor"
  FROM "BudgetAllocation" allocation
  JOIN "BudgetMonth" month ON month."id" = allocation."budgetMonthId"
  JOIN "TransactionCategory" category ON category."id" = allocation."categoryId"
  ORDER BY month."workspaceId", allocation."categoryId", month."month" DESC, allocation."updatedAt" DESC
), ranked_allocations AS (
  SELECT
    latest.*,
    ROW_NUMBER() OVER (
      PARTITION BY latest."workspaceId"
      ORDER BY latest."categoryName" ASC
    ) - 1 AS "priority"
  FROM latest_allocations latest
)
INSERT INTO "BudgetAllocationRule" (
  "id", "workspaceId", "bucketId", "type", "fixedMinor", "priority", "createdAt", "updatedAt"
)
SELECT
  CONCAT('bar_', MD5(latest."workspaceId" || ':' || latest."categoryId")),
  latest."workspaceId",
  bucket."id",
  'FIXED'::"BudgetAllocationRuleType",
  latest."allocatedMinor",
  latest."priority",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ranked_allocations latest
JOIN "BudgetBucket" bucket
  ON bucket."workspaceId" = latest."workspaceId"
 AND bucket."name" = latest."categoryName"
ON CONFLICT ("bucketId") DO NOTHING;

-- AddForeignKey
ALTER TABLE "BudgetBucket" ADD CONSTRAINT "BudgetBucket_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BudgetWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetBucketCategory" ADD CONSTRAINT "BudgetBucketCategory_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "BudgetBucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetBucketCategory" ADD CONSTRAINT "BudgetBucketCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TransactionCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetAllocationRule" ADD CONSTRAINT "BudgetAllocationRule_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BudgetWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetAllocationRule" ADD CONSTRAINT "BudgetAllocationRule_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "BudgetBucket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
