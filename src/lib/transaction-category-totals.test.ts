import { describe, expect, it } from 'vitest'
import { buildTransactionCategoryTotals, sumTransactionCategoryTotals } from '#/lib/transaction-category-totals'

describe('buildTransactionCategoryTotals', () => {
  it('totals purchases by category without counting income or transfers', () => {
    const totals = buildTransactionCategoryTotals([
      { id: 'food-one', date: '2026-08-02', merchant: 'Market', account: 'Card', category: 'Groceries', amount: -42.5, currency: 'EUR', status: 'cleared' },
      { id: 'food-two', date: '2026-08-03', merchant: 'Bakery', account: 'Card', category: 'Groceries', amount: -7.5, currency: 'EUR', status: 'pending' },
      { id: 'income', date: '2026-08-01', merchant: 'Payroll', account: 'Checking', category: 'Income', amount: 2_000, currency: 'EUR', status: 'cleared' },
      { id: 'transfer', date: '2026-08-04', merchant: 'Internal transfer', account: 'Checking', category: 'Transfer', amount: -100, currency: 'EUR', status: 'cleared' },
    ])

    expect(totals).toEqual([{
      category: 'Groceries',
      totals: [{ currency: 'EUR', amount: 50 }],
      bucket: undefined,
    }])
  })

  it('keeps currencies separate and identifies a linked future envelope', () => {
    const totals = buildTransactionCategoryTotals([
      { id: 'pension-eur', date: '2026-08-02', merchant: 'Pension', account: 'Checking', category: 'Pension', amount: -100, currency: 'EUR', status: 'cleared' },
      { id: 'pension-usd', date: '2026-08-03', merchant: 'Pension', account: 'Card', category: 'Pension', amount: -20, currency: 'USD', status: 'cleared' },
    ], {
      enabled: true,
      currency: 'EUR',
      incomeMinor: 0,
      excludedIncomeMinor: 0,
      unallocatedMinor: 0,
      shortfallMinor: 0,
      unassignedSpendMinor: 0,
      excludedSpendMinor: 0,
      clearedSpendMinor: 0,
      pendingSpendMinor: 0,
      flexibleAvailableMinor: 0,
      reservedInPlanMinor: 0,
      contributedMinor: 0,
      pendingContributionMinor: 0,
      categoryOptions: ['Pension'],
      buckets: [{
        id: 'pension',
        name: 'Pension',
        group: 'FUTURE',
        purpose: 'GOAL',
        type: 'FIXED',
        priority: 0,
        requestedMinor: 10000,
        fundedMinor: 10000,
        shortfallMinor: 0,
        percentFunded: 100,
        clearedSpendMinor: 0,
        pendingSpendMinor: 0,
        spentMinor: 0,
        contributedMinor: 10000,
        pendingContributionMinor: 0,
        availableMinor: 0,
        percentUsed: 100,
        state: 'good',
        categoryNames: ['Pension'],
      }],
    })

    expect(totals).toEqual([{
      category: 'Pension',
      totals: [
        { currency: 'EUR', amount: 100 },
        { currency: 'USD', amount: 20 },
      ],
      bucket: { availableMinor: 0, name: 'Pension', purpose: 'GOAL' },
    }])
  })

  it('keeps future contributions out of a spending total', () => {
    const totals = buildTransactionCategoryTotals([
      { id: 'food', date: '2026-08-02', merchant: 'Market', account: 'Card', category: 'Groceries', amount: -42.5, currency: 'EUR', status: 'cleared' },
      { id: 'pension', date: '2026-08-03', merchant: 'Pension', account: 'Checking', category: 'Pension', amount: -100, currency: 'EUR', status: 'cleared' },
    ], {
      enabled: true,
      currency: 'EUR',
      incomeMinor: 0,
      excludedIncomeMinor: 0,
      unallocatedMinor: 0,
      shortfallMinor: 0,
      unassignedSpendMinor: 0,
      excludedSpendMinor: 0,
      clearedSpendMinor: 0,
      pendingSpendMinor: 0,
      flexibleAvailableMinor: 0,
      reservedInPlanMinor: 0,
      contributedMinor: 0,
      pendingContributionMinor: 0,
      categoryOptions: ['Groceries', 'Pension'],
      buckets: [
        {
          id: 'food',
          name: 'Food',
          group: 'FLEXIBLE',
          purpose: 'SPENDING',
          type: 'FIXED',
          priority: 0,
          requestedMinor: 10000,
          fundedMinor: 10000,
          shortfallMinor: 0,
          percentFunded: 100,
          clearedSpendMinor: 0,
          pendingSpendMinor: 0,
          spentMinor: 0,
          contributedMinor: 0,
          pendingContributionMinor: 0,
          availableMinor: 5750,
          percentUsed: 42.5,
          state: 'good',
          categoryNames: ['Groceries'],
        },
        {
          id: 'pension',
          name: 'Pension',
          group: 'FUTURE',
          purpose: 'GOAL',
          type: 'FIXED',
          priority: 1,
          requestedMinor: 10000,
          fundedMinor: 10000,
          shortfallMinor: 0,
          percentFunded: 100,
          clearedSpendMinor: 0,
          pendingSpendMinor: 0,
          spentMinor: 0,
          contributedMinor: 10000,
          pendingContributionMinor: 0,
          availableMinor: 0,
          percentUsed: 100,
          state: 'good',
          categoryNames: ['Pension'],
        },
      ],
    })

    const spendingTotals = totals.filter((total) => total.bucket?.purpose !== 'RESERVE' && total.bucket?.purpose !== 'GOAL')
    const savingTotals = totals.filter((total) => total.bucket?.purpose === 'RESERVE' || total.bucket?.purpose === 'GOAL')

    expect(sumTransactionCategoryTotals(spendingTotals)).toEqual([{ currency: 'EUR', amount: 42.5 }])
    expect(sumTransactionCategoryTotals(savingTotals)).toEqual([{ currency: 'EUR', amount: 100 }])
  })
})
