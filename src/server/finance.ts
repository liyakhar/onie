import { createServerFn } from '@tanstack/react-start'
import {
  detectRecurringPayments,
  FINANCE_CATEGORIES,
  filterFinanceTransactions,
  filterTransactionsForMonth,
  getDemoFinanceDashboard,
  getFinanceSummary,
  type BudgetCategory,
  type FinanceCategory,
  type FinanceDashboardData,
  type FinanceTransaction,
  type RecurringPayment,
} from '#/lib/finance-demo'
import { loadBankSyncState } from '#/server/bank-sync'
import { getDb } from '#/server/db-access.server'
import { getSessionUser } from '#/server/session.server'

export const getFinanceDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const devDashboard = await getDevFinanceDashboard()
  if (devDashboard) return devDashboard

  const syncState = await loadBankSyncState()

  const planning = await loadFinancePlanningData(syncState.transactions)
  const recurringPayments = planning.recurringPayments
  const transactions = markRecurringTransactions(syncState.transactions, recurringPayments)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: planning.budget,
    recurringPayments,
    rules: planning.rules,
  })
  const demoDashboard = getDemoFinanceDashboard()

  return {
    ...demoDashboard,
    month: getCurrentMonthName(),
    syncStatus: syncState.status,
    accounts: syncState.accounts,
    transactions,
    budget: planning.budget,
    budgetPlan: summary.budgetPlan,
    recurringPayments,
    insights: buildStatusNotes(summary.reviewCount, syncState.accounts.length),
    summary,
  } satisfies FinanceDashboardData
})

export const getFinanceTransactions = createServerFn({ method: 'GET' })
  .inputValidator(
    (data: {
      q?: string
      status?: FinanceTransaction['status'] | 'all'
      category?: FinanceCategory | 'all'
    }) => data ?? {},
  )
  .handler(async ({ data }) => {
    const devDashboard = await getDevFinanceDashboard()
    if (devDashboard) {
      return {
        transactions: filterFinanceTransactions(devDashboard.transactions, data),
      }
    }

    const syncState = await loadBankSyncState()
    const recurringPayments = detectRecurringPayments(syncState.transactions)
    const transactions = markRecurringTransactions(syncState.transactions, recurringPayments)

    return {
      transactions: filterFinanceTransactions(transactions, data),
    }
  })

export const getFinanceBudget = createServerFn({ method: 'GET' }).handler(async () => {
  const devDashboard = await getDevFinanceDashboard()
  if (devDashboard) {
    return {
      month: devDashboard.month,
      budget: devDashboard.budget,
      budgetPlan: devDashboard.budgetPlan,
      summary: devDashboard.summary,
      syncStatus: devDashboard.syncStatus,
      currency: devDashboard.accounts[0]?.currency || 'USD',
    }
  }

  const syncState = await loadBankSyncState()
  const planning = await loadFinancePlanningData(syncState.transactions)
  const recurringPayments = planning.recurringPayments
  const transactions = markRecurringTransactions(syncState.transactions, recurringPayments)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: planning.budget,
    recurringPayments,
    rules: planning.rules,
  })

  return {
    month: getCurrentMonthName(),
    budget: planning.budget,
    budgetPlan: summary.budgetPlan,
    summary,
    syncStatus: syncState.status,
    currency: syncState.accounts[0]?.currency || 'USD',
  }
})

export const getFinanceAccounts = createServerFn({ method: 'GET' }).handler(async () => {
  const devDashboard = await getDevFinanceDashboard()
  if (devDashboard) {
    return {
      accounts: devDashboard.accounts,
      syncStatus: devDashboard.syncStatus,
    }
  }

  const syncState = await loadBankSyncState()
  return {
    accounts: syncState.accounts,
    syncStatus: syncState.status,
  }
})

export const getFinanceRecurringPayments = createServerFn({ method: 'GET' }).handler(async () => {
  const devDashboard = await getDevFinanceDashboard()
  if (devDashboard) {
    return { recurringPayments: devDashboard.recurringPayments, currency: devDashboard.accounts[0]?.currency || 'USD' }
  }

  const syncState = await loadBankSyncState()
  const planning = await loadFinancePlanningData(syncState.transactions)
  return { recurringPayments: planning.recurringPayments, currency: syncState.accounts[0]?.currency || 'USD' }
})

