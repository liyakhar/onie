import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import { FINANCE_CATEGORIES, type FinanceCategory } from '#/lib/finance-demo'
import { getDb } from '#/server/db-access.server'
import { requireFinanceHousehold } from '#/server/household-access.server'
import { getSessionUser } from '#/server/session.server'

const EXPORT_FORMAT = 'wollie-finance-backup-v2'

type ExportScope = 'household' | 'personal' | 'account'

type FinanceBackup = Awaited<ReturnType<typeof buildFinanceBackup>>

export const exportMyAccountData = createServerFn({ method: 'GET' }).handler(async () => {
  return buildFinanceBackup()
})

export const exportFinanceBackup = createServerFn({ method: 'GET' }).handler(async () => {
  return buildFinanceBackup()
})

export const exportFinanceCsv = createServerFn({ method: 'GET' })
  .validator((data: { scope?: ExportScope; accountId?: string } | undefined) => ({
    scope: data?.scope === 'personal' || data?.scope === 'account' ? data.scope : 'household' as ExportScope,
    accountId: typeof data?.accountId === 'string' ? data.accountId : undefined,
  }))
  .handler(async ({ data }) => {
    const backup = await buildFinanceBackup()
    return {
      filename: csvFilename(data.scope, data.accountId),
      mimeType: 'text/csv;charset=utf-8',
      content: buildTransactionsCsv(backup, data.scope, data.accountId),
    }
  })

export const exportAccountOwnershipCsv = createServerFn({ method: 'GET' }).handler(async () => {
  const backup = await buildFinanceBackup()
  return {
    filename: `wollie-account-ownership-${todayStamp()}.csv`,
    mimeType: 'text/csv;charset=utf-8',
    content: buildAccountOwnershipCsv(backup),
  }
})

export const previewFinanceBackupRestore = createServerFn({ method: 'POST' })
  .validator((data: { backupText: string }) => ({ backupText: String(data?.backupText ?? '') }))
  .handler(async ({ data }) => {
    const backup = parseBackup(data.backupText)
    return summarizeBackup(backup)
  })

export const restoreFinancePlanningFromBackup = createServerFn({ method: 'POST' })
  .validator((data: { backupText: string }) => ({ backupText: String(data?.backupText ?? '') }))
  .handler(async ({ data }) => {
    const backup = parseBackup(data.backupText)
    const context = await requireFinanceHousehold()
    const prisma = await getDb()
    const sourceWorkspace = backup.finance.workspace

    let restoredBudgetAllocations = 0
    let restoredRecurringPayments = 0
    let restoredOwnershipShares = 0

    await prisma.$transaction(async (tx) => {
      for (const budgetMonth of sourceWorkspace.budgetMonths) {
        const month = await tx.budgetMonth.upsert({
          where: { workspaceId_month: { workspaceId: context.workspaceId, month: budgetMonth.month } },
          create: { workspaceId: context.workspaceId, month: budgetMonth.month },
          update: {},
        })
        await tx.budgetAllocation.deleteMany({ where: { budgetMonthId: month.id } })
        for (const allocation of budgetMonth.allocations) {
          if (!FINANCE_CATEGORIES.includes(allocation.category.name as FinanceCategory)) continue
          const category = await tx.transactionCategory.upsert({
            where: { workspaceId_name: { workspaceId: context.workspaceId, name: allocation.category.name } },
            create: {
              workspaceId: context.workspaceId,
              name: allocation.category.name,
              system: allocation.category.system,
              color: allocation.category.color,
            },
            update: {
              system: allocation.category.system,
              color: allocation.category.color,
            },
          })
          await tx.budgetAllocation.create({
            data: {
              budgetMonthId: month.id,
              categoryId: category.id,
              allocatedMinor: allocation.allocatedMinor,
            },
          })
          restoredBudgetAllocations += 1
        }
      }

      await tx.recurringPayment.deleteMany({ where: { workspaceId: context.workspaceId } })
      for (const payment of sourceWorkspace.recurringPayments) {
        const category = payment.category
          ? await tx.transactionCategory.upsert({
              where: { workspaceId_name: { workspaceId: context.workspaceId, name: payment.category.name } },
              create: { workspaceId: context.workspaceId, name: payment.category.name, system: true },
              update: {},
            })
          : null
        const merchant = payment.merchant
          ? await tx.merchant.upsert({
              where: {
                workspaceId_normalizedName: {
                  workspaceId: context.workspaceId,
                  normalizedName: normalizeName(payment.merchant.name),
                },
              },
              create: {
                workspaceId: context.workspaceId,
                name: payment.merchant.name,
                normalizedName: normalizeName(payment.merchant.name),
              },
              update: { name: payment.merchant.name },
            })
          : null
        await tx.recurringPayment.create({
          data: {
            workspaceId: context.workspaceId,
            name: payment.name,
            amountMinor: payment.amountMinor,
            currency: payment.currency,
            cadence: payment.cadence,
            nextDate: new Date(payment.nextDate),
            confirmed: payment.confirmed,
            categoryId: category?.id,
            merchantId: merchant?.id,
          },
        })
        restoredRecurringPayments += 1
      }

      const currentAccounts = await tx.financialAccount.findMany({
        where: { workspaceId: context.workspaceId },
        include: { ownershipShares: true },
      })
      const currentMembers = await tx.workspaceMember.findMany({ where: { workspaceId: context.workspaceId } })
      for (const exportedAccount of sourceWorkspace.accounts) {
        const account = currentAccounts.find((item) =>
          item.id === exportedAccount.id ||
          (
            normalizeName(item.name) === normalizeName(exportedAccount.name) &&
            normalizeName(item.institution || '') === normalizeName(exportedAccount.institution || '') &&
            item.type === exportedAccount.type
          ),
        )
        if (!account) continue
        const usableShares = exportedAccount.ownershipShares.flatMap((share) => {
          const member = currentMembers.find((item) => item.id === share.memberId || item.userId === share.member.userId)
          return member ? [{ memberId: member.id, shareBasisPoints: share.shareBasisPoints }] : []
        })
        const total = usableShares.reduce((sum, share) => sum + share.shareBasisPoints, 0)
        if (usableShares.length === 0 || total !== 10_000) continue
        await tx.accountOwnership.deleteMany({ where: { accountId: account.id } })
        for (const share of usableShares) {
          await tx.accountOwnership.create({
            data: {
              accountId: account.id,
              memberId: share.memberId,
              shareBasisPoints: share.shareBasisPoints,
            },
          })
          restoredOwnershipShares += 1
        }
      }
    })

    return {
      restored: true,
      budgetAllocations: restoredBudgetAllocations,
      recurringPayments: restoredRecurringPayments,
      ownershipShares: restoredOwnershipShares,
      note: 'Bank connections, balances, and transactions were not overwritten. Reconnect or sync banks to recover live bank data.',
    }
  })

