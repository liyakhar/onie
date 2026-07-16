-- CreateEnum
CREATE TYPE "HouseholdRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateEnum
CREATE TYPE "HouseholdInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "householdShareBasisPoints" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WorkspaceMember_householdShareBasisPoints_check"
      CHECK ("householdShareBasisPoints" BETWEEN 0 AND 10000)
);

-- CreateTable
CREATE TABLE "HouseholdInvitation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "role" "HouseholdRole" NOT NULL DEFAULT 'MEMBER',
    "status" "HouseholdInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseholdInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountOwnership" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "shareBasisPoints" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountOwnership_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AccountOwnership_shareBasisPoints_check"
      CHECK ("shareBasisPoints" BETWEEN 0 AND 10000)
);

-- Existing workspaces retain their current owner and cost allocation.
INSERT INTO "WorkspaceMember" (
  "id", "workspaceId", "userId", "role", "householdShareBasisPoints", "createdAt", "updatedAt"
)
SELECT
  CONCAT('hwm_', MD5(workspace."id" || ':' || workspace."userId")),
  workspace."id",
  workspace."userId",
  'OWNER'::"HouseholdRole",
  10000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "BudgetWorkspace" workspace
ON CONFLICT DO NOTHING;

-- Existing accounts remain entirely owned by the existing workspace owner.
INSERT INTO "AccountOwnership" (
  "id", "accountId", "memberId", "shareBasisPoints", "createdAt", "updatedAt"
)
SELECT
  CONCAT('hao_', MD5(account."id" || ':' || member."id")),
  account."id",
  member."id",
  10000,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "FinancialAccount" account
JOIN "WorkspaceMember" member
  ON member."workspaceId" = account."workspaceId"
 AND member."role" = 'OWNER'::"HouseholdRole"
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
CREATE UNIQUE INDEX "HouseholdInvitation_tokenHash_key" ON "HouseholdInvitation"("tokenHash");
CREATE INDEX "HouseholdInvitation_workspaceId_status_idx" ON "HouseholdInvitation"("workspaceId", "status");
CREATE INDEX "HouseholdInvitation_email_status_idx" ON "HouseholdInvitation"("email", "status");
CREATE UNIQUE INDEX "AccountOwnership_accountId_memberId_key" ON "AccountOwnership"("accountId", "memberId");
CREATE INDEX "AccountOwnership_memberId_idx" ON "AccountOwnership"("memberId");

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BudgetWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BudgetWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvitation" ADD CONSTRAINT "HouseholdInvitation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "BudgetWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HouseholdInvitation" ADD CONSTRAINT "HouseholdInvitation_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountOwnership" ADD CONSTRAINT "AccountOwnership_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinancialAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountOwnership" ADD CONSTRAINT "AccountOwnership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
