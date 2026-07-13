import { createServerFn } from '@tanstack/react-start'
import { applyBudgetRules } from '#/lib/budget-engine'
import {
  filterFinanceTransactions,
  getDemoFinanceDashboard,
  getFinanceSummary,
  type FinanceCategory,
  type FinanceTransaction,
} from '#/lib/finance-demo'
import { getBankSyncState } from '#/server/bank-sync'

export const getFinanceDashboard = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await getBankSyncState()

  if (syncState.provider === 'demo') {
    return getDemoFinanceDashboard()
  }

  const transactions = applyBudgetRules(syncState.transactions)
  const summary = getFinanceSummary({
    accounts: syncState.accounts,
    transactions,
  })
  const demoDashboard = getDemoFinanceDashboard()

  return {
    ...demoDashboard,
    syncStatus: syncState.status,
    accounts: syncState.accounts,
    transactions,
    summary,
  }
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
    const syncState = await getBankSyncState()
    const transactions =
      syncState.provider === 'demo'
        ? getDemoFinanceDashboard().transactions
        : applyBudgetRules(syncState.transactions)

    return {
      transactions: filterFinanceTransactions(transactions, data),
    }
  })

export const getFinanceBudget = createServerFn({ method: 'GET' }).handler(async () => {
  const dashboard = getDemoFinanceDashboard()
  return {
    month: dashboard.month,
    budget: dashboard.budget,
    budgetPlan: dashboard.budgetPlan,
    summary: dashboard.summary,
  }
})

export const getFinanceAccounts = createServerFn({ method: 'GET' }).handler(async () => {
  const syncState = await getBankSyncState()
  return {
    accounts: syncState.accounts,
    syncStatus: syncState.status,
  }
})

export const getFinanceRecurringPayments = createServerFn({ method: 'GET' }).handler(async () => {
  const dashboard = getDemoFinanceDashboard()
  return {
    recurringPayments: dashboard.recurringPayments,
  }
})

export const getFinanceInsights = createServerFn({ method: 'GET' }).handler(async () => {
  const dashboard = getDemoFinanceDashboard()
  return {
    insights: dashboard.insights,
  }
})
