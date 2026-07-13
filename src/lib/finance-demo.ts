import {
  applyBudgetRules,
  buildBudgetPlan,
  demoBudgetRules,
  type BudgetPlan,
  type BudgetRule,
} from './budget-engine'

export type FinanceCategory =
  | 'Income'
  | 'Housing'
  | 'Groceries'
  | 'Transport'
  | 'Dining'
  | 'Subscriptions'
  | 'Shopping'
  | 'Savings'
  | 'Health'

export type FinanceTransaction = {
  id: string
  date: string
  merchant: string
  account: string
  category: FinanceCategory
  amount: number
  status: 'cleared' | 'pending' | 'needs-review'
  recurring?: boolean
}

export type FinanceInsight = {
  id: string
  title: string
  body: string
}

export type BankSyncStatus = {
  mode: 'demo' | 'live-disabled' | 'live-connected'
  label: string
  description: string
  lastSynced: string
  canConnectLive: boolean
}

export type FinanceDashboardData = {
  month: string
  accounts: FinancialAccount[]
  transactions: FinanceTransaction[]
  budget: BudgetCategory[]
  budgetPlan: BudgetPlan
  rules: BudgetRule[]
  recurringPayments: RecurringPayment[]
  insights: FinanceInsight[]
  summary: ReturnType<typeof getDemoFinanceSummary>
  syncStatus: BankSyncStatus
}

export type BudgetCategory = {
  name: FinanceCategory
  allocated: number
  spent: number
}

export type FinancialAccount = {
  id: string
  name: string
  type: 'Checking' | 'Credit card' | 'Savings'
  balance: number
  institution: string
  lastSynced: string
}

export type RecurringPayment = {
  id: string
  merchant: string
  amount: number
  cadence: 'monthly' | 'yearly'
  nextDate: string
  category: FinanceCategory
}

export const demoAccounts: FinancialAccount[] = [
  {
    id: 'checking',
    name: 'Everyday checking',
    type: 'Checking',
    balance: 3842.18,
    institution: 'SimpleFIN demo bank',
    lastSynced: 'Today, 8:42 AM',
  },
  {
    id: 'savings',
    name: 'House deposit',
    type: 'Savings',
    balance: 18440,
    institution: 'SimpleFIN demo bank',
    lastSynced: 'Today, 8:42 AM',
  },
  {
    id: 'card',
    name: 'Daily card',
    type: 'Credit card',
    balance: -1284.36,
    institution: 'SimpleFIN demo card',
    lastSynced: 'Today, 8:39 AM',
  },
]

export const demoTransactions: FinanceTransaction[] = [
  {
    id: 'txn-1',
    date: 'Jul 12',
    merchant: 'Whole Foods Market',
    account: 'Daily card',
    category: 'Groceries',
    amount: -86.42,
    status: 'cleared',
  },
  {
    id: 'txn-2',
    date: 'Jul 12',
    merchant: 'Figma',
    account: 'Daily card',
    category: 'Subscriptions',
    amount: -15,
    status: 'cleared',
    recurring: true,
  },
  {
    id: 'txn-3',
    date: 'Jul 11',
    merchant: 'Payroll',
    account: 'Everyday checking',
    category: 'Income',
    amount: 4200,
    status: 'cleared',
  },
  {
    id: 'txn-4',
    date: 'Jul 10',
    merchant: 'City transit',
    account: 'Daily card',
    category: 'Transport',
    amount: -32.5,
    status: 'cleared',
  },
  {
    id: 'txn-5',
    date: 'Jul 10',
    merchant: 'Unknown Apple charge',
    account: 'Daily card',
    category: 'Subscriptions',
    amount: -9.99,
    status: 'needs-review',
    recurring: true,
  },
  {
    id: 'txn-6',
    date: 'Jul 9',
    merchant: 'Rent',
    account: 'Everyday checking',
    category: 'Housing',
    amount: -1850,
    status: 'cleared',
    recurring: true,
  },
  {
    id: 'txn-7',
    date: 'Jul 8',
    merchant: 'Miznon',
    account: 'Daily card',
    category: 'Dining',
    amount: -44.1,
    status: 'cleared',
  },
]

export const demoBudget: BudgetCategory[] = [
  { name: 'Housing', allocated: 1900, spent: 1850 },
  { name: 'Groceries', allocated: 520, spent: 286 },
  { name: 'Dining', allocated: 260, spent: 188 },
  { name: 'Transport', allocated: 180, spent: 94 },
  { name: 'Subscriptions', allocated: 90, spent: 54 },
  { name: 'Shopping', allocated: 240, spent: 196 },
  { name: 'Savings', allocated: 900, spent: 900 },
]

