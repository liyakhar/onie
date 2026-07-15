import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
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
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  filterTransactionsForMonth,
  formatMoney,
  getFinanceSummary,
  type FinanceTransaction,
  type RecurringPayment,
} from '#/lib/finance-demo'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
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
  const { accounts, budget, month, recurringPayments, rules, syncStatus, transactions } =
    Route.useLoaderData()
  const hasAccounts = accounts.length > 0
  const currencies = Array.from(new Set(accounts.map((account) => account.currency || 'USD')))
  const [currency, setCurrency] = useState(currencies[0] || 'USD')
  const visibleAccounts = accounts.filter((account) => (account.currency || 'USD') === currency)
  const visibleTransactions = transactions.filter(
    (transaction) => (transaction.currency || 'USD') === currency,
  )
  const visibleRecurringPayments = recurringPayments.filter(
    (payment) => (payment.currency || currency) === currency,
  )
  const summary = getFinanceSummary({
    accounts: visibleAccounts,
    transactions: visibleTransactions,
    budget,
    recurringPayments: visibleRecurringPayments,
    rules,
  })
  const recentTransactions = visibleTransactions.slice(0, 8)
  const reviewTransactions = visibleTransactions
    .filter((transaction) => transaction.status === 'needs-review')
    .slice(0, 5)
  const detectedBills = visibleRecurringPayments.filter((payment) => payment.confirmed === false)
  const upcomingBills = visibleRecurringPayments.filter((payment) => isWithinNextDays(payment.nextDate, 30))
  const pendingTransactions = visibleTransactions.filter((transaction) => transaction.status === 'pending')
  const recurringTotal = summary.upcomingRecurring
  const netThisMonth = summary.monthlyIncome - summary.spent - recurringTotal
  const safeToSpend = summary.safeToSpend
  const hasPlan = budget.some((item) => item.allocated > 0)
  const connectedInstitution = visibleAccounts[0]?.institution || 'your bank'
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const daysRemaining = Math.max(daysInMonth - today.getDate() + 1, 1)
  const dailyAllowance = Math.max(safeToSpend, 0) / daysRemaining
  const spendingLimit = hasPlan
    ? Math.max(summary.budgetPlan.allocated, summary.spent, 1)
    : Math.max(summary.monthlyIncome, summary.spent, 1)
  const priorityCategories = summary.budgetPlan.groups
    .flatMap((group) => group.categories)
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, 4)
  const attentionCount = reviewTransactions.length + detectedBills.length
  const showAttention = attentionCount > 0 || (syncStatus.mode !== 'live-connected' && syncStatus.mode !== 'demo')
  const showUpcomingBills = upcomingBills.length > 0

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {month}{hasAccounts ? ` · Updated ${syncStatus.lastSynced}` : ''}
          </p>
        </div>
        {currencies.length > 1 && (
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-4 w-24 border-zinc-200 bg-white" aria-label="Dashboard currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-zinc-200 bg-white">
              {currencies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </header>

      {hasAccounts && !hasPlan && (
        <section className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-5 sm:grid-cols-[1fr_auto] sm:items-center" aria-labelledby="setup-heading">
          <div>
            <h2 id="setup-heading" className="text-base font-semibold tracking-tight">Finish setting up Wollie</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              Set a monthly plan to turn your {connectedInstitution} balance into a safe-to-spend number.
            </p>
            <p className="mt-2 text-xs text-zinc-400">{visibleAccounts.length} account{visibleAccounts.length === 1 ? '' : 's'} · {visibleTransactions.length} transactions imported</p>
          </div>
          <Button asChild className="wollie-primary-action sm:justify-self-end">
            <Link to="/app/budgets">
              Set monthly plan
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      )}

      {hasAccounts && (hasPlan ? (
        <section className="grid overflow-hidden rounded-lg border border-zinc-200 bg-white lg:grid-cols-[minmax(19rem,0.82fr)_minmax(0,1.18fr)]" aria-label="Available to spend and monthly spending pace">
          <div className="flex min-h-64 flex-col justify-between p-5 sm:p-7">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Available to spend</p>
              <h2 id="available-heading" className="mt-3 text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none tracking-[-0.045em] tabular-nums">
                {formatMoney(safeToSpend, currency)}
              </h2>
              {safeToSpend > 0 && <p className="mt-3 text-sm font-medium text-[var(--color-wollie-accent-deep)]">{formatMoney(dailyAllowance, currency)} a day for {daysRemaining} days</p>}
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-4">
              <SmallStat label="Cash" value={formatMoney(summary.liquidCash, currency)} />
              <SmallStat label="Bills" value={formatMoney(-summary.upcomingRecurring, currency)} />
              <SmallStat label="Card debt" value={formatMoney(-summary.creditCardDebt, currency)} />
            </dl>
          </div>
          <div className="border-t border-zinc-200 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Spending pace</p><h3 className="mt-2 text-lg font-semibold tracking-tight">This month</h3></div>
              <p className="text-right text-sm text-zinc-500"><span className="block font-medium text-zinc-950">{formatMoney(summary.spent, currency)}</span>of {formatMoney(spendingLimit, currency)}</p>
            </div>
            <SpendingPaceChart currency={currency} limit={spendingLimit} spent={summary.spent} transactions={filterTransactionsForMonth(visibleTransactions)} />
          </div>
        </section>
      ) : (
        <section className="grid overflow-hidden rounded-lg border border-zinc-200 bg-white sm:grid-cols-3" aria-label="Money this month">
          <SummaryStat label="Balance" value={formatMoney(summary.liquidCash, currency)} />
          <SummaryStat label="Spent this month" value={formatMoney(-summary.spent, currency)} />
          <SummaryStat label="Income this month" value={formatMoney(summary.monthlyIncome, currency)} />
        </section>
      ))}

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
            <Button asChild className="wollie-primary-action">
              <Link to="/app/accounts">
                Connect account
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {(showAttention || showUpcomingBills) && (
            <section className={`grid gap-4 ${showAttention && showUpcomingBills ? 'lg:grid-cols-2' : ''}`}>
              {showAttention && (
                <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
                  <CardHeader className="border-b border-zinc-200 pb-4">
                    <CardTitle>Needs attention</CardTitle>
                    {attentionCount > 0 && <CardAction><span className="text-sm text-zinc-500">{attentionCount}</span></CardAction>}
                  </CardHeader>
                  <CardContent className="divide-y divide-zinc-200 pt-2">
                    {syncStatus.mode !== 'live-connected' && syncStatus.mode !== 'demo' && <ActionRow icon={AlertTriangle} title={syncStatus.label} detail={syncStatus.description} to="/app/accounts" action="Fix sync" />}
                    {reviewTransactions.length > 0 && <ActionRow icon={AlertTriangle} title={`${reviewTransactions.length} transaction${reviewTransactions.length === 1 ? '' : 's'} need review`} detail="Confirm categories before trusting the monthly plan." to="/app/transactions" action="Review" />}
                    {detectedBills.length > 0 && <ActionRow icon={RefreshCw} title={`${detectedBills.length} possible recurring bill${detectedBills.length === 1 ? '' : 's'}`} detail="Confirm or dismiss charges Wollie detected from history." to="/app/recurring" action="Check" />}
                  </CardContent>
                </Card>
              )}
              {showUpcomingBills && (
                <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
                  <CardHeader className="border-b border-zinc-200 pb-4">
                    <CardTitle>Next 30 days</CardTitle>
                    <CardAction><Link to="/app/recurring" className="text-sm font-medium underline-offset-4 hover:underline focus-visible:underline">Manage bills</Link></CardAction>
                  </CardHeader>
                  <CardContent className="pt-2"><BillTimeline items={upcomingBills} currency={currency} /></CardContent>
                </Card>
              )}
            </section>
          )}

          {hasPlan && <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]">
            <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle>Cash flow</CardTitle>
                <CardAction>
                  <span className="text-sm font-medium">Net {formatMoney(netThisMonth, currency)}</span>
                </CardAction>
              </CardHeader>
              <CardContent className="pt-5"><CashFlowBridge income={summary.monthlyIncome} spent={summary.spent} reserved={recurringTotal} currency={currency} /></CardContent>
            </Card>

            <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
              <CardHeader className="border-b border-zinc-200 pb-4">
                <CardTitle>Budget progress</CardTitle>
                <CardAction>
                  <Link to="/app/budgets" className="text-sm font-medium underline-offset-4 hover:underline focus-visible:underline">Edit plan</Link>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-4 pt-5">
                {priorityCategories.length > 0 ? priorityCategories.map((category) => (
                  <BarRow
                    key={category.name}
                    label={`${category.name} · ${category.percentUsed}%`}
                    value={category.spent}
                    max={Math.max(category.allocated, category.spent, 1)}
                    currency={currency}
                    muted={category.state === 'good'}
                  />
                )) : (
                  <div className="grid gap-3 py-5 text-center">
                    <p className="text-sm text-zinc-500">Set category limits to see what is close to running out.</p>
                    <Button asChild variant="outline" className="mx-auto border-zinc-200 bg-white text-zinc-950">
                      <Link to="/app/budgets">Build your plan</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>}

          <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
            <CardHeader className="border-b border-zinc-200 pb-4">
              <CardTitle>Recent transactions</CardTitle>
              <CardAction><Link to="/app/transactions" className="text-sm font-medium underline-offset-4 hover:underline focus-visible:underline">View all</Link></CardAction>
            </CardHeader>
            <CardContent className="pt-2">
              {recentTransactions.length > 0 ? <MoneyList items={recentTransactions.map(toMoneyItem)} currency={currency} /> : <CompactEmpty label="No transactions" />}
            </CardContent>
          </Card>
          {pendingTransactions.length > 0 && <p className="text-xs leading-5 text-zinc-500">{pendingTransactions.length} pending transaction{pendingTransactions.length === 1 ? '' : 's'} may still change. Connected-bank balances determine the available amount, so Wollie does not subtract them a second time.</p>}
        </>
      )}
    </main>
  )
}

