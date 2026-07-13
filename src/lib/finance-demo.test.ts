import { describe, expect, it } from 'vitest'
import { filterDemoTransactions, getDemoFinanceSummary } from './finance-demo'

describe('finance demo data', () => {
  it('calculates the dashboard summary from the demo data', () => {
    const summary = getDemoFinanceSummary()

    expect(summary.monthlyIncome).toBe(4200)
    expect(summary.reviewCount).toBe(1)
    expect(summary.safeToSpend).toBeGreaterThan(0)
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
})
