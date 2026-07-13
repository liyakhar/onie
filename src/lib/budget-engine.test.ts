import { describe, expect, it } from 'vitest'
import {
  applyBudgetRules,
  buildBudgetPlan,
  demoBudgetRules,
  detectRecurringTransactions,
} from './budget-engine'
import { demoBudget, demoRecurringPayments, demoTransactions } from './finance-demo'

describe('budget engine', () => {
  it('groups budget categories into fixed, flexible, and future envelopes', () => {
    const plan = buildBudgetPlan({
      budget: demoBudget,
      transactions: applyBudgetRules(demoTransactions),
      recurringPayments: demoRecurringPayments,
    })

    expect(plan.groups.map((group) => group.name)).toEqual(['Fixed', 'Flexible', 'Future'])
    expect(plan.flexibleAvailable).toBe(436)
    expect(plan.recurringTotal).toBe(1876.99)
  })

  it('applies merchant rules before showing transactions', () => {
    const [transaction] = applyBudgetRules(
      [
        {
          id: 'txn-test',
          date: 'Jul 13',
          merchant: 'Figma annual',
          account: 'Daily card',
          category: 'Shopping',
          amount: -15,
          status: 'cleared',
        },
      ],
      demoBudgetRules,
    )

    expect(transaction?.category).toBe('Subscriptions')
    expect(transaction?.recurring).toBe(true)
  })

  it('detects recurring outflow transactions', () => {
    const recurring = detectRecurringTransactions(applyBudgetRules(demoTransactions))

    expect(recurring.map((transaction) => transaction.merchant)).toEqual([
      'Figma',
      'Unknown Apple charge',
      'Rent',
    ])
  })
})