export const buildFinanceBackup = createServerOnlyFn(async () => {
  const sessionUser = await getSessionUser()
  if (!sessionUser) throw new Error('Sign in to export your data.')
  const context = await requireFinanceHousehold()
  const prisma = await getDb()

  const [user, workspace] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
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
    prisma.budgetWorkspace.findUnique({
      where: { id: context.workspaceId },
      select: {
        id: true,
        name: true,
        currency: true,
        demo: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            householdShareBasisPoints: true,
            createdAt: true,
            updatedAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        bankConnections: {
          select: {
            id: true,
            userId: true,
            provider: true,
            status: true,
            lastSyncedAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        accounts: {
          select: {
            id: true,
            bankConnectionId: true,
            providerAccountId: true,
            name: true,
            institution: true,
            type: true,
            currency: true,
            balanceMinor: true,
            lastSyncedAt: true,
            createdAt: true,
            updatedAt: true,
            ownershipShares: {
              select: {
                memberId: true,
                shareBasisPoints: true,
                member: { select: { userId: true, role: true, user: { select: { name: true, email: true } } } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        categories: {
          select: { id: true, name: true, system: true, color: true, createdAt: true, updatedAt: true },
          orderBy: { name: 'asc' },
        },
        merchants: {
          select: { id: true, name: true, normalizedName: true, createdAt: true, updatedAt: true },
          orderBy: { name: 'asc' },
        },
        transactions: {
          select: {
            id: true,
            accountId: true,
            providerTransactionId: true,
            postedAt: true,
            description: true,
            amountMinor: true,
            currency: true,
            status: true,
            recurring: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            category: { select: { name: true } },
            merchant: { select: { name: true } },
            account: { select: { name: true, institution: true } },
          },
          orderBy: [{ postedAt: 'desc' }, { createdAt: 'desc' }],
        },
        budgetMonths: {
          select: {
            id: true,
            month: true,
            createdAt: true,
            updatedAt: true,
            allocations: {
              select: {
                allocatedMinor: true,
                createdAt: true,
                updatedAt: true,
                category: { select: { name: true, system: true, color: true } },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { month: 'desc' },
        },
        recurringPayments: {
          select: {
            id: true,
            name: true,
            amountMinor: true,
            currency: true,
            cadence: true,
            nextDate: true,
            confirmed: true,
            createdAt: true,
            updatedAt: true,
            category: { select: { name: true } },
            merchant: { select: { name: true } },
          },
          orderBy: { nextDate: 'asc' },
        },
        rules: {
          select: {
            id: true,
            matchText: true,
            createdAt: true,
            updatedAt: true,
            merchant: { select: { name: true } },
            category: { select: { name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
        syncRuns: {
          select: {
            provider: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            transactionsSeen: true,
            transactionsAdded: true,
            errorCode: true,
            errorMessage: true,
          },
          orderBy: { startedAt: 'desc' },
          take: 25,
        },
      },
    }),
  ])

  if (!user) throw new Error('Account not found.')
  if (!workspace) throw new Error('Finance workspace not found.')

  return {
    format: EXPORT_FORMAT,
    exportedAt: new Date().toISOString(),
    account: user,
    finance: {
      currentUserId: sessionUser.id,
      currentMemberId: context.memberId,
      workspace,
    },
    recovery: {
      restorableNow: [
        'Budget months and allocations',
        'Recurring payments and sinking-fund style planned expenses',
        'Account ownership percentages when matching accounts still exist',
      ],
      notRestoredAutomatically: [
        'Bank login credentials or provider tokens',
        'Live balances and bank transactions, which should be re-synced from the bank',
        'Billing subscription state, which stays with Stripe',
      ],
    },
  }
})

export function buildTransactionsCsv(backup: FinanceBackup, scope: ExportScope, accountId?: string) {
  const workspace = backup.finance.workspace
  const currentMemberId = backup.finance.currentMemberId
  const memberName = workspace.members.find((member) => member.id === currentMemberId)?.user.name || 'You'
  const accountOwnership = new Map(workspace.accounts.map((account) => [account.id, account.ownershipShares]))
  const rows = workspace.transactions.flatMap((transaction) => {
    if (scope === 'account' && transaction.accountId !== accountId) return []
    const shares = accountOwnership.get(transaction.accountId) ?? []
    const currentShare = shares.find((share) => share.memberId === currentMemberId)?.shareBasisPoints ?? 0
    if (scope === 'personal' && currentShare === 0) return []
    const amountMinor = scope === 'personal'
      ? Math.round(transaction.amountMinor * currentShare / 10_000)
      : transaction.amountMinor
    return [{
      posted_at: dateOnly(transaction.postedAt),
      account: transaction.account.name,
      institution: transaction.account.institution ?? '',
      description: transaction.description,
      merchant: transaction.merchant?.name ?? '',
      category: transaction.category?.name ?? '',
      status: transaction.status,
      recurring: transaction.recurring ? 'yes' : 'no',
      amount: minorToDecimal(amountMinor),
      currency: transaction.currency,
      ownership_scope: scope === 'personal' ? memberName : scope,
      notes: transaction.notes ?? '',
    }]
  })
  return toCsv(rows)
}

export function buildAccountOwnershipCsv(backup: FinanceBackup) {
  return toCsv(backup.finance.workspace.accounts.flatMap((account) =>
    account.ownershipShares.map((share) => ({
      account: account.name,
      institution: account.institution ?? '',
      type: account.type,
      currency: account.currency,
      balance: minorToDecimal(account.balanceMinor),
      last_synced_at: account.lastSyncedAt?.toISOString?.() ?? String(account.lastSyncedAt ?? ''),
      member: share.member.user.name || share.member.user.email,
      member_email: share.member.user.email,
      role: share.member.role,
      ownership_percent: String(share.shareBasisPoints / 100),
    })),
  ))
}

function parseBackup(backupText: string): FinanceBackup {
  if (!backupText.trim()) throw new Error('Choose a Wollie backup JSON file.')
  let parsed: FinanceBackup
  try {
    parsed = JSON.parse(backupText) as FinanceBackup
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  if (parsed.format !== EXPORT_FORMAT || !parsed.finance?.workspace) {
    throw new Error('This is not a compatible Wollie finance backup.')
  }
  return parsed
}

function summarizeBackup(backup: FinanceBackup) {
  const workspace = backup.finance.workspace
  const allocations = workspace.budgetMonths.reduce((sum, month) => sum + month.allocations.length, 0)
  return {
    format: backup.format,
    exportedAt: backup.exportedAt,
    workspace: workspace.name,
    members: workspace.members.length,
    accounts: workspace.accounts.length,
    transactions: workspace.transactions.length,
    budgetMonths: workspace.budgetMonths.length,
    budgetAllocations: allocations,
    recurringPayments: workspace.recurringPayments.length,
    restorableNow: backup.recovery.restorableNow,
    warning: 'Restore updates planning data only. Bank balances, bank transactions, provider tokens, and billing are not overwritten.',
  }
}

function csvFilename(scope: ExportScope, accountId?: string) {
  const suffix = scope === 'account' && accountId ? `account-${accountId}` : scope
  return `wollie-${suffix}-transactions-${todayStamp()}.csv`
}

function toCsv<T extends Record<string, string | number | boolean | null | undefined>>(rows: T[]) {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(',')),
  ].join('\n')
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value)
  if (!/[",\n]/.test(text)) return text
  return `"${text.replace(/"/g, '""')}"`
}

function minorToDecimal(value: number) {
  return (value / 100).toFixed(2)
}

function dateOnly(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}
