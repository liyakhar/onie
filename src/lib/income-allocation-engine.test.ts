import { describe, expect, it } from 'vitest'
import {
  buildIncomeEnvelopeProjection,
  validateIncomeAllocationRules,
  type IncomeAllocationRule,
} from './income-allocation-engine'

const householdRules: IncomeAllocationRule[] = [
  {
    id: 'pension',
    bucketId: 'pension',
    bucketName: 'Pension',
    group: 'FUTURE',
    purpose: 'GOAL',
    type: 'FIXED',
    fixedMinor: 500_000,
    priority: 0,
  },
  {
    id: 'savings',
    bucketId: 'savings',
    bucketName: 'Savings',
    group: 'FUTURE',
    purpose: 'GOAL',
    type: 'FIXED',
    fixedMinor: 500_000,
    priority: 1,
  },
  {
    id: 'tax',
    bucketId: 'tax',
    bucketName: 'Tax',
    group: 'FUTURE',
    purpose: 'RESERVE',
    type: 'FIXED',
    fixedMinor: 700_000,
    priority: 2,
  },
  {
    id: 'rent',
    bucketId: 'rent',
    bucketName: 'Rent',
    group: 'FIXED',
    purpose: 'SPENDING',
    type: 'FIXED',
    fixedMinor: 30_000,
    priority: 3,
  },
  {
    id: 'food',
    bucketId: 'food',
    bucketName: 'Food',
    group: 'FLEXIBLE',
    purpose: 'SPENDING',
    type: 'FIXED',
    fixedMinor: 100_000,
    priority: 4,
  },
  {
    id: 'travel',
    bucketId: 'travel',
    bucketName: 'Travel',
    group: 'FLEXIBLE',
    purpose: 'SPENDING',
    type: 'FIXED',
    fixedMinor: 100_000,
    priority: 5,
  },
  {
    id: 'extra',
    bucketId: 'extra',
    bucketName: 'Extra',
    group: 'FLEXIBLE',
    purpose: 'SPENDING',
    type: 'REMAINDER',
    priority: 6,
  },
]