export const getFinanceInsights = createServerFn({ method: 'GET' }).handler(async () => {
  const devDashboard = await getDevFinanceDashboard()
  if (devDashboard) return { insights: devDashboard.insights }

  const syncState = await loadBankSyncState()
  const planning = await loadFinancePlanningData(syncState.transactions)
  const recurringPayments = planning.recurringPayments
  const transactions = markRecurringTransactions(syncState.transactions, recurringPayments)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: planning.budget,
    recurringPayments,
    rules: planning.rules,
  })

  return {
    insights: buildStatusNotes(summary.reviewCount, syncState.accounts.length),
  }
})

export const updateFinanceBudgetAllocation = createServerFn({ method: 'POST' })
  .validator((data: { category: FinanceCategory; allocated: number }) => ({
    category: data?.category,
    allocated: Number(data?.allocated ?? 0),
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in to update your budget.')
    if (!FINANCE_CATEGORIES.includes(data.category) || !Number.isFinite(data.allocated) || data.allocated < 0) {
      throw new Error('Enter a valid monthly amount.')
    }

    if (isDevUser(user.email)) {
      const current = getMutableDevDashboard()
      const existing = current.budget.find((item) => item.name === data.category)
      current.budget = existing
        ? current.budget.map((item) => item.name === data.category ? { ...item, allocated: data.allocated } : item)
        : [...current.budget, { name: data.category, allocated: data.allocated, spent: 0 }]
      return { saved: true }
    }

    const prisma = await getDb()
    const workspace = await getOrCreatePlanningWorkspace(user.id)
    const category = await prisma.transactionCategory.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: data.category } },
      create: { workspaceId: workspace.id, name: data.category, system: true },
      update: {},
    })
    const month = await prisma.budgetMonth.upsert({
      where: { workspaceId_month: { workspaceId: workspace.id, month: getCurrentMonthKey() } },
      create: { workspaceId: workspace.id, month: getCurrentMonthKey() },
      update: {},
    })
    await prisma.budgetAllocation.upsert({
      where: { budgetMonthId_categoryId: { budgetMonthId: month.id, categoryId: category.id } },
      create: { budgetMonthId: month.id, categoryId: category.id, allocatedMinor: Math.round(data.allocated * 100) },
      update: { allocatedMinor: Math.round(data.allocated * 100) },
    })
    return { saved: true }
  })

export const updateFinanceRecurringPayment = createServerFn({ method: 'POST' })
  .validator((data: {
    id?: string
    action: 'confirm' | 'save' | 'dismiss'
    merchant: string
    amount: number
    nextDate: string
    cadence: 'monthly' | 'yearly'
    category: FinanceCategory
  }) => ({
    id: String(data?.id ?? ''),
    action: data?.action,
    merchant: String(data?.merchant ?? '').trim(),
    amount: Number(data?.amount ?? 0),
    nextDate: String(data?.nextDate ?? ''),
    cadence: data?.cadence,
    category: data?.category,
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in to update bills.')
    if (!data.merchant || !Number.isFinite(data.amount) || data.amount < 0 || !data.nextDate) {
      throw new Error('Enter a merchant, amount, and next date.')
    }

    if (isDevUser(user.email)) {
      const current = getMutableDevDashboard()
      const next: RecurringPayment = {
        id: data.id || `dev-rec-${slugify(data.merchant)}`,
        merchant: data.merchant,
        amount: data.amount,
        nextDate: data.nextDate,
        cadence: data.cadence,
        category: data.category,
        currency: current.accounts[0]?.currency || 'USD',
        confirmed: data.action !== 'dismiss',
        source: 'confirmed',
      }
      current.recurringPayments = [
        ...current.recurringPayments.filter((item) => normalizeMerchant(item.merchant) !== normalizeMerchant(data.merchant) && item.id !== data.id),
        ...(data.action === 'dismiss' ? [] : [next]),
      ]
      return { saved: true }
    }

    const prisma = await getDb()
    const workspace = await getOrCreatePlanningWorkspace(user.id)
    const category = await prisma.transactionCategory.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: data.category } },
      create: { workspaceId: workspace.id, name: data.category, system: true },
      update: {},
    })
    const merchant = await prisma.merchant.upsert({
      where: { workspaceId_normalizedName: { workspaceId: workspace.id, normalizedName: normalizeMerchant(data.merchant) } },
      create: { workspaceId: workspace.id, name: data.merchant, normalizedName: normalizeMerchant(data.merchant) },
      update: { name: data.merchant },
    })
    const existing = data.id && !data.id.startsWith('detected-')
      ? await prisma.recurringPayment.findFirst({ where: { id: data.id, workspaceId: workspace.id } })
      : await prisma.recurringPayment.findFirst({ where: { workspaceId: workspace.id, merchantId: merchant.id } })
    const values = {
      workspaceId: workspace.id,
      merchantId: merchant.id,
      categoryId: category.id,
      name: data.merchant,
      amountMinor: Math.round(data.amount * 100),
      currency: workspace.currency,
      cadence: data.cadence === 'yearly' ? 'YEARLY' as const : 'MONTHLY' as const,
      nextDate: new Date(`${data.nextDate}T12:00:00`),
      confirmed: data.action !== 'dismiss',
    }
    if (existing) await prisma.recurringPayment.update({ where: { id: existing.id }, data: values })
    else await prisma.recurringPayment.create({ data: values })
    return { saved: true }
  })

