import {
  BUDGET_BUCKET_GROUPS,
  BUDGET_BUCKET_PURPOSES,
  INCOME_ALLOCATION_RULE_TYPES,
  MAX_MONEY_MINOR,
  buildIncomeEnvelopeProjection,
  type BudgetBucketGroup,
  type BudgetBucketPurpose,
  type IncomeAllocationRule,
  type IncomeAllocationRuleType,
  type IncomeEnvelopePlan,
} from '#/lib/income-allocation-engine'
import {
  FINANCE_CATEGORIES,
  filterTransactionsForMonth,
  isTransferTransaction,
  type BudgetCategory,
  type FinanceTransaction,
} from '#/lib/finance-demo'
import { getDb } from '#/server/db-access.server'

const MAPPABLE_SYSTEM_CATEGORIES = FINANCE_CATEGORIES.filter(
  (category) => category !== 'Income' && category !== 'Transfer',
)

const MAX_ENVELOPES = 20
const MAX_CATEGORY_MAPPINGS_PER_ENVELOPE = 12

export type IncomeEnvelopePlanFormInput = {
  currency?: string
  buckets: Array<{
    name: string
    group: BudgetBucketGroup
    purpose?: BudgetBucketPurpose
    type: IncomeAllocationRuleType
    fixedAmount?: number | string
    percentage?: number | string
    priority: number
    categoryNames: string[]
  }>
}

export type NormalizedIncomeEnvelopePlan = {
  currency?: string
  buckets: Array<IncomeAllocationRule & { categoryNames: string[] }>
}

export async function loadIncomeEnvelopePlan(options: {
  workspaceId: string
  transactions: FinanceTransaction[]
}): Promise<IncomeEnvelopePlan> {
  const prisma = await getDb()
  const workspace = await prisma.budgetWorkspace.findUniqueOrThrow({
    where: { id: options.workspaceId },
    include: {
      categories: { select: { name: true }, orderBy: { name: 'asc' } },
      budgetBuckets: {
        include: {
          allocationRule: true,
          categoryMappings: { include: { category: { select: { name: true } } } },
        },
      },
    },
  })

  const categoryOptions = categoryOptionsFor(workspace.categories.map((category) => category.name))
  const rules = workspace.budgetBuckets.flatMap((bucket) => {
    if (!bucket.allocationRule) return []
    return [{
      id: bucket.allocationRule.id,
      bucketId: bucket.id,
      bucketName: bucket.name,
      group: bucket.group,
      purpose: bucket.purpose,
      type: bucket.allocationRule.type,
      fixedMinor: bucket.allocationRule.fixedMinor,
      percentageBasisPoints: bucket.allocationRule.percentageBasisPoints,
      priority: bucket.allocationRule.priority,
      categoryNames: bucket.categoryMappings.map((mapping) => mapping.category.name),
    } satisfies IncomeAllocationRule & { categoryNames: string[] }]
  })

  return projectIncomeEnvelopePlan({
    currency: workspace.currency,
    transactions: options.transactions,
    rules,
    categoryOptions,
  })
}

