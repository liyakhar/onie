import { describe, expect, it } from 'vitest'
import {
  detectRecurringPayments,
  filterDemoTransactions,
  getDemoFinanceSummary,
  getFinanceSummary,
} from './finance-demo'

describe('finance demo data', () => {
  it('calculates the dashboard summary from the demo data', () => {
    const summary = getDemoFinanceSummary()

    expect(summary.monthlyIncome).toBe(4200)
    expect(summary.reviewCount).toBe(1)
    expect(summary.safeToSpend).toBe(436)
    expect(summary.cashAfterCommitments).toBe(2545.83)
  })

  it('caps available spending at the flexible plan and ignores unconfirmed bills', () => {
    const summary = getFinanceSummary({
      accounts: [{ id: 'checking', name: 'Checking', type: 'Checking', balance: 5000, institution: 'Bank', lastSynced: 'Now' }],
      transactions: [],
      budget: [{ name: 'Dining', allocated: 300, spent: 75 }],
      recurringPayments: [
        { id: 'confirmed', merchant: 'Phone', amount: 100, cadence: 'monthly', nextDate: '2026-07-20', category: 'Subscriptions', confirmed: true },
        { id: 'detected', merchant: 'Maybe', amount: 400, cadence: 'monthly', nextDate: '2026-07-22', category: 'Subscriptions', confirmed: false },
      ],
      referenceDate: new Date('2026-07-14T12:00:00Z'),
    })

    expect(summary.upcomingRecurring).toBe(100)
    expect(summary.cashAfterCommitments).toBe(4900)
    expect(summary.safeToSpend).toBe(225)
  })

  it('filters transactions by text and status', () => {
    const transactions = filterDemoTransactions({
      q: 'apple',
      status: 'needs-review',
      category: 'all',
    })

    expect(transactions).toHaveLength(1)
    expect(transactions[0]?.merchant).toContain('Apple')
  })

  it('uses only the selected month and excludes transfers from cashflow', () => {
    const summary = getFinanceSummary({
      accounts: [
        {
          id: 'checking',
          name: 'Checking',
          type: 'Checking',
          balance: 2000,
          institution: 'Bank',
          lastSynced: 'Now',
        },
        {
          id: 'card',
          name: 'Card',
          type: 'Credit card',
          balance: -300,
          institution: 'Bank',
          lastSynced: 'Now',
        },
      ],
      transactions: [
        { id: 'income', date: '2026-07-01', merchant: 'Payroll', account: 'Checking', category: 'Income', amount: 1000, status: 'cleared' },
        { id: 'food', date: '2026-07-02', merchant: 'Market', account: 'Card', category: 'Groceries', amount: -100, status: 'cleared' },
        { id: 'transfer', date: '2026-07-03', merchant: 'Internal transfer', account: 'Checking', category: 'Transfer', amount: -500, status: 'cleared' },
        { id: 'old', date: '2026-06-30', merchant: 'Old purchase', account: 'Card', category: 'Shopping', amount: -900, status: 'cleared' },
      ],
      budget: [],
      recurringPayments: [
        { id: 'rent', merchant: 'Rent', amount: 200, cadence: 'monthly', nextDate: '2026-07-20', category: 'Housing' },
      ],
      referenceDate: new Date('2026-07-14T12:00:00Z'),
    })

    expect(summary.cash).toBe(2000)
    expect(summary.creditCardDebt).toBe(300)
    expect(summary.monthlyIncome).toBe(1000)
    expect(summary.spent).toBe(100)
    expect(summary.safeToSpend).toBe(1500)
  })

  it('detects stable monthly charges from transaction history', () => {
    const recurring = detectRecurringPayments(
      [
        { id: 'one', date: '2026-05-10', merchant: 'Stream Co', account: 'Card', category: 'Subscriptions', amount: -15, status: 'cleared' },
        { id: 'two', date: '2026-06-10', merchant: 'Stream Co', account: 'Card', category: 'Subscriptions', amount: -15, status: 'cleared' },
        { id: 'three', date: '2026-07-10', merchant: 'Stream Co', account: 'Card', category: 'Subscriptions', amount: -15, status: 'cleared' },
      ],
      new Date('2026-07-14T12:00:00Z'),
    )

    expect(recurring).toEqual([
      expect.objectContaining({
        merchant: 'Stream Co',
        amount: 15,
        cadence: 'monthly',
        nextDate: '2026-08-10',
      }),
    ])
  })
})