export const updateFinanceTransactionCategory = createServerFn({ method: 'POST' })
  .validator((data: { transactionId: string; category: FinanceCategory }) => ({
    transactionId: String(data?.transactionId ?? ''),
    category: data?.category,
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in to review transactions.')
    if (!data.transactionId || !FINANCE_CATEGORIES.includes(data.category)) {
      throw new Error('Choose a valid category.')
    }

    if (isDevUser(user.email)) {
      const current = getMutableDevDashboard()
      current.transactions = current.transactions.map((transaction) => transaction.id === data.transactionId
        ? { ...transaction, category: data.category, status: 'cleared' }
        : transaction)
      return { updated: 1 }
    }

    const prisma = await getDb()
    const transaction = await prisma.financeTransaction.findFirst({
      where: {
        id: data.transactionId,
        workspace: { userId: user.id },
      },
      include: { merchant: true },
    })
    if (!transaction) throw new Error('Transaction not found.')

    const category = await prisma.transactionCategory.upsert({
      where: {
        workspaceId_name: {
          workspaceId: transaction.workspaceId,
          name: data.category,
        },
      },
      create: {
        workspaceId: transaction.workspaceId,
        name: data.category,
        system: true,
      },
      update: {},
    })

    if (!transaction.merchantId) {
      await prisma.financeTransaction.update({
        where: { id: transaction.id },
        data: { categoryId: category.id, status: 'CLEARED' },
      })
      return { updated: 1 }
    }

    const existingRule = await prisma.categoryRule.findFirst({
      where: {
        workspaceId: transaction.workspaceId,
        merchantId: transaction.merchantId,
      },
    })

    const [, updated] = await prisma.$transaction([
      existingRule
        ? prisma.categoryRule.update({
            where: { id: existingRule.id },
            data: { categoryId: category.id },
          })
        : prisma.categoryRule.create({
            data: {
              workspaceId: transaction.workspaceId,
              merchantId: transaction.merchantId,
              categoryId: category.id,
            },
          }),
      prisma.financeTransaction.updateMany({
        where: {
          workspaceId: transaction.workspaceId,
          merchantId: transaction.merchantId,
        },
        data: { categoryId: category.id, status: 'CLEARED' },
      }),
    ])

    return { updated: updated.count }
  })

function getCurrentMonthName() {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())
}

function getCurrentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

type MutableDevDashboard = FinanceDashboardData & {
  budget: BudgetCategory[]
  recurringPayments: RecurringPayment[]
  transactions: FinanceTransaction[]
}

let mutableDevDashboard: MutableDevDashboard | null = null

function getMutableDevDashboard() {
  if (!mutableDevDashboard) {
    const base = getDemoFinanceDashboard()
    mutableDevDashboard = {
      ...base,
      budget: base.budget.map((item) => ({ ...item })),
      recurringPayments: base.recurringPayments.map((item) => ({ ...item, confirmed: true, source: 'confirmed' })),
      transactions: base.transactions.map((item) => ({ ...item })),
    }
  }
  return mutableDevDashboard
}

function buildMutableDevDashboard() {
  const current = getMutableDevDashboard()
  const summary = getFinanceSummary({
    accounts: current.accounts,
    transactions: current.transactions,
    budget: current.budget,
    recurringPayments: current.recurringPayments,
    rules: current.rules,
  })
  return {
    ...current,
    month: getCurrentMonthName(),
    budgetPlan: summary.budgetPlan,
    summary,
  } satisfies FinanceDashboardData
}

async function getDevFinanceDashboard() {
  if (process.env.NODE_ENV !== 'development') return null

  const user = await getSessionUser()
  if (!user || !isDevUser(user.email)) return null

  // The developer login starts with useful sample data, but it must stop
  // masking real provider data as soon as an account has been connected.
  const prisma = await getDb()
  const connectedAccounts = await prisma.financialAccount.count({
    where: {
      workspace: { userId: user.id },
      bankConnection: { status: 'CONNECTED' },
    },
  })
  if (connectedAccounts > 0) return null

  return buildMutableDevDashboard()
}

