export const MAX_MONEY_MINOR = 2_147_483_647

export const BUDGET_BUCKET_GROUPS = ['FIXED', 'FLEXIBLE', 'FUTURE'] as const
export const BUDGET_BUCKET_PURPOSES = ['SPENDING', 'RESERVE', 'GOAL'] as const
export const INCOME_ALLOCATION_RULE_TYPES = [
  'FIXED',
  'PERCENT_OF_INCOME',
  'REMAINDER',
] as const

export type BudgetBucketGroup = (typeof BUDGET_BUCKET_GROUPS)[number]
export type BudgetBucketPurpose = (typeof BUDGET_BUCKET_PURPOSES)[number]
export type IncomeAllocationRuleType = (typeof INCOME_ALLOCATION_RULE_TYPES)[number]

export type IncomeAllocationRule = {
  id: string
  bucketId: string
  bucketName: string
  group: BudgetBucketGroup
  purpose: BudgetBucketPurpose
  type: IncomeAllocationRuleType
  fixedMinor?: number | null
  percentageBasisPoints?: number | null
  priority: number
}

export type BucketSpending = {
  clearedMinor?: number
  pendingMinor?: number
}

export type IncomeEnvelopeBucket = {
  id: string
  name: string
  group: BudgetBucketGroup
  purpose: BudgetBucketPurpose
  type: IncomeAllocationRuleType
  priority: number
  requestedMinor: number
  fundedMinor: number
  shortfallMinor: number
  percentFunded: number
  clearedSpendMinor: number
  pendingSpendMinor: number
  spentMinor: number
  contributedMinor: number
  pendingContributionMinor: number
  availableMinor: number
  percentUsed: number
  state: 'good' | 'watch' | 'over'
}

export type IncomeEnvelopeProjection = {
  incomeMinor: number
  requestedMinor: number
  allocatedMinor: number
  unallocatedMinor: number
  shortfallMinor: number
  clearedSpendMinor: number
  pendingSpendMinor: number
  flexibleAvailableMinor: number
  reservedInPlanMinor: number
  contributedMinor: number
  pendingContributionMinor: number
  buckets: IncomeEnvelopeBucket[]
}

export type IncomeEnvelopePlan = {
  enabled: boolean
  currency: string
  incomeMinor: number
  excludedIncomeMinor: number
  unallocatedMinor: number
  shortfallMinor: number
  unassignedSpendMinor: number
  excludedSpendMinor: number
  clearedSpendMinor: number
  pendingSpendMinor: number
  flexibleAvailableMinor: number
  reservedInPlanMinor: number
  contributedMinor: number
  pendingContributionMinor: number
  categoryOptions: string[]
  buckets: Array<IncomeEnvelopeBucket & {
    categoryNames: string[]
    fixedMinor?: number
    percentageBasisPoints?: number
  }>
}