function ActionRow({ action, detail, icon: Icon, title, to }: {
  action: string
  detail: string
  icon: LucideIcon
  title: string
  to: '/app/accounts' | '/app/transactions' | '/app/recurring'
}) {
  return (
    <div className="flex items-start gap-3 py-4 first:pt-2 last:pb-1">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-zinc-100"><Icon className="size-4" aria-hidden="true" /></span>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-zinc-500">{detail}</p>
      </div>
      <Link to={to} className="min-h-11 shrink-0 self-center py-3 text-sm font-medium underline-offset-4 hover:underline focus-visible:underline">{action}</Link>
    </div>
  )
}

function BillTimeline({ currency, items }: { currency: string; items: RecurringPayment[] }) {
  const sorted = [...items].sort((a, b) => parseRecurringDate(a.nextDate).getTime() - parseRecurringDate(b.nextDate).getTime())
  return (
    <ol className="divide-y divide-zinc-200">
      {sorted.map((item) => (
        <li key={item.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-3 first:pt-2 last:pb-1">
          <time dateTime={item.nextDate} className="grid size-11 place-items-center rounded-md bg-zinc-100 text-center text-[0.68rem] font-medium uppercase leading-tight text-zinc-600">
            {formatBillDate(item.nextDate)}
          </time>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.merchant}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{item.confirmed === false ? 'Needs confirmation' : `${item.cadence} · confirmed`}</p>
          </div>
          <span className="text-sm font-medium tabular-nums">{formatMoney(-item.amount, currency)}</span>
        </li>
      ))}
    </ol>
  )
}

