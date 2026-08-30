export type BillingMode = 'early_access' | 'freemium'
export type WolliePlanId = 'free' | 'household'

export type PlanLimits = {
  householdMembers: number
  bankConnections: number | null
  budgetEnvelopes: number | null
  backupRestore: boolean
}

export const WOLLIE_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'The essentials for planning money together.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    limits: {
      householdMembers: 2,
      bankConnections: 2,
      budgetEnvelopes: 12,
      backupRestore: false,
    },
  },
  household: {
    id: 'household',
    name: 'Household',
    description: 'Unlimited planning for one household.',
    monthlyPrice: 7.99,
    yearlyPrice: 59,
    limits: {
      householdMembers: 2,
      bankConnections: null,
      budgetEnvelopes: null,
      backupRestore: true,
    },
  },
} as const satisfies Record<WolliePlanId, {
  id: WolliePlanId
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  limits: PlanLimits
}>

export function getBillingMode(
  env: { WOLLIE_BILLING_MODE?: string } = process.env,
): BillingMode {
  return env.WOLLIE_BILLING_MODE === 'freemium' ? 'freemium' : 'early_access'
}

export function planLimits(plan: WolliePlanId): PlanLimits {
  return WOLLIE_PLANS[plan].limits
}

export function assertWithinPlanLimit(
  actual: number,
  limit: number | null,
  label: string,
) {
  if (limit !== null && actual > limit) {
    throw new Error(`The Free plan includes up to ${limit} ${label}. Your existing data is safe; reduce this number or upgrade.`)
  }
}
