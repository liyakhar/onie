import { createServerFn } from '@tanstack/react-start'
import { applyBudgetRules } from '#/lib/budget-engine'
import {
  filterFinanceTransactions,
  getDemoFinanceDashboard,
  getFinanceSummary,
  type BudgetCategory,
  type FinanceCategory,
  type FinanceDashboardData,
  type FinanceTransaction,
  type RecurringPayment,
} from '#/lib/finance-demo'
import { loadBankSyncState } from '#/server/bank-sync'

export const getFinanceDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await loadBankSyncState()

  const transactions = applyBudgetRules(syncState.transactions)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: [] as BudgetCategory[],
    recurringPayments: [] as RecurringPayment[],
  })
  const demoDashboard = getDemoFinanceDashboard()

  return {
    ...demoDashboard,
    month: getCurrentMonthName(),
    syncStatus: syncState.status,
    accounts: syncState.accounts,
    transactions,
    budget: [] as BudgetCategory[],
    budgetPlan: summary.budgetPlan,
    recurringPayments: [] as RecurringPayment[],
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
    const syncState = await loadBankSyncState()
    const transactions = applyBudgetRules(syncState.transactions)

    return {
      transactions: filterFinanceTransactions(transactions, data),
    }
  })

export const getFinanceBudget = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await loadBankSyncState()
  const transactions = applyBudgetRules(syncState.transactions)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: [] as BudgetCategory[],
    recurringPayments: [] as RecurringPayment[],
  })

  return {
    month: getCurrentMonthName(),
    budget: [],
    budgetPlan: summary.budgetPlan,
    summary,
    syncStatus: syncState.status,
  }
})

export const getFinanceAccounts = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await loadBankSyncState()
  return {
    accounts: syncState.accounts,
    syncStatus: syncState.status,
  }
})

export const getFinanceRecurringPayments = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    recurringPayments: [] as RecurringPayment[],
  }
})

export const getFinanceInsights = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await loadBankSyncState()
  const transactions = applyBudgetRules(syncState.transactions)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
    budget: [] as BudgetCategory[],
    recurringPayments: [] as RecurringPayment[],
  })

  return {
    insights: buildStatusNotes(summary.reviewCount, syncState.accounts.length),
  }
})

function getCurrentMonthName() {
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())
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