export const demoRecurringPayments: RecurringPayment[] = [
  {
    id: 'rec-1',
    merchant: 'Rent',
    amount: 1850,
    cadence: 'monthly',
    nextDate: 'Aug 1',
    category: 'Housing',
  },
  {
    id: 'rec-2',
    merchant: 'Figma',
    amount: 15,
    cadence: 'monthly',
    nextDate: 'Aug 12',
    category: 'Subscriptions',
  },
  {
    id: 'rec-3',
    merchant: 'Spotify',
    amount: 11.99,
    cadence: 'monthly',
    nextDate: 'Jul 24',
    category: 'Subscriptions',
  },
]

export const demoInsights: FinanceInsight[] = [
  {
    id: 'insight-flex',
    title: 'Spending is on track',
    body: 'You have $436 left for flexible spending in July.',
  },
  {
    id: 'insight-dining',
    title: 'Dining moved up',
    body: 'Weekend meals are pacing higher than last month.',
  },
  {
    id: 'insight-review',
    title: 'One thing to review',
    body: 'An Apple charge may be a recurring subscription.',
  },
]

export function formatMoney(amount: number) {
  const value = Math.abs(amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })

  return amount < 0 ? `−${value}` : value
}

export function getDemoFinanceSummary() {
  return getFinanceSummary({
    accounts: demoAccounts,
    transactions: demoTransactions,
    budget: demoBudget,
    recurringPayments: demoRecurringPayments,
  })
}

export function getFinanceSummary({
  accounts,
  transactions,
  budget = demoBudget,
  recurringPayments = demoRecurringPayments,
}: {
  accounts: FinancialAccount[]
  transactions: FinanceTransaction[]
  budget?: BudgetCategory[]
  recurringPayments?: RecurringPayment[]
}) {
  const cash = accounts.reduce((sum, account) => sum + account.balance, 0)
  const normalizedTransactions = applyBudgetRules(transactions)
  const budgetPlan = buildBudgetPlan({
    budget,
    transactions: normalizedTransactions,
    recurringPayments,
  })
  const monthlyIncome = normalizedTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  const spent = normalizedTransactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

  return {
    cash,
    monthlyIncome,
    spent,
    allocated: budgetPlan.allocated,
    spentAgainstBudget: budgetPlan.spent,
    safeToSpend: budgetPlan.flexibleAvailable,
    reviewCount: budgetPlan.reviewCount,
    recurringTotal: budgetPlan.recurringTotal,
    overCount: budgetPlan.overCount,
  }
}

export const demoSyncStatus: BankSyncStatus = {
  mode: 'demo',
  label: 'Demo sync',
  description: 'Sample bank data is loaded. Live bank sync can plug in next.',
  lastSynced: 'Today, 8:42 AM',
  canConnectLive: false,
}

export function getDemoFinanceDashboard(): FinanceDashboardData {
  const transactions = applyBudgetRules(demoTransactions)
  const budgetPlan = buildBudgetPlan({
    budget: demoBudget,
    transactions,
    recurringPayments: demoRecurringPayments,
  })

  return {
    month: 'July',
    accounts: demoAccounts,
    transactions,
    budget: demoBudget,
    budgetPlan,
    rules: demoBudgetRules,
    recurringPayments: demoRecurringPayments,
    insights: demoInsights,
    summary: getDemoFinanceSummary(),
    syncStatus: demoSyncStatus,
  }
}

export function filterDemoTransactions(options: {
  q?: string
  status?: FinanceTransaction['status'] | 'all'
  category?: FinanceCategory | 'all'
}) {
  return filterFinanceTransactions(applyBudgetRules(demoTransactions), options)
}

export function filterFinanceTransactions(
  transactions: FinanceTransaction[],
  options: {
    q?: string
    status?: FinanceTransaction['status'] | 'all'
    category?: FinanceCategory | 'all'
  },
) {
  const q = options.q?.trim().toLowerCase()

  return transactions.filter((transaction) => {
    const matchesQuery = q
      ? [transaction.merchant, transaction.account, transaction.category]
          .join(' ')
          .toLowerCase()
          .includes(q)
      : true
    const matchesStatus =
      !options.status || options.status === 'all' || transaction.status === options.status
    const matchesCategory =
      !options.category || options.category === 'all' || transaction.category === options.category

    return matchesQuery && matchesStatus && matchesCategory
  })
}