function CashFlowBridge({ currency, income, reserved, spent }: { currency: string; income: number; reserved: number; spent: number }) {
  const remaining = income - spent - reserved
  const max = Math.max(income, 1)
  const segments = [
    { label: 'Spent', value: spent, className: 'bg-zinc-950' },
    { label: 'Bills', value: reserved, className: 'bg-zinc-400' },
    { label: 'Left', value: Math.max(remaining, 0), className: 'bg-[var(--color-wollie-accent)]' },
  ]
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-zinc-100" aria-label={`Income ${formatMoney(income, currency)}: spent ${formatMoney(spent, currency)}, bills ${formatMoney(reserved, currency)}, left ${formatMoney(remaining, currency)}`}>
        {segments.map((segment) => <span key={segment.label} className={segment.className} style={{ width: `${Math.max(0, Math.min(100, segment.value / max * 100))}%` }} />)}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FlowStat label="Income" value={formatMoney(income, currency)} />
        <FlowStat label="Spent" value={formatMoney(-spent, currency)} />
        <FlowStat label="Bills" value={formatMoney(-reserved, currency)} />
        <FlowStat label="Net" value={formatMoney(remaining, currency)} emphasis />
      </dl>
    </div>
  )
}

function FlowStat({ emphasis = false, label, value }: { emphasis?: boolean; label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-[0.1em] text-zinc-500">{label}</dt><dd className={`mt-1 text-sm font-medium tabular-nums ${emphasis ? 'text-[var(--color-wollie-accent-deep)]' : ''}`}>{value}</dd></div>
}

function SpendingPaceChart({
  currency,
  limit,
  spent,
  transactions,
}: {
  currency: string
  limit: number
  spent: number
  transactions: FinanceTransaction[]
}) {
  const now = new Date()
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const totals = new Map<number, number>()

  for (const transaction of transactions) {
    if (transaction.amount >= 0 || transaction.category === 'Transfer' || transaction.recurring) continue
    const date = parseTransactionDate(transaction.date)
    if (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) continue
    totals.set(date.getDate(), (totals.get(date.getDate()) ?? 0) + Math.abs(transaction.amount))
  }

  let cumulative = 0
  const points = [{ day: 1, value: 0 }]
  for (const [day, value] of Array.from(totals.entries()).sort((a, b) => a[0] - b[0])) {
    cumulative += value
    points.push({ day, value: cumulative })
  }
  const currentDay = Math.max(Math.min(now.getDate(), days), points.at(-1)?.day ?? 1)
  if (points.at(-1)?.day !== currentDay) points.push({ day: currentDay, value: cumulative })

  const maxValue = Math.max(limit, cumulative, 1) * 1.08
  const chartPoints = points
    .map((point) => `${((point.day - 1) / Math.max(days - 1, 1)) * 100},${40 - (point.value / maxValue) * 34}`)
    .join(' ')
  const currentX = ((currentDay - 1) / Math.max(days - 1, 1)) * 100
  const currentY = 40 - (cumulative / maxValue) * 34

  return (
    <div className="mt-6">
      <svg viewBox="0 0 100 44" className="h-36 w-full overflow-visible" role="img" aria-labelledby="spending-pace-title spending-pace-description" preserveAspectRatio="none">
        <title id="spending-pace-title">Monthly spending pace</title>
        <desc id="spending-pace-description">You have spent {formatMoney(spent, currency)} against {formatMoney(limit, currency)} this month.</desc>
        {[8, 24, 40].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e4e4e7" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />)}
        <line x1="0" y1="40" x2="100" y2="6" stroke="var(--color-wollie-accent)" strokeWidth="1.25" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />
        <polyline points={chartPoints} fill="none" stroke="#09090b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <line x1={currentX} x2={currentX} y1="4" y2="40" stroke="#a1a1aa" strokeWidth="0.45" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        <circle cx={currentX} cy={currentY} r="1.4" fill="#09090b" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <span>Day 1</span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><i aria-hidden="true" className="h-0.5 w-4 bg-zinc-950" />Actual</span>
          <span className="flex items-center gap-1.5"><i aria-hidden="true" className="h-0.5 w-4 bg-[var(--color-wollie-accent)]" />Ideal pace</span>
        </span>
        <span>Day {days}</span>
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-b border-zinc-200 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl">{value}</p>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[0.68rem] font-medium uppercase tracking-[0.1em] text-zinc-500">{label}</dt><dd className="mt-1 truncate text-sm font-medium tabular-nums">{value}</dd></div>
}

function BarRow({
  label,
  max,
  muted = false,
  value,
  currency,
}: {
  label: string
  max: number
  muted?: boolean
  value: number
  currency: string
}) {
  const percent = Math.min(100, Math.round((Math.abs(value) / Math.max(max, 1)) * 100))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-zinc-500">{label}</span>
        <span className="font-medium tabular-nums">{formatMoney(value, currency)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={muted ? 'h-full rounded-full bg-zinc-400' : 'h-full rounded-full bg-zinc-950'} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function MoneyList({
  items,
  currency,
}: {
  items: Array<{ id: string; title: string; meta: string; amount: number; status?: FinanceTransaction['status'] }>
  currency: string
}) {
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
            {item.status === 'pending' && <Badge variant="outline" className="rounded-md px-1.5 py-0 text-[0.65rem] font-normal">Pending</Badge>}
            <p className="text-sm font-medium tabular-nums">{formatMoney(item.amount, currency)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function CompactEmpty({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-zinc-500">{label}</p>
}

function toMoneyItem(transaction: FinanceTransaction) {
  return {
    id: transaction.id,
    title: readableMerchant(transaction.merchant),
    meta: `${formatTransactionDate(transaction.date)} · ${transaction.account} · ${transaction.category}`,
    amount: transaction.amount,
    status: transaction.status,
  }
}

function readableMerchant(value: string) {
  const issuedBy = value.match(/\bissued by\s+(.+)$/i)
  const name = (issuedBy?.[1] || value).replace(/^CARD-\d+\s*[·-]\s*/i, '').trim()
  return name.replace(/\b([\p{L}'-]+)\s+\1$/iu, '$1').trim() || 'Unknown transaction'
}

function formatTransactionDate(value: string) {
  if (value === 'Pending') return value
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

function parseTransactionDate(value: string) {
  const date = new Date(/\d{4}/.test(value) ? value : `${value}, ${new Date().getFullYear()}`)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function parseRecurringDate(value: string) {
  const hasYear = /\d{4}/.test(value)
  const date = new Date(hasYear ? `${value}T12:00:00` : `${value}, ${new Date().getFullYear()}`)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function isWithinNextDays(value: string, days: number) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  const date = parseRecurringDate(value)
  return date >= start && date <= end
}

function formatBillDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parseRecurringDate(value))
}
