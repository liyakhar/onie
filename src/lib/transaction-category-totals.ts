import { isTransferTransaction, type FinanceTransaction } from '#/lib/finance-demo'
import type { IncomeEnvelopePlan } from '#/lib/income-allocation-engine'

type EnvelopeBucket = IncomeEnvelopePlan['buckets'][number]

export type TransactionCategoryTotal = {
  category: string
  totals: Array<{
    amount: number
    currency: string
  }>
  bucket?: Pick<EnvelopeBucket, 'availableMinor' | 'purpose'>
}

export function buildTransactionCategoryTotals(
  transactions: FinanceTransaction[],
  envelopePlan?: IncomeEnvelopePlan,
): TransactionCategoryTotal[] {
  const bucketByCategory = new Map<string, Pick<EnvelopeBucket, 'availableMinor' | 'purpose'>>()
  for (const bucket of envelopePlan?.buckets ?? []) {
    for (const category of bucket.categoryNames) {
      bucketByCategory.set(normalizeCategory(category), {
        availableMinor: bucket.availableMinor,
        purpose: bucket.purpose,
      })
    }
  }

  const totalsByCategory = new Map<string, {
    category: string
    totalsByCurrency: Map<string, number>
  }>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0 || transaction.category === 'Income' || isTransferTransaction(transaction)) continue

    const category = transaction.category.trim() || 'Uncategorised'
    const key = normalizeCategory(category)
    const total = totalsByCategory.get(key) ?? {
      category,
      totalsByCurrency: new Map<string, number>(),
    }
    const currency = (transaction.currency || envelopePlan?.currency || 'USD').trim().toUpperCase()

    total.totalsByCurrency.set(currency, (total.totalsByCurrency.get(currency) ?? 0) + Math.abs(transaction.amount))
    totalsByCategory.set(key, total)
  }

  return Array.from(totalsByCategory.entries())
    .map(([key, total]) => ({
      category: total.category,
      totals: Array.from(total.totalsByCurrency.entries())
        .map(([currency, amount]) => ({ currency, amount }))
        .sort((left, right) => left.currency.localeCompare(right.currency)),
      bucket: bucketByCategory.get(key),
    }))
    .sort((left, right) => left.category.localeCompare(right.category))
}

function normalizeCategory(value: string) {
  return value.trim().toLocaleLowerCase()
}
