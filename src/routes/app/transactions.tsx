import { createFileRoute, useRouter } from '@tanstack/react-router'
import { type FormEvent, useMemo, useState } from 'react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import {
  filterFinanceTransactions,
  formatMoney,
  type FinanceTransaction,
  type TransactionCategoryName,
} from '#/lib/finance-demo'
import {
  addDevFinanceTransaction,
  createFinanceTransactionCategory,
  getFinanceTransactions,
  updateFinanceTransactionCategory,
} from '#/server/finance'

export const Route = createFileRoute('/app/transactions')({
  loader: () => getFinanceTransactions({ data: { status: 'all', category: 'all' } }),
  component: TransactionsPage,
})

function TransactionsPage() {
  const { canAddManual, categoryOptions, transactions } = Route.useLoaderData()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FinanceTransaction['status'] | 'all'>('all')
  const [category, setCategory] = useState<TransactionCategoryName | 'all'>('all')
  const [month, setMonth] = useState('all')
  const [manualMerchant, setManualMerchant] = useState('')
  const [manualAmount, setManualAmount] = useState('')
  const [manualCategory, setManualCategory] = useState<TransactionCategoryName>('Groceries')
  const [manualDate, setManualDate] = useState(toDateInput(new Date()))
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showCategoryCreator, setShowCategoryCreator] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryNotice, setCategoryNotice] = useState('')
  const allCategoryOptions = Array.from(new Set([
    'Income',
    'Transfer',
    ...categoryOptions,
    ...transactions.map((transaction) => transaction.category),
  ]))
  const months = useMemo(() => Array.from(new Set(transactions.map((transaction) => transactionMonth(transaction.date)).filter(Boolean))), [transactions])
  const filtered = useMemo(() => filterFinanceTransactions(transactions, { q: query, status, category }).filter((transaction) => month === 'all' || transactionMonth(transaction.date) === month), [category, month, query, status, transactions])

  async function updateCategory(transaction: FinanceTransaction, next: TransactionCategoryName) {
    setSaving(transaction.id)
    setError('')
    try {
      await updateFinanceTransactionCategory({ data: { transactionId: transaction.id, category: next } })
      await router.invalidate()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update transaction.')
    } finally {
      setSaving(null)
    }
  }

  async function addManualTransaction() {
    setSaving('manual')
    setError('')
    try {
      await addDevFinanceTransaction({
        data: {
          merchant: manualMerchant,
          amount: Number(manualAmount),
          category: manualCategory,
          date: manualDate,
        },
      })
      setManualMerchant('')
      setManualAmount('')
      await router.invalidate()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add manual spending.')
    } finally {
      setSaving(null)
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('category')
    setError('')
    setCategoryNotice('')
    try {
      const result = await createFinanceTransactionCategory({ data: { name: newCategoryName } })
      setNewCategoryName('')
      setShowCategoryCreator(false)
      await router.invalidate()
      setCategoryNotice(result.created
        ? `${result.category} is ready to use. Map it in Money plan to include it in your budget.`
        : `${result.category} is already available.`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add category.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-zinc-500">Search, verify, and categorize every transaction.</p>
        </div>
        <Button type="button" variant="outline" disabled={saving === 'category'} onClick={() => {
          setShowCategoryCreator((visible) => !visible)
          setNewCategoryName('')
          setError('')
          setCategoryNotice('')
        }}>
          {showCategoryCreator ? 'Cancel' : 'Add category'}
        </Button>
      </header>

      {showCategoryCreator && (
        <section aria-labelledby="new-category-heading" className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={(event) => void createCategory(event)}>
            <label className="grid flex-1 gap-1 text-xs text-zinc-500">
              <span id="new-category-heading">New category</span>
              <Input autoFocus value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} placeholder="e.g. Pets" className="min-h-11 border-zinc-200 bg-white text-sm text-zinc-950" />
            </label>
            <Button className="wollie-primary-action min-h-11" disabled={saving === 'category'} type="submit">
              {saving === 'category' ? 'Adding…' : 'Add category'}
            </Button>
          </form>
        </section>
      )}

      {categoryNotice && <p role="status" className="text-sm font-medium text-[var(--color-wollie-accent-deep)]">{categoryNotice}</p>}

      {canAddManual && (
        <section aria-labelledby="manual-spending-heading" className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="manual-spending-heading" className="font-semibold">Add manual spending</h2>
              <p className="mt-1 text-sm text-zinc-500">Dev-only sample transaction for testing plans and overview.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_8rem_11rem_10rem_auto] lg:items-end">
            <label className="grid gap-1 text-xs text-zinc-500">
              Merchant
              <Input value={manualMerchant} onChange={(event) => setManualMerchant(event.target.value)} placeholder="LLC Lia" className="min-h-11 border-zinc-200 bg-white text-sm text-zinc-950" />
            </label>
            <label className="grid gap-1 text-xs text-zinc-500">
              Amount
              <Input inputMode="decimal" value={manualAmount} onChange={(event) => setManualAmount(event.target.value)} placeholder="24.50" className="min-h-11 border-zinc-200 bg-white text-sm text-zinc-950" />
            </label>
            <label className="grid gap-1 text-xs text-zinc-500">
              Category
                <Select value={manualCategory} onValueChange={(value) => setManualCategory(value as TransactionCategoryName)}>
                  <SelectTrigger className="min-h-11 border-zinc-200 bg-white text-zinc-950"><SelectValue /></SelectTrigger>
                <SelectContent>{categoryOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="grid gap-1 text-xs text-zinc-500">
              Date
              <Input type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} className="min-h-11 border-zinc-200 bg-white text-sm text-zinc-950" />
            </label>
            <Button className="wollie-primary-action min-h-11" disabled={saving === 'manual'} onClick={() => void addManualTransaction()}>
              {saving === 'manual' ? 'Adding...' : 'Add spending'}
            </Button>
          </div>
        </section>
      )}

      <section aria-label="Transaction filters" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_11rem_11rem_11rem]">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search merchant or account…" aria-label="Search transactions" className="min-h-11 border-zinc-200 bg-white" />
        <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
          <SelectTrigger className="min-h-11 border-zinc-200 bg-white" aria-label="Transaction status"><SelectValue /></SelectTrigger>
          <SelectContent>{['all', 'needs-review', 'pending', 'cleared'].map((item) => <SelectItem key={item} value={item}>{labelStatus(item)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
          <SelectTrigger className="min-h-11 border-zinc-200 bg-white" aria-label="Transaction category"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All categories</SelectItem>{allCategoryOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="min-h-11 border-zinc-200 bg-white" aria-label="Transaction month"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All months</SelectItem>{months.map((item) => <SelectItem key={item} value={item}>{formatMonth(item)}</SelectItem>)}</SelectContent>
        </Select>
      </section>

      <section aria-labelledby="transactions-heading" className="overflow-hidden rounded-lg border border-zinc-200">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5">
          <h2 id="transactions-heading" className="font-semibold">Transactions</h2>
          <span className="text-sm text-zinc-500">{filtered.length}</span>
        </div>
        {filtered.length > 0 ? (
          <ul className="divide-y divide-zinc-200">
            {filtered.map((transaction) => {
              return <li key={transaction.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-center sm:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><p className="truncate text-sm font-medium">{readableMerchant(transaction.merchant)}</p>{transaction.status !== 'cleared' && <Badge variant="outline" className="rounded-md font-normal">{labelStatus(transaction.status)}</Badge>}</div>
                  <p className="mt-1 truncate text-xs text-zinc-500">{formatDate(transaction.date)} · {transaction.account}</p>
                </div>
                <Select value={transaction.category} disabled={saving === transaction.id} onValueChange={(value) => void updateCategory(transaction, value as TransactionCategoryName)}>
                  <SelectTrigger className="min-h-11 border-zinc-200 bg-white" aria-label={`Category for ${transaction.merchant}`}><SelectValue /></SelectTrigger>
                  <SelectContent>{allCategoryOptions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-right text-sm font-medium tabular-nums">{formatMoney(transaction.amount, transaction.currency || 'USD')}</p>
              </li>
            })}
          </ul>
        ) : <p className="px-5 py-16 text-center text-sm text-zinc-500">No matching transactions.</p>}
      </section>
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
    </main>
  )
}

function labelStatus(value: string) {
  if (value === 'all') return 'All statuses'
  if (value === 'needs-review') return 'Needs review'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function readableMerchant(value: string) {
  const issuedBy = value.match(/\bissued by\s+(.+)$/i)
  const name = (issuedBy?.[1] || value).replace(/^CARD-\d+\s*[·-]\s*/i, '').trim()
  return name.replace(/\b([\p{L}'-]+)\s+\1$/iu, '$1').trim() || 'Unknown transaction'
}

function formatDate(value: string) {
  const date = new Date(/\d{4}/.test(value) ? value : `${value}, ${new Date().getFullYear()}`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function transactionMonth(value: string) {
  const date = new Date(/\d{4}/.test(value) ? value : `${value}, ${new Date().getFullYear()}`)
  return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatMonth(value: string) {
  const [year, month] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year!, month! - 1, 1))
}

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
