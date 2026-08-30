import { describe, expect, it } from 'vitest'
import {
  budgetCategoriesForIncomeEnvelope,
  parseIncomeEnvelopePlanInput,
  projectIncomeEnvelopePlan,
} from './income-envelope-budget.server'

function transaction(overrides: Partial<{
  id: string
  account: string
  category: 'Income' | 'Groceries' | 'Tax' | 'Transfer'
  amount: number
  currency: string
  status: 'cleared' | 'pending' | 'needs-review'
  merchant: string
}> = {}) {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    date: new Date().toISOString(),
    merchant: overrides.merchant ?? 'Merchant',
    account: overrides.account ?? 'Everyday card',
    category: overrides.category ?? 'Groceries',
    amount: overrides.amount ?? -1,
    currency: overrides.currency ?? 'EUR',
    status: overrides.status ?? 'cleared',
  }
}

describe('income envelope server projection', () => {
  it('combines member income and reserves card spending in mapped envelopes', () => {
    const plan = projectIncomeEnvelopePlan({
      currency: 'EUR',
      rules: [
        {
          id: 'food',
          bucketId: 'food',
          bucketName: 'Food',
          group: 'FLEXIBLE',
          purpose: 'SPENDING',
          type: 'FIXED',
          fixedMinor: 100_000,
          priority: 0,
          categoryNames: ['Groceries'],
        },
        {
          id: 'extra',
          bucketId: 'extra',
          bucketName: 'Extra',
          group: 'FLEXIBLE',
          purpose: 'SPENDING',
          type: 'REMAINDER',
          priority: 1,
          categoryNames: ['Shopping'],
        },
      ],
      transactions: [
        transaction({ id: 'liya-income', account: 'Liya checking', category: 'Income', amount: 2_000 }),
        transaction({ id: 'alex-income', account: 'Alex checking', category: 'Income', amount: 1_000 }),
        transaction({ id: 'food-cleared', account: 'Liya card', amount: -800 }),
        transaction({ id: 'food-pending', account: 'Alex card', amount: -200, status: 'pending' }),
        transaction({ id: 'usd-income', account: 'Wise USD', category: 'Income', amount: 500, currency: 'USD' }),
        transaction({ id: 'usd-food', amount: -100, currency: 'USD' }),
        transaction({ id: 'transfer', category: 'Income', amount: 700, merchant: 'Internal transfer' }),
      ],
    })

    expect(plan).toEqual(expect.objectContaining({
      enabled: true,
      incomeMinor: 300_000,
      excludedIncomeMinor: 50_000,
      excludedSpendMinor: 10_000,
      unassignedSpendMinor: 0,
    }))
    expect(plan.buckets).toEqual([
      expect.objectContaining({
        name: 'Food',
        fundedMinor: 100_000,
        clearedSpendMinor: 80_000,
        pendingSpendMinor: 20_000,
        availableMinor: 0,
      }),
      expect.objectContaining({ name: 'Extra', fundedMinor: 200_000 }),
    ])
  })

  it('does not enable an envelope plan until the household has rules', () => {
    const plan = projectIncomeEnvelopePlan({
      currency: 'EUR',
      rules: [],
      transactions: [transaction({ category: 'Income', amount: 500 })],
    })

    expect(plan).toEqual(expect.objectContaining({
      enabled: false,
      incomeMinor: 50_000,
      unallocatedMinor: 50_000,
      buckets: [],
    }))
  })

  it('shows a mapped reserve payment as a contribution, not spending', () => {
    const plan = projectIncomeEnvelopePlan({
      currency: 'EUR',
      rules: [{
        id: 'tax',
        bucketId: 'tax',
        bucketName: 'Tax',
        group: 'FUTURE',
        purpose: 'RESERVE',
        type: 'PERCENT_OF_INCOME',
        percentageBasisPoints: 4_000,
        priority: 0,
        categoryNames: ['Tax'],
      }],
      transactions: [
        transaction({ category: 'Income', amount: 10_000 }),
        transaction({ category: 'Tax', amount: -1_000 }),
      ],
    })

    expect(plan).toEqual(expect.objectContaining({
      reservedInPlanMinor: 300_000,
      contributedMinor: 100_000,
      clearedSpendMinor: 0,
    }))
    expect(plan.buckets[0]).toEqual(expect.objectContaining({
      purpose: 'RESERVE',
      fundedMinor: 400_000,
      contributedMinor: 100_000,
      availableMinor: 300_000,
    }))
    expect(budgetCategoriesForIncomeEnvelope(plan)).toEqual([
      expect.objectContaining({
        name: 'Tax',
        group: 'Future',
        spent: 1_000,
      }),
    ])
  })

  it('validates a complete plan before persistence', () => {
    expect(parseIncomeEnvelopePlanInput({
      currency: 'eur',
      buckets: [
        {
          name: 'Food',
          group: 'FLEXIBLE',
          type: 'FIXED',
          fixedAmount: '1000.00',
          priority: 0,
          categoryNames: ['Groceries'],
        },
        {
          name: 'Extra',
          group: 'FLEXIBLE',
          type: 'REMAINDER',
          priority: 1,
          categoryNames: ['Shopping'],
        },
      ],
    })).toEqual(expect.objectContaining({
      currency: 'EUR',
      buckets: [
        expect.objectContaining({ fixedMinor: 100_000 }),
        expect.objectContaining({ type: 'REMAINDER' }),
      ],
    }))

    expect(() => parseIncomeEnvelopePlanInput({
      buckets: [
        {
          name: 'Food',
          group: 'FLEXIBLE',
          type: 'FIXED',
          fixedAmount: '100',
          priority: 0,
          categoryNames: ['Groceries'],
        },
        {
          name: 'Extra',
          group: 'FLEXIBLE',
          type: 'REMAINDER',
          priority: 1,
          categoryNames: ['Groceries'],
        },
      ],
    })).toThrow('only one envelope')
  })

  it('keeps a legacy Tax envelope as a reserve when its old form omits purpose', () => {
    const plan = parseIncomeEnvelopePlanInput({
      buckets: [{
        name: 'Tax',
        group: 'FUTURE',
        type: 'FIXED',
        fixedAmount: '700',
        priority: 0,
        categoryNames: ['Tax'],
      }],
    })

    expect(plan.buckets[0]).toEqual(expect.objectContaining({
      purpose: 'RESERVE',
      fixedMinor: 70_000,
    }))
  })
})