export function validateIncomeAllocationRules(rules: IncomeAllocationRule[]) {
  const ids = new Set<string>()
  const bucketIds = new Set<string>()
  const names = new Set<string>()
  const priorities = new Set<number>()
  const remainderRules: IncomeAllocationRule[] = []

  for (const rule of rules) {
    if (!rule.id.trim() || !rule.bucketId.trim() || !rule.bucketName.trim()) {
      throw new Error('Every envelope needs an id, name, and bucket.')
    }
    if (ids.has(rule.id)) throw new Error('Each rule may appear only once.')
    if (bucketIds.has(rule.bucketId)) throw new Error('Each bucket may have only one rule.')

    const normalizedName = rule.bucketName.trim().toLocaleLowerCase()
    if (names.has(normalizedName)) throw new Error('Envelope names must be unique.')
    if (!isBucketGroup(rule.group)) throw new Error('Choose a valid envelope group.')
    if (!isBucketPurpose(rule.purpose)) throw new Error('Choose a valid envelope purpose.')
    if (!isRuleType(rule.type)) throw new Error('Choose a valid allocation rule.')
    if (!Number.isInteger(rule.priority) || rule.priority < 0) {
      throw new Error('Envelope positions must be whole positive numbers.')
    }
    if (priorities.has(rule.priority)) throw new Error('Each envelope needs a unique position.')

    ids.add(rule.id)
    bucketIds.add(rule.bucketId)
    names.add(normalizedName)
    priorities.add(rule.priority)

    if (rule.type === 'FIXED') {
      assertMinorAmount(rule.fixedMinor, 'Fixed amounts')
      if (rule.percentageBasisPoints != null) {
        throw new Error('Fixed rules cannot also have a percentage.')
      }
    }

    if (rule.type === 'PERCENT_OF_INCOME') {
      if (
        !Number.isInteger(rule.percentageBasisPoints)
        || rule.percentageBasisPoints == null
        || rule.percentageBasisPoints < 1
        || rule.percentageBasisPoints > 10_000
      ) {
        throw new Error('Percentage rules must be between 1 and 100%.')
      }
      if (rule.fixedMinor != null) {
        throw new Error('Percentage rules cannot also have a fixed amount.')
      }
    }

    if (rule.type === 'REMAINDER') {
      if (rule.fixedMinor != null || rule.percentageBasisPoints != null) {
        throw new Error('Remainder rules cannot have an amount or percentage.')
      }
      remainderRules.push(rule)
    }

    if (rule.purpose === 'SPENDING' && rule.group === 'FUTURE') {
      throw new Error('Savings and reserve envelopes need a savings or reserve purpose.')
    }
    if (rule.purpose !== 'SPENDING' && rule.group !== 'FUTURE') {
      throw new Error('Savings and reserve envelopes belong in Savings & future.')
    }
    if (rule.type === 'REMAINDER' && rule.purpose !== 'SPENDING') {
      throw new Error('Only a spending envelope can use everything left.')
    }
  }

  if (remainderRules.length > 1) throw new Error('Use at most one remainder rule.')
  if (remainderRules.length === 1) {
    const remainder = remainderRules[0]!
    const lastPriority = Math.max(...rules.map((rule) => rule.priority))
    if (remainder.priority !== lastPriority) throw new Error('The remainder rule must be last.')
  }
}

export function buildIncomeEnvelopeProjection(options: {
  incomeMinor: number
  rules: IncomeAllocationRule[]
  spendingByBucket?: Record<string, BucketSpending | undefined>
}): IncomeEnvelopeProjection {
  validateIncomeAllocationRules(options.rules)

  const incomeMinor = nonNegativeMinor(options.incomeMinor, 'Income')
  const rules = [...options.rules].sort((left, right) => left.priority - right.priority)
  const targetRequests = new Map(
    rules
      .filter((rule) => rule.type !== 'REMAINDER')
      .map((rule) => [rule.bucketId, requestedForRule(rule, incomeMinor)]),
  )
  const requestedTargetsMinor = [...targetRequests.values()].reduce((sum, requested) => sum + requested, 0)
  const fundedTargets = distributeProportionally(targetRequests, Math.min(incomeMinor, requestedTargetsMinor))
  const remainingMinor = incomeMinor - [...fundedTargets.values()].reduce((sum, funded) => sum + funded, 0)
  const remainderRule = rules.find((rule) => rule.type === 'REMAINDER')
  let requestedMinor = 0
  let shortfallMinor = 0
  let clearedSpendMinor = 0
  let pendingSpendMinor = 0
  let reservedInPlanMinor = 0
  let contributedMinor = 0
  let pendingContributionMinor = 0
  const buckets = rules
    .map((rule) => {
      const requested = rule.type === 'REMAINDER'
        ? remainderRule === rule ? remainingMinor : 0
        : targetRequests.get(rule.bucketId)!
      const funded = rule.type === 'REMAINDER'
        ? remainderRule === rule ? remainingMinor : 0
        : fundedTargets.get(rule.bucketId)!
      const shortfall = requested - funded

      const spending = options.spendingByBucket?.[rule.bucketId]
      const cleared = nonNegativeMinor(spending?.clearedMinor ?? 0, 'Cleared spending')
      const pending = nonNegativeMinor(spending?.pendingMinor ?? 0, 'Pending spending')
      const activity = cleared + pending
      const isSpending = rule.purpose === 'SPENDING'
      const clearedSpend = isSpending ? cleared : 0
      const pendingSpend = isSpending ? pending : 0
      const spent = isSpending ? activity : 0
      const available = funded - activity
      const percentFunded = requested === 0
        ? (funded > 0 ? 100 : 0)
        : Math.min(100, Math.round((funded / requested) * 100))
      const percentUsed = !isSpending
        ? 0
        : funded === 0
          ? (activity > 0 ? 100 : 0)
          : Math.round((activity / funded) * 100)
      const contributed = isSpending ? 0 : cleared
      const pendingContribution = isSpending ? 0 : pending

      requestedMinor += requested
      shortfallMinor += shortfall
      clearedSpendMinor += clearedSpend
      pendingSpendMinor += pendingSpend
      if (!isSpending) {
        reservedInPlanMinor += Math.max(available, 0)
        contributedMinor += contributed
        pendingContributionMinor += pendingContribution
      }

      return {
        id: rule.bucketId,
        name: rule.bucketName.trim(),
        group: rule.group,
        purpose: rule.purpose,
        type: rule.type,
        priority: rule.priority,
        requestedMinor: requested,
        fundedMinor: funded,
        shortfallMinor: shortfall,
        percentFunded,
        clearedSpendMinor: clearedSpend,
        pendingSpendMinor: pendingSpend,
        spentMinor: spent,
        contributedMinor: contributed,
        pendingContributionMinor: pendingContribution,
        availableMinor: available,
        percentUsed,
        state: bucketState({ purpose: rule.purpose, available, percentUsed }),
      } satisfies IncomeEnvelopeBucket
    })

  return {
    incomeMinor,
    requestedMinor,
    allocatedMinor: incomeMinor - (remainderRule ? 0 : remainingMinor),
    unallocatedMinor: remainderRule ? 0 : remainingMinor,
    shortfallMinor,
    clearedSpendMinor,
    pendingSpendMinor,
    flexibleAvailableMinor: buckets
      .filter((bucket) => bucket.group === 'FLEXIBLE' && bucket.purpose === 'SPENDING')
      .reduce((sum, bucket) => sum + bucket.availableMinor, 0),
    reservedInPlanMinor,
    contributedMinor,
    pendingContributionMinor,
    buckets,
  }
}

