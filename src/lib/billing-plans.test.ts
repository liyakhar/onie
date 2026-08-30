import { describe, expect, it } from 'vitest'
import {
  assertWithinPlanLimit,
  getBillingMode,
  planLimits,
} from './billing-plans'

describe('Wollie plans', () => {
  it('defaults safely to free early access', () => {
    expect(getBillingMode({})).toBe('early_access')
    expect(getBillingMode({ WOLLIE_BILLING_MODE: 'unexpected' })).toBe('early_access')
    expect(getBillingMode({ WOLLIE_BILLING_MODE: 'freemium' })).toBe('freemium')
  })

  it('keeps future Free limits separate from Household access', () => {
    expect(planLimits('free')).toEqual(expect.objectContaining({
      householdMembers: 2,
      bankConnections: 2,
      budgetEnvelopes: 12,
      backupRestore: false,
    }))
    expect(planLimits('household')).toEqual(expect.objectContaining({
      householdMembers: 2,
      bankConnections: null,
      budgetEnvelopes: null,
      backupRestore: true,
    }))
  })

  it('blocks only new writes above a finite plan limit', () => {
    expect(() => assertWithinPlanLimit(12, 12, 'envelopes')).not.toThrow()
    expect(() => assertWithinPlanLimit(100, null, 'envelopes')).not.toThrow()
    expect(() => assertWithinPlanLimit(13, 12, 'envelopes')).toThrow(/existing data is safe/i)
  })
})