function isDevUser(email?: string | null) {
  return process.env.NODE_ENV === 'development' && email === 'dev@wollie.local'
}

async function getOrCreatePlanningWorkspace(userId: string) {
  const prisma = await getDb()
  const existing = await prisma.budgetWorkspace.findFirst({
    where: { userId, demo: false },
    orderBy: { createdAt: 'asc' },
  })
  if (existing) return existing
  return prisma.budgetWorkspace.create({ data: { userId, name: 'Personal budget', demo: false } })
}

async function loadFinancePlanningData(transactions: FinanceTransaction[]) {
  const user = await getSessionUser()
  if (!user) return { budget: [] as BudgetCategory[], recurringPayments: [] as RecurringPayment[], rules: [] }
  const prisma = await getDb()
  const workspace = await prisma.budgetWorkspace.findFirst({
    where: { userId: user.id, demo: false },
    include: {
      budgetMonths: {
        where: { month: getCurrentMonthKey() },
        include: { allocations: { include: { category: true } } },
      },
      recurringPayments: { include: { category: true, merchant: true }, orderBy: { nextDate: 'asc' } },
    },
    orderBy: { createdAt: 'asc' },
  })
  if (!workspace) {
    return {
      budget: [] as BudgetCategory[],
      recurringPayments: detectRecurringPayments(transactions),
      rules: [],
    }
  }

  const currentTransactions = filterTransactionsForMonth(transactions)
  const spendingByCategory = new Map<FinanceCategory, number>()
  for (const transaction of currentTransactions) {
    if (transaction.amount >= 0 || transaction.category === 'Transfer') continue
    spendingByCategory.set(
      transaction.category,
      (spendingByCategory.get(transaction.category) ?? 0) + Math.abs(transaction.amount),
    )
  }
  const budget = (workspace.budgetMonths[0]?.allocations ?? []).flatMap((allocation) => {
    const name = allocation.category.name as FinanceCategory
    if (!FINANCE_CATEGORIES.includes(name)) return []
    return [{ name, allocated: allocation.allocatedMinor / 100, spent: spendingByCategory.get(name) ?? 0 }]
  })
  const saved = workspace.recurringPayments.map((payment) => ({
    id: payment.id,
    merchant: payment.merchant?.name || payment.name,
    amount: Math.abs(payment.amountMinor / 100),
    cadence: payment.cadence === 'YEARLY' ? 'yearly' as const : 'monthly' as const,
    nextDate: payment.nextDate.toISOString().slice(0, 10),
    category: FINANCE_CATEGORIES.includes(payment.category?.name as FinanceCategory)
      ? payment.category!.name as FinanceCategory
      : 'Subscriptions' as const,
    currency: payment.currency,
    confirmed: payment.confirmed,
    source: 'confirmed' as const,
  }))
  const suppressed = new Set(saved.filter((item) => !item.confirmed).map((item) => normalizeMerchant(item.merchant)))
  const confirmed = saved.filter((item) => item.confirmed)
  const confirmedNames = new Set(confirmed.map((item) => normalizeMerchant(item.merchant)))
  const detected = detectRecurringPayments(transactions).filter((item) => {
    const merchant = normalizeMerchant(item.merchant)
    return !confirmedNames.has(merchant) && !suppressed.has(merchant)
  })

  return { budget, recurringPayments: [...confirmed, ...detected], rules: [] }
}

function normalizeMerchant(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function slugify(value: string) {
  return normalizeMerchant(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function markRecurringTransactions(
  transactions: FinanceTransaction[],
  recurringPayments: RecurringPayment[],
) {
  const recurringMerchants = new Set(
    recurringPayments.map((payment) => payment.merchant.trim().toLowerCase()),
  )
  return transactions.map((transaction) => ({
    ...transaction,
    recurring: recurringMerchants.has(transaction.merchant.trim().toLowerCase()),
  }))
}

function buildStatusNotes(reviewCount: number, accountCount: number) {
  if (accountCount === 0) {
    return [
      {
        id: 'connect-account',
        title: 'No bank connected',
        body: 'Connect an account before Wollie can show balances, spending, and review items.',
      },
    ]
  }

  if (reviewCount > 0) {
    return [
      {
        id: 'review-transactions',
        title: `${reviewCount} item${reviewCount === 1 ? '' : 's'} need review`,
        body: 'Review uncategorized or unusual transactions before trusting the plan.',
      },
    ]
  }

  return [
    {
      id: 'no-review',
      title: 'Nothing needs review',
      body: 'Connected transactions are categorized and ready for the plan.',
    },
  ]
}