export function projectIncomeEnvelopePlan(options: {
  currency: string
  transactions: FinanceTransaction[]
  rules: Array<IncomeAllocationRule & { categoryNames: string[] }>
  categoryOptions?: string[]
}): IncomeEnvelopePlan {
  const currency = normalizeCurrency(options.currency)
  const categoryToBucket = new Map<string, string>()
  const categoryNamesByBucket = new Map<string, string[]>()
  const extraRule = options.rules.find((rule) => rule.type === 'REMAINDER' && rule.purpose === 'SPENDING')
  for (const rule of options.rules) {
    const categoryNames = [...new Set(rule.categoryNames)]
    categoryNamesByBucket.set(rule.bucketId, categoryNames)
    for (const categoryName of categoryNames) {
      categoryToBucket.set(normalizeCategoryName(categoryName), rule.bucketId)
    }
  }

  const currentTransactions = currentMonthTransactions(options.transactions)
  const spendingByBucket: Record<string, { clearedMinor: number; pendingMinor: number }> = {}
  let incomeMinor = 0
  let excludedIncomeMinor = 0
  let unassignedSpendMinor = 0
  let excludedSpendMinor = 0

  for (const transaction of currentTransactions) {
    const amountMinor = Math.round(transaction.amount * 100)
    const isTransfer = isTransferTransaction(transaction)
    const matchesCurrency = normalizeCurrency(transaction.currency || currency) === currency

    if (
      amountMinor > 0
      && transaction.status === 'cleared'
      && transaction.category === 'Income'
      && !isTransfer
    ) {
      if (matchesCurrency) incomeMinor += amountMinor
      else excludedIncomeMinor += amountMinor
      continue
    }

    if (amountMinor >= 0 || isTransfer) continue
    const spendMinor = Math.abs(amountMinor)
    if (!matchesCurrency) {
      excludedSpendMinor += spendMinor
      continue
    }

    const mappedBucketId = categoryToBucket.get(normalizeCategoryName(transaction.category))
    if (!mappedBucketId) {
      unassignedSpendMinor += spendMinor
    }
    const bucketId = mappedBucketId ?? extraRule?.bucketId
    if (!bucketId) continue

    const spending = spendingByBucket[bucketId] ?? { clearedMinor: 0, pendingMinor: 0 }
    if (transaction.status === 'pending') spending.pendingMinor += spendMinor
    else spending.clearedMinor += spendMinor
    spendingByBucket[bucketId] = spending
  }

  if (options.rules.length === 0) {
    return {
      enabled: false,
      currency,
      incomeMinor,
      excludedIncomeMinor,
      unallocatedMinor: incomeMinor,
      shortfallMinor: 0,
      unassignedSpendMinor,
      excludedSpendMinor,
      clearedSpendMinor: 0,
      pendingSpendMinor: 0,
      flexibleAvailableMinor: 0,
      reservedInPlanMinor: 0,
      contributedMinor: 0,
      pendingContributionMinor: 0,
      categoryOptions: options.categoryOptions ?? categoryOptionsFor([]),
      buckets: [],
    }
  }

  const projection = buildIncomeEnvelopeProjection({
    incomeMinor,
    rules: options.rules,
    spendingByBucket,
  })

  return {
    enabled: true,
    currency,
    incomeMinor: projection.incomeMinor,
    excludedIncomeMinor,
    unallocatedMinor: projection.unallocatedMinor,
    shortfallMinor: projection.shortfallMinor,
    unassignedSpendMinor,
    excludedSpendMinor,
    clearedSpendMinor: projection.clearedSpendMinor,
    pendingSpendMinor: projection.pendingSpendMinor,
    // Purchases without a category mapping still reduce the amount safe for everyday
    // spending. When the plan has an Extra envelope, they are recorded there; plans
    // without one still receive the same truthful total.
    flexibleAvailableMinor: projection.flexibleAvailableMinor - (extraRule?.group === 'FLEXIBLE' ? 0 : unassignedSpendMinor),
    reservedInPlanMinor: projection.reservedInPlanMinor,
    contributedMinor: projection.contributedMinor,
    pendingContributionMinor: projection.pendingContributionMinor,
    categoryOptions: options.categoryOptions ?? categoryOptionsFor([]),
    buckets: projection.buckets.map((bucket) => {
      const rule = options.rules.find((candidate) => candidate.bucketId === bucket.id)!
      return {
        ...bucket,
        categoryNames: categoryNamesByBucket.get(bucket.id) ?? [],
        fixedMinor: rule.fixedMinor ?? undefined,
        percentageBasisPoints: rule.percentageBasisPoints ?? undefined,
      }
    }),
  }
}