describe('income allocation engine', () => {
  it('funds the household template to its targets and sends the rest to Extra', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 2_000_000,
      rules: householdRules,
      spendingByBucket: {
        food: { clearedMinor: 80_000, pendingMinor: 20_000 },
      },
    })

    expect(projection.incomeMinor).toBe(2_000_000)
    expect(projection.allocatedMinor).toBe(2_000_000)
    expect(projection.unallocatedMinor).toBe(0)
    expect(projection.buckets.map((bucket) => [bucket.name, bucket.fundedMinor])).toEqual([
      ['Pension', 500_000],
      ['Savings', 500_000],
      ['Tax', 700_000],
      ['Rent', 30_000],
      ['Food', 100_000],
      ['Travel', 100_000],
      ['Extra', 70_000],
    ])
    expect(projection.buckets.find((bucket) => bucket.id === 'food')).toEqual(
      expect.objectContaining({
        clearedSpendMinor: 80_000,
        pendingSpendMinor: 20_000,
        availableMinor: 0,
      }),
    )
  })

  it('rounds percentage rules in minor units and gives the exact remainder to Extra', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 1_001,
      rules: [
        {
          id: 'savings',
          bucketId: 'savings',
          bucketName: 'Savings',
          group: 'FUTURE',
          purpose: 'GOAL',
          type: 'PERCENT_OF_INCOME',
          percentageBasisPoints: 1_000,
          priority: 0,
        },
        {
          id: 'extra',
          bucketId: 'extra',
          bucketName: 'Extra',
          group: 'FLEXIBLE',
          purpose: 'SPENDING',
          type: 'REMAINDER',
          priority: 1,
        },
      ],
    })

    expect(projection.buckets.map((bucket) => bucket.fundedMinor)).toEqual([100, 901])
  })

  it('shares insufficient income proportionally across all targets', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 100_000,
      rules: [
        {
          id: 'first',
          bucketId: 'first',
          bucketName: 'First',
          group: 'FIXED',
          purpose: 'SPENDING',
          type: 'FIXED',
          fixedMinor: 80_000,
          priority: 0,
        },
        {
          id: 'second',
          bucketId: 'second',
          bucketName: 'Second',
          group: 'FIXED',
          purpose: 'SPENDING',
          type: 'FIXED',
          fixedMinor: 50_000,
          priority: 1,
        },
        {
          id: 'extra',
          bucketId: 'extra',
          bucketName: 'Extra',
          group: 'FLEXIBLE',
          purpose: 'SPENDING',
          type: 'REMAINDER',
          priority: 2,
        },
      ],
    })

    expect(projection.buckets.map((bucket) => ({
      name: bucket.name,
      requestedMinor: bucket.requestedMinor,
      fundedMinor: bucket.fundedMinor,
      shortfallMinor: bucket.shortfallMinor,
    }))).toEqual([
      { name: 'First', requestedMinor: 80_000, fundedMinor: 61_538, shortfallMinor: 18_462 },
      { name: 'Second', requestedMinor: 50_000, fundedMinor: 38_462, shortfallMinor: 11_538 },
      { name: 'Extra', requestedMinor: 0, fundedMinor: 0, shortfallMinor: 0 },
    ])
  })

  it('keeps partial funding neutral while a spending envelope still has money left', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 45_000,
      rules: [{
        id: 'food',
        bucketId: 'food',
        bucketName: 'Food',
        group: 'FLEXIBLE',
        purpose: 'SPENDING',
        type: 'FIXED',
        fixedMinor: 100_000,
        priority: 0,
      }],
      spendingByBucket: { food: { clearedMinor: 10_000 } },
    })

    expect(projection.buckets[0]).toEqual(expect.objectContaining({
      fundedMinor: 45_000,
      shortfallMinor: 55_000,
      percentFunded: 45,
      availableMinor: 35_000,
      state: 'good',
    }))
  })

  it('keeps reserve funding and real contributions as separate amounts', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 1_000_000,
      rules: [{
        id: 'tax',
        bucketId: 'tax',
        bucketName: 'Tax',
        group: 'FUTURE',
        purpose: 'RESERVE',
        type: 'PERCENT_OF_INCOME',
        percentageBasisPoints: 4_000,
        priority: 0,
      }],
      spendingByBucket: { tax: { clearedMinor: 100_000 } },
    })

    expect(projection.buckets[0]).toEqual(expect.objectContaining({
      fundedMinor: 400_000,
      contributedMinor: 100_000,
      availableMinor: 300_000,
      state: 'good',
    }))
    expect(projection).toEqual(expect.objectContaining({
      clearedSpendMinor: 0,
      reservedInPlanMinor: 300_000,
      contributedMinor: 100_000,
    }))
  })

  it('does not treat a contribution above a future target as overspending', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 100_000,
      rules: [{
        id: 'pension',
        bucketId: 'pension',
        bucketName: 'Pension',
        group: 'FUTURE',
        purpose: 'GOAL',
        type: 'FIXED',
        fixedMinor: 50_000,
        priority: 0,
      }],
      spendingByBucket: { pension: { clearedMinor: 75_000 } },
    })

    expect(projection.buckets[0]).toEqual(expect.objectContaining({
      clearedSpendMinor: 0,
      spentMinor: 0,
      contributedMinor: 75_000,
      availableMinor: -25_000,
      state: 'good',
    }))
    expect(projection).toEqual(expect.objectContaining({
      clearedSpendMinor: 0,
      contributedMinor: 75_000,
    }))
  })

  it('keeps every cent assigned when splitting a €10,000 income payment across the household targets', () => {
    const projection = buildIncomeEnvelopeProjection({
      incomeMinor: 1_000_000,
      rules: householdRules,
    })

    expect(projection.buckets.map((bucket) => [bucket.name, bucket.fundedMinor])).toEqual([
      ['Pension', 259_067],
      ['Savings', 259_067],
      ['Tax', 362_694],
      ['Rent', 15_544],
      ['Food', 51_814],
      ['Travel', 51_814],
      ['Extra', 0],
    ])
    expect(projection.buckets.reduce((sum, bucket) => sum + bucket.fundedMinor, 0)).toBe(1_000_000)
  })

  it('rejects ambiguous or invalid rules before money can be allocated', () => {
    expect(() => validateIncomeAllocationRules([
      ...householdRules,
      {
        id: 'second-extra',
        bucketId: 'second-extra',
        bucketName: 'Second Extra',
        group: 'FLEXIBLE',
        purpose: 'SPENDING',
        type: 'REMAINDER',
        priority: 7,
      },
    ])).toThrow('one remainder')

    expect(() => validateIncomeAllocationRules([
      {
        id: 'out-of-order-extra',
        bucketId: 'out-of-order-extra',
        bucketName: 'Extra',
        group: 'FLEXIBLE',
        purpose: 'SPENDING',
        type: 'REMAINDER',
        priority: 0,
      },
      {
        id: 'after',
        bucketId: 'after',
        bucketName: 'After',
        group: 'FIXED',
        purpose: 'SPENDING',
        type: 'FIXED',
        fixedMinor: 100,
        priority: 1,
      },
    ])).toThrow('last')

    expect(() => validateIncomeAllocationRules([
      {
        id: 'invalid-percent',
        bucketId: 'invalid-percent',
        bucketName: 'Invalid',
        group: 'FUTURE',
        purpose: 'GOAL',
        type: 'PERCENT_OF_INCOME',
        percentageBasisPoints: 10_001,
        priority: 0,
      },
    ])).toThrow('between 1 and 100%')
  })
})