function requestedForRule(rule: IncomeAllocationRule, incomeMinor: number) {
  if (rule.type === 'FIXED') return rule.fixedMinor!
  if (rule.type === 'PERCENT_OF_INCOME') {
    return Math.round((incomeMinor * rule.percentageBasisPoints!) / 10_000)
  }
  return 0
}

function distributeProportionally(requests: Map<string, number>, availableMinor: number) {
  const requestedMinor = [...requests.values()].reduce((sum, requested) => sum + requested, 0)
  if (requestedMinor === 0 || availableMinor === 0) {
    return new Map([...requests.keys()].map((bucketId) => [bucketId, 0]))
  }
  if (availableMinor >= requestedMinor) return new Map(requests)

  const total = BigInt(requestedMinor)
  const available = BigInt(availableMinor)
  const allocations = [...requests.entries()].map(([bucketId, requested], index) => {
    const scaled = BigInt(requested) * available
    return {
      bucketId,
      funded: Number(scaled / total),
      remainder: scaled % total,
      index,
    }
  })
  let centsLeft = availableMinor - allocations.reduce((sum, allocation) => sum + allocation.funded, 0)
  allocations
    .sort((left, right) => left.remainder === right.remainder ? left.index - right.index : left.remainder > right.remainder ? -1 : 1)
    .forEach((allocation) => {
      if (centsLeft <= 0) return
      allocation.funded += 1
      centsLeft -= 1
    })

  return new Map(allocations.map((allocation) => [allocation.bucketId, allocation.funded]))
}

function bucketState(options: { purpose: BudgetBucketPurpose; available: number; percentUsed: number }) {
  if (options.purpose !== 'SPENDING') return 'good' as const
  if (options.available < 0) return 'over' as const
  if (options.percentUsed >= 85) return 'watch' as const
  return 'good' as const
}

function assertMinorAmount(value: number | null | undefined, label: string) {
  if (!Number.isInteger(value) || value == null || value < 0 || value > MAX_MONEY_MINOR) {
    throw new Error(`${label} must be whole minor units within the supported range.`)
  }
}

function nonNegativeMinor(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0 || value > MAX_MONEY_MINOR) {
    throw new Error(`${label} must be a non-negative minor-unit amount.`)
  }
  return value
}

function isBucketGroup(value: string): value is BudgetBucketGroup {
  return (BUDGET_BUCKET_GROUPS as readonly string[]).includes(value)
}

function isBucketPurpose(value: string): value is BudgetBucketPurpose {
  return (BUDGET_BUCKET_PURPOSES as readonly string[]).includes(value)
}

function isRuleType(value: string): value is IncomeAllocationRuleType {
  return (INCOME_ALLOCATION_RULE_TYPES as readonly string[]).includes(value)
}
