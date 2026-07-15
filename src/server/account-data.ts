import { createServerFn } from '@tanstack/react-start'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'

export const exportMyAccountData = createServerFn({ method: 'GET' }).handler(async () => {
  const sessionUser = await getSessionUser()
  if (!sessionUser) throw new Error('Sign in to export your data.')

  const prisma = await getDb()
  const [user, bankConnections, workspaces] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        name: true,
        email: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: { username: true, headline: true, bio: true, field: true, onboarded: true },
        },
        billingSubscription: {
          select: { status: true, currentPeriodEnd: true, cancelAtPeriodEnd: true, createdAt: true },
        },
      },
    }),
    prisma.bankConnection.findMany({
      where: { userId: sessionUser.id },
      select: { provider: true, status: true, lastSyncedAt: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.budgetWorkspace.findMany({
      where: { userId: sessionUser.id },
      select: {
        name: true,
        currency: true,
        demo: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            name: true,
            institution: true,
            type: true,
            currency: true,
            balanceMinor: true,
            lastSyncedAt: true,
            createdAt: true,
          },
        },
        transactions: {
          select: {
            postedAt: true,
            description: true,
            amountMinor: true,
            currency: true,
            status: true,
            recurring: true,
            notes: true,
            category: { select: { name: true } },
            merchant: { select: { name: true } },
          },
          orderBy: { postedAt: 'desc' },
        },
        budgetMonths: {
          select: {
            month: true,
            allocations: {
              select: { allocatedMinor: true, category: { select: { name: true } } },
            },
          },
          orderBy: { month: 'desc' },
        },
        recurringPayments: {
          select: {
            name: true,
            amountMinor: true,
            currency: true,
            cadence: true,
            nextDate: true,
            confirmed: true,
            category: { select: { name: true } },
          },
          orderBy: { nextDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  if (!user) throw new Error('Account not found.')

  return {
    format: 'wollie-account-export-v1',
    exportedAt: new Date().toISOString(),
    account: user,
    bankConnections,
    workspaces,
  }
})
