import { getDb } from '#/server/db-access.server'
import { revokeEnableBankingBeforeUserDeletion } from '#/server/enable-banking-sync'
import { combineBasisPointShares } from '#/lib/household-finance'

const LIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

export async function prepareUserDeletion(userId: string) {
  const prisma = await getDb()
  const [billing, partnerCount] = await Promise.all([
    prisma.billingSubscription.findUnique({
      where: { userId },
      select: { status: true, cancelAtPeriodEnd: true },
    }),
    prisma.workspaceMember.count({
      where: { workspace: { userId }, userId: { not: userId } },
    }),
  ])

  assertHouseholdDeletionAllowed(partnerCount)

  if (billing && LIVE_SUBSCRIPTION_STATUSES.has(billing.status) && !billing.cancelAtPeriodEnd) {
    throw new Error('Cancel subscription renewal in Billing before deleting your account.')
  }

  await revokeEnableBankingBeforeUserDeletion(userId)
  await deleteUserOwnedBankData(userId)
  await leaveMemberHouseholdsBeforeUserDeletion(userId)
  // Prisma cascade rules remove the remaining Wollie profile, bank credentials,
  // accounts, transactions, budgets, sessions, and related app data.
}

export function assertHouseholdDeletionAllowed(partnerCount: number) {
  if (partnerCount > 0) {
    throw new Error('Remove your partner from the household before deleting the owner account.')
  }
}

async function deleteUserOwnedBankData(userId: string) {
  const prisma = await getDb()
  await prisma.$transaction(async (tx) => {
    const connections = await tx.bankConnection.findMany({
      where: { userId },
      select: { id: true, accounts: { select: { id: true } } },
    })
    const connectionIds = connections.map((connection) => connection.id)
    const accountIds = connections.flatMap((connection) => connection.accounts.map((account) => account.id))
    if (accountIds.length) {
      await tx.financeTransaction.deleteMany({ where: { accountId: { in: accountIds } } })
      await tx.financialAccount.deleteMany({ where: { id: { in: accountIds } } })
    }
    if (connectionIds.length) {
      await tx.syncRun.deleteMany({ where: { bankConnectionId: { in: connectionIds } } })
      await tx.bankConnection.deleteMany({ where: { id: { in: connectionIds } } })
    }
  })
}

async function leaveMemberHouseholdsBeforeUserDeletion(userId: string) {
  const prisma = await getDb()
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId, role: 'MEMBER' },
    select: { id: true, workspaceId: true },
  })
  for (const membership of memberships) {
    await prisma.$transaction(async (tx) => {
      const owner = await tx.workspaceMember.findFirst({
        where: { workspaceId: membership.workspaceId, role: 'OWNER' },
        select: { id: true },
      })
      if (!owner) throw new Error('Household owner could not be found.')

      const departingShares = await tx.accountOwnership.findMany({
        where: { memberId: membership.id },
        select: { accountId: true, shareBasisPoints: true },
      })
      for (const share of departingShares) {
        const ownerShare = await tx.accountOwnership.findUnique({
          where: { accountId_memberId: { accountId: share.accountId, memberId: owner.id } },
          select: { shareBasisPoints: true },
        })
        await tx.accountOwnership.upsert({
          where: { accountId_memberId: { accountId: share.accountId, memberId: owner.id } },
          create: {
            accountId: share.accountId,
            memberId: owner.id,
            shareBasisPoints: share.shareBasisPoints,
          },
          update: {
            shareBasisPoints: combineBasisPointShares(ownerShare?.shareBasisPoints, share.shareBasisPoints),
          },
        })
      }

      await tx.workspaceMember.delete({ where: { id: membership.id } })
      await tx.workspaceMember.update({
        where: { id: owner.id },
        data: { householdShareBasisPoints: 10_000 },
      })
    })
  }
}