export function parseIncomeEnvelopePlanInput(data: unknown): NormalizedIncomeEnvelopePlan {
  if (!isRecord(data) || !Array.isArray(data.buckets)) {
    throw new Error('Add at least one envelope.')
  }
  if (data.buckets.length === 0 || data.buckets.length > MAX_ENVELOPES) {
    throw new Error(`Use between 1 and ${MAX_ENVELOPES} envelopes.`)
  }

  const currency = data.currency == null || String(data.currency).trim() === ''
    ? undefined
    : normalizeCurrency(String(data.currency))
  const categoryNames = new Set<string>()
  const names = new Set<string>()
  const buckets = data.buckets.map((rawBucket, index) => {
    if (!isRecord(rawBucket)) throw new Error('Each envelope must be complete.')
    const name = String(rawBucket.name ?? '').trim().replace(/\s+/g, ' ')
    if (!name || name.length > 48) throw new Error('Envelope names must be between 1 and 48 characters.')
    const normalizedName = normalizeCategoryName(name)
    if (names.has(normalizedName)) throw new Error('Envelope names must be unique.')
    names.add(normalizedName)

    const group = String(rawBucket.group ?? '') as BudgetBucketGroup
    if (!(BUDGET_BUCKET_GROUPS as readonly string[]).includes(group)) {
      throw new Error('Choose a valid envelope group.')
    }
    const purpose = String(rawBucket.purpose ?? legacyPurposeForBucket(group, name)) as BudgetBucketPurpose
    if (!(BUDGET_BUCKET_PURPOSES as readonly string[]).includes(purpose)) {
      throw new Error('Choose a valid envelope purpose.')
    }
    const type = String(rawBucket.type ?? '') as IncomeAllocationRuleType
    if (!(INCOME_ALLOCATION_RULE_TYPES as readonly string[]).includes(type)) {
      throw new Error('Choose a valid funding rule.')
    }
    const priority = Number(rawBucket.priority)
    if (!Number.isInteger(priority) || priority < 0 || priority >= MAX_ENVELOPES) {
      throw new Error('Envelope priorities must be valid whole numbers.')
    }

    const rawCategoryNames = Array.isArray(rawBucket.categoryNames) ? rawBucket.categoryNames : []
    if (rawCategoryNames.length > MAX_CATEGORY_MAPPINGS_PER_ENVELOPE) {
      throw new Error(`Use at most ${MAX_CATEGORY_MAPPINGS_PER_ENVELOPE} categories per envelope.`)
    }
    const mappedCategoryNames = rawCategoryNames.map((value) => String(value).trim()).filter(Boolean)
    const localNames = new Set<string>()
    for (const categoryName of mappedCategoryNames) {
      if (categoryName.length > 48) {
        throw new Error('Transaction category names must be 48 characters or fewer.')
      }
      const normalizedCategory = normalizeCategoryName(categoryName)
      if (localNames.has(normalizedCategory) || categoryNames.has(normalizedCategory)) {
        throw new Error('A transaction category can map to only one envelope.')
      }
      localNames.add(normalizedCategory)
      categoryNames.add(normalizedCategory)
    }

    const rule: IncomeAllocationRule & { categoryNames: string[] } = {
      id: `input-${index}`,
      bucketId: `input-${index}`,
      bucketName: name,
      group,
      purpose,
      type,
      priority,
      categoryNames: mappedCategoryNames,
    }
    if (type === 'FIXED') rule.fixedMinor = moneyToMinor(rawBucket.fixedAmount, name)
    if (type === 'PERCENT_OF_INCOME') {
      rule.percentageBasisPoints = percentageToBasisPoints(rawBucket.percentage, name)
    }
    return rule
  })

  // The shared engine validates type-specific values, unique priorities, and remainder ordering.
  buildIncomeEnvelopeProjection({ incomeMinor: 0, rules: buckets })
  return { currency, buckets }
}

