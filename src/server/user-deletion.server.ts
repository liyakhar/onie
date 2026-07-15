import { getDb } from '#/server/db-access.server'
import { revokeEnableBankingBeforeUserDeletion } from '#/server/enable-banking-sync'

const LIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due'])

export async function prepareUserDeletion(userId: string) {
  const prisma = await getDb()
  const billing = await prisma.billingSubscription.findUnique({
    where: { userId },
    select: { status: true, cancelAtPeriodEnd: true },
  })

  if (billing && LIVE_SUBSCRIPTION_STATUSES.has(billing.status) && !billing.cancelAtPeriodEnd) {
    throw new Error('Cancel subscription renewal in Billing before deleting your account.')
  }

  await revokeEnableBankingBeforeUserDeletion(userId)
  // Prisma cascade rules remove the remaining Wollie profile, bank credentials,
  // accounts, transactions, budgets, sessions, and related app data.
}
