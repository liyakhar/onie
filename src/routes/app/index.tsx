import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Landmark,
  RefreshCw,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatMoney, type FinanceTransaction } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import { getFinanceDashboard } from '#/server/finance'

const dashboardMeta = buildPageMeta({
  path: '/app',
  title: 'Money dashboard',
  description: 'Your money status in one simple dashboard.',
  noindex: true,
})

export const Route = createFileRoute('/app/')({
  loader: () => getFinanceDashboard(),
  head: () => ({
    meta: dashboardMeta.meta,
    links: dashboardMeta.links,
  }),
  component: MoneyDashboardPage,
})

function MoneyDashboardPage() {
  const { accounts, budgetPlan, month, recurringPayments, summary, syncStatus, transactions } =
    Route.useLoaderData()
  const hasAccounts = accounts.length > 0
  const recentTransactions = transactions.slice(0, 8)
  const reviewTransactions = transactions
    .filter((transaction) => transaction.status === 'needs-review')
    .slice(0, 5)
  const recurringTransactions = transactions
    .filter((transaction) => transaction.recurring && transaction.amount < 0)
    .slice(0, 5)
  const recurringItems = recurringPayments.length > 0
    ? recurringPayments.map((payment) => ({
        id: payment.id,
        merchant: payment.merchant,
        amount: payment.amount,
        meta: `${payment.category} · ${payment.cadence}`,
      }))
    : recurringTransactions.map(toRecurringItem)
  const recurringTotal = recurringItems.reduce((sum, item) => sum + Math.abs(item.amount), 0)
  const categoryTotals = getCategoryTotals(transactions)
  const netThisMonth = summary.monthlyIncome - summary.spent
  const safeToSpend = budgetPlan.groups.length > 0 ? summary.safeToSpend : Math.max(netThisMonth, 0)

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Badge variant="outline" className="rounded-md border-zinc-200 bg-white font-normal text-zinc-700">
              {syncStatus.label}
            </Badge>
            {hasAccounts && (
              <span className="text-xs text-zinc-500">Updated {syncStatus.lastSynced}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">{month}</p>
        </div>
        <Button
          asChild
          variant={hasAccounts ? 'outline' : 'default'}
          className={hasAccounts ? 'border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100' : 'bg-zinc-950 text-white hover:bg-zinc-800'}
        >
          <Link to="/app/accounts">
            {hasAccounts ? 'Manage accounts' : 'Connect account'}
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section className="grid grid-cols-2 overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-4" aria-label="Money summary">
        <Metric label="Cash" value={formatMoney(summary.cash)} />
        <Metric label="Income" value={formatMoney(summary.monthlyIncome)} />
        <Metric label="Spent" value={formatMoney(summary.spent)} />
        <Metric label="Available" value={formatMoney(safeToSpend)} />
      </section>

      {!hasAccounts ? (
        <Card className="min-h-[22rem] justify-center rounded-lg border-zinc-200 bg-white shadow-none">
          <CardContent className="mx-auto grid max-w-md justify-items-center gap-4 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-full border border-zinc-200 text-zinc-950">
              <Landmark className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Connect your first account</h2>
              <p className="mt-1.5 text-sm text-zinc-500">
                Add a bank or credit card to see balances and transactions.
              </p>
            </div>
            <Button asChild className="bg-zinc-950 text-white hover:bg-zinc-800">
              <Link to="/app/accounts">
                Connect account
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]">
            <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle>Cash flow</CardTitle>
                <CardAction>
                  <span className="text-sm font-medium">Net {formatMoney(netThisMonth)}</span>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-5 pt-5 sm:grid-cols-3">
                <BarRow label="Income" value={summary.monthlyIncome} max={Math.max(summary.monthlyIncome, summary.spent, 1)} />
                <BarRow label="Spent" value={summary.spent} max={Math.max(summary.monthlyIncome, summary.spent, 1)} muted />
                <BarRow label="Recurring" value={recurringTotal} max={Math.max(summary.monthlyIncome, summary.spent, 1)} muted />
              </CardContent>
            </Card>

            <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle>Needs review</CardTitle>
                <CardAction>
                  <Badge variant="outline" className="rounded-md border-zinc-200 bg-white">{reviewTransactions.length}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="pt-2">
                {reviewTransactions.length > 0 ? (
                  <MoneyList items={reviewTransactions.map(toMoneyItem)} />
                ) : (
                  <CompactEmpty label="Nothing to review" />
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.55fr)]">
            <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>{transactions.length} total</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                {recentTransactions.length > 0 ? (
                  <MoneyList items={recentTransactions.map(toMoneyItem)} />
                ) : (
                  <CompactEmpty label="No transactions" />
                )}
              </CardContent>
            </Card>

            <div className="grid content-start gap-4">
              <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
                <CardHeader className="border-b border-zinc-200 pb-4">
                  <CardTitle>Accounts</CardTitle>
                  <CardDescription>{accounts.length} connected</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <MoneyList items={accounts.map((account) => ({
                    id: account.id,
                    title: account.name,
                    meta: account.institution,
                    amount: account.balance,
                  }))} />
                </CardContent>
              </Card>

              {(categoryTotals.length > 0 || recurringItems.length > 0) && (
                <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
                  <CardHeader className="border-b border-zinc-200 pb-4">
                    <CardTitle>Spending</CardTitle>
                    <CardAction>
                      <RefreshCw className="size-4 text-zinc-500" aria-hidden="true" />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-5">
                    {categoryTotals.slice(0, 4).map((category) => (
                      <BarRow
                        key={category.name}
                        label={category.name}
                        value={category.amount}
                        max={categoryTotals[0]?.amount || 1}
                        muted
                      />
                    ))}
                    {recurringItems.length > 0 && (
                      <div className="flex items-center justify-between border-t pt-4 text-sm">
                        <span className="text-zinc-500">Recurring</span>
                        <span className="font-medium">{formatMoney(recurringTotal)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-r border-b border-zinc-200 p-4 last:border-r-0 even:border-r-0 lg:border-b-0 lg:even:border-r lg:last:border-r-0 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">{value}</p>
    </div>
  )
}

function BarRow({ label, max, muted = false, value }: { label: string; max: number; muted?: boolean; value: number }) {
  const percent = Math.min(100, Math.round((Math.abs(value) / Math.max(max, 1)) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium tabular-nums">{formatMoney(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={muted ? 'h-full rounded-full bg-zinc-400' : 'h-full rounded-full bg-zinc-950'} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function MoneyList({ items }: { items: Array<{ id: string; title: string; meta: string; amount: number; status?: FinanceTransaction['status'] }> }) {
  return (
    <ul className="divide-y">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-4 py-3 first:pt-2 last:pb-1">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{item.meta}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {item.status === 'needs-review' && <span className="size-1.5 rounded-full bg-zinc-950" aria-label="Needs review" />}
            <p className="text-sm font-medium tabular-nums">{formatMoney(item.amount)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CompactEmpty({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-zinc-500">{label}</p>
}

function getCategoryTotals(transactions: FinanceTransaction[]) {
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0) continue
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + Math.abs(transaction.amount))
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
}

function toMoneyItem(transaction: FinanceTransaction) {
  return {
    id: transaction.id,
    title: transaction.merchant,
    meta: `${transaction.date} · ${transaction.account} · ${transaction.category}`,
    amount: transaction.amount,
    status: transaction.status,
  }
}

function toRecurringItem(transaction: FinanceTransaction) {
  return {
    id: transaction.id,
    merchant: transaction.merchant,
    amount: Math.abs(transaction.amount),
    meta: `${transaction.category} · ${transaction.date}`,
  }
}
