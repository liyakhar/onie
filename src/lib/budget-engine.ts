import type {
  BudgetCategory,
  FinanceCategory,
  FinanceTransaction,
  RecurringPayment,
} from './finance-demo'

export type BudgetGroupName = 'Fixed' | 'Flexible' | 'Future'

export type BudgetRule = {
  id: string
  match: string
  category: FinanceCategory
  recurring?: boolean
}

export type BudgetEnvelope = BudgetCategory & {
  available: number
  percentUsed: number
  state: 'good' | 'watch' | 'over'
}

export type BudgetGroup = {
  name: BudgetGroupName
  categories: BudgetEnvelope[]
  allocated: number
  spent: number
  available: number
}

export type BudgetPlan = {
  groups: BudgetGroup[]
  allocated: number
  spent: number
  available: number
  flexibleAvailable: number
  overCount: number
  reviewCount: number
  recurringTotal: number
}

const CATEGORY_GROUPS: Record<FinanceCategory, BudgetGroupName | 'Hidden'> = {
  Income: 'Hidden',
  Housing: 'Fixed',
  Groceries: 'Flexible',
  Transport: 'Flexible',
  Dining: 'Flexible',
  Subscriptions: 'Fixed',
  Shopping: 'Flexible',
  Savings: 'Future',
  Health: 'Flexible',
  Transfer: 'Hidden',
}

export const demoBudgetRules: BudgetRule[] = [
  { id: 'rule-rent', match: 'rent', category: 'Housing', recurring: true },
  { id: 'rule-payroll', match: 'payroll', category: 'Income' },
  { id: 'rule-figma', match: 'figma', category: 'Subscriptions', recurring: true },
  { id: 'rule-apple', match: 'apple', category: 'Subscriptions', recurring: true },
  { id: 'rule-transit', match: 'transit', category: 'Transport' },
  { id: 'rule-whole-foods', match: 'whole foods', category: 'Groceries' },
]

export function applyBudgetRules(
  transactions: FinanceTransaction[],
  rules: BudgetRule[] = demoBudgetRules,
) {
  return transactions.map((transaction) => {
    const merchant = transaction.merchant.toLowerCase()
    const rule = rules.find((candidate) => merchant.includes(candidate.match.toLowerCase()))

    if (!rule) return transaction

    return {
      ...transaction,
      category: rule.category,
      recurring: transaction.recurring || rule.recurring,
      status:
        transaction.status === 'needs-review' && rule.category !== transaction.category
          ? 'cleared'
          : transaction.status,
    } satisfies FinanceTransaction
  })
}

export function buildBudgetPlan(options: {
  budget: BudgetCategory[]
  transactions: FinanceTransaction[]
  recurringPayments: RecurringPayment[]
}): BudgetPlan {
  const envelopes = options.budget.map((category) => {
    const available = category.allocated - category.spent
    const percentUsed = category.allocated === 0 ? 0 : Math.round((category.spent / category.allocated) * 100)
    const state = available < 0 ? 'over' : percentUsed >= 85 ? 'watch' : 'good'

    return {
      ...category,
      available,
      percentUsed,
      state,
    } satisfies BudgetEnvelope
  })

  const groups = (['Fixed', 'Flexible', 'Future'] as const)
    .map((groupName) => {
      const categories = envelopes.filter((category) => CATEGORY_GROUPS[category.name] === groupName)
      const allocated = categories.reduce((sum, category) => sum + category.allocated, 0)
      const spent = categories.reduce((sum, category) => sum + category.spent, 0)

      return {
        name: groupName,
        categories,
        allocated,
        spent,
        available: allocated - spent,
      } satisfies BudgetGroup
    })
    .filter((group) => group.categories.length > 0)

  const allocated = groups.reduce((sum, group) => sum + group.allocated, 0)
  const spent = groups.reduce((sum, group) => sum + group.spent, 0)
  const flexibleAvailable =
    groups.find((group) => group.name === 'Flexible')?.available ?? Math.max(allocated - spent, 0)
  const recurringTotal = options.recurringPayments.reduce((sum, payment) => sum + payment.amount, 0)

  return {
    groups,
    allocated,
    spent,
    available: allocated - spent,
    flexibleAvailable: Math.max(flexibleAvailable, 0),
    overCount: envelopes.filter((category) => category.state === 'over').length,
    reviewCount: options.transactions.filter((transaction) => transaction.status === 'needs-review').length,
    recurringTotal,
  }
}

export function detectRecurringTransactions(transactions: FinanceTransaction[]) {
  return transactions.filter((transaction) => transaction.recurring && transaction.amount < 0)
}