export async function saveIncomeEnvelopePlan(options: {
  workspaceId: string
  role: 'OWNER' | 'MEMBER'
  plan: NormalizedIncomeEnvelopePlan
}) {
  const prisma = await getDb()
  return prisma.$transaction(async (tx) => {
    const workspace = await tx.budgetWorkspace.findUniqueOrThrow({
      where: { id: options.workspaceId },
      include: { categories: { select: { id: true, name: true } } },
    })
    const currency = options.plan.currency ?? workspace.currency
    if (currency !== workspace.currency && options.role !== 'OWNER') {
      throw new Error('Only the household owner can change the plan currency.')
    }

    const knownCategories = new Map(
      workspace.categories.map((category) => [normalizeCategoryName(category.name), category]),
    )
    const categoryIds = new Map<string, string>()
    for (const bucket of options.plan.buckets) {
      for (const categoryName of bucket.categoryNames) {
        const normalizedName = normalizeCategoryName(categoryName)
        if (normalizedName === 'income' || normalizedName === 'transfer') {
          throw new Error('Income and Transfer cannot be mapped to an envelope.')
        }
        const existing = knownCategories.get(normalizedName)
        if (existing) {
          categoryIds.set(normalizedName, existing.id)
          continue
        }
        const systemCategory = MAPPABLE_SYSTEM_CATEGORIES.find(
          (value) => normalizeCategoryName(value) === normalizedName,
        )
        const category = await tx.transactionCategory.upsert({
          where: { workspaceId_name: { workspaceId: workspace.id, name: categoryName } },
          create: {
            workspaceId: workspace.id,
            name: categoryName,
            system: Boolean(systemCategory),
          },
          update: {},
          select: { id: true, name: true },
        })
        knownCategories.set(normalizedName, category)
        categoryIds.set(normalizedName, category.id)
      }
    }

    await tx.budgetBucket.deleteMany({ where: { workspaceId: workspace.id } })
    for (const bucket of options.plan.buckets) {
      await tx.budgetBucket.create({
        data: {
          workspaceId: workspace.id,
          name: bucket.bucketName,
          group: bucket.group,
          purpose: bucket.purpose,
          categoryMappings: {
            create: bucket.categoryNames.map((name) => ({
              categoryId: categoryIds.get(normalizeCategoryName(name))!,
            })),
          },
          allocationRule: {
            create: {
              workspaceId: workspace.id,
              type: bucket.type,
              fixedMinor: bucket.fixedMinor ?? null,
              percentageBasisPoints: bucket.percentageBasisPoints ?? null,
              priority: bucket.priority,
            },
          },
        },
      })
    }

    if (currency !== workspace.currency) {
      await tx.budgetWorkspace.update({ where: { id: workspace.id }, data: { currency } })
    }

    return { saved: true, currency }
  })
}

export function categoryOptionsFor(existingCategoryNames: string[]) {
  return Array.from(new Set([
    ...MAPPABLE_SYSTEM_CATEGORIES,
    ...existingCategoryNames.filter((name) => name !== 'Income' && name !== 'Transfer'),
  ])).sort((left, right) => left.localeCompare(right))
}

export function budgetCategoriesForIncomeEnvelope(plan: IncomeEnvelopePlan): BudgetCategory[] {
  return plan.buckets.map((bucket) => ({
    name: bucket.name,
    group: bucket.purpose === 'SPENDING'
      ? bucket.group === 'FIXED' ? 'Fixed' : 'Flexible'
      : 'Future',
    categoryNames: bucket.categoryNames,
    allocated: bucket.fundedMinor / 100,
    spent: (bucket.purpose === 'SPENDING' ? bucket.spentMinor : bucket.contributedMinor) / 100,
  }))
}

function currentMonthTransactions(transactions: FinanceTransaction[]) {
  const inMonth = filterTransactionsForMonth(transactions)
  const byId = new Map(inMonth.map((transaction) => [transaction.id, transaction]))
  for (const transaction of transactions) {
    if (transaction.status === 'pending') byId.set(transaction.id, transaction)
  }
  return [...byId.values()]
}

function moneyToMinor(value: unknown, name: string) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`Enter a fixed amount for ${name}.`)
  }
  const number = Number(value)
  const minor = Math.round(number * 100)
  if (
    !Number.isFinite(number)
    || number < 0
    || Math.abs(number * 100 - minor) > 0.000_001
    || minor > MAX_MONEY_MINOR
  ) {
    throw new Error(`Enter a valid fixed amount for ${name}.`)
  }
  return minor
}

function percentageToBasisPoints(value: unknown, name: string) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    throw new Error(`Enter a percentage for ${name}.`)
  }
  const number = Number(value)
  const basisPoints = Math.round(number * 100)
  if (
    !Number.isFinite(number)
    || Math.abs(number * 100 - basisPoints) > 0.000_001
    || basisPoints < 1
    || basisPoints > 10_000
  ) {
    throw new Error(`Enter a percentage between 0.01 and 100 for ${name}.`)
  }
  return basisPoints
}

function normalizeCurrency(value: string) {
  const currency = value.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Choose a valid three-letter currency.')
  return currency
}

function normalizeCategoryName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

function legacyPurposeForBucket(group: BudgetBucketGroup, name: string): BudgetBucketPurpose {
  if (group !== 'FUTURE') return 'SPENDING'
  return ['tax', 'taxes', 'vat', 'income tax'].includes(normalizeCategoryName(name))
    ? 'RESERVE'
    : 'GOAL'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
