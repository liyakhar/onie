import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { BudgetMeter } from '#/components/finance/BudgetMeter'
import { FinanceCard } from '#/components/finance/FinanceCard'
import { formatMoney, getDemoFinanceDashboard } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'

const dashboardMeta = buildPageMeta({
  path: '/app',
  title: 'Money dashboard',
  description: 'Your bank-sync budget dashboard.',
  noindex: true,
})

export const Route = createFileRoute('/app/')({
  loader: () => getDemoFinanceDashboard(),
  head: () => ({
    meta: dashboardMeta.meta,
    links: dashboardMeta.links,
  }),
  component: MoneyDashboardPage,
})

function MoneyDashboardPage() {
  const { budgetPlan, insights, month, recurringPayments, summary, syncStatus, transactions } =
    Route.useLoaderData()
  const recentTransactions = transactions.slice(0, 5)

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">{syncStatus.label}</p>
        <h1 className="app-page__title">{month}.</h1>
      </header>

      <section className="finance-grid finance-grid--summary" aria-label="Money summary">
        <FinanceCard
          eyebrow="Can spend"
          title="Left"
          value={formatMoney(summary.safeToSpend)}
          note="Flexible money this month"
        />
        <FinanceCard
          eyebrow="Cash"
          title="Now"
          value={formatMoney(summary.cash)}
        />
        <FinanceCard
          eyebrow="Review"
          title="Items"
          value={String(summary.reviewCount)}
        />
      </section>

      <section className="finance-layout">
        <div className="finance-panel">
          <div className="finance-panel__head">
            <div>
          <p>Budget</p>
              <h2>Plan</h2>
            </div>
            <Link to="/app/budgets">Open <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="finance-stack">
            {budgetPlan.groups.map((group) => (
              <section key={group.name} className="budget-group-card">
                <div className="budget-group-card__head">
                  <strong>{group.name}</strong>
                  <span>{formatMoney(group.available)} left</span>
                </div>
                <div className="finance-stack">
                  {group.categories.slice(0, 3).map((category) => (
                    <BudgetMeter key={category.name} category={category} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <p>Activity</p>
              <h2>Recent</h2>
            </div>
            <Link to="/app/transactions">Open <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="transaction-list">
            {recentTransactions.map((transaction) => (
              <li key={transaction.id}>
                <div>
                  <strong>{transaction.merchant}</strong>
                  <span>{transaction.date} · {transaction.category}</span>
                </div>
                <em className={transaction.amount > 0 ? 'is-positive' : undefined}>
                  {formatMoney(transaction.amount)}
                </em>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="finance-layout finance-layout--secondary">
        <div className="finance-panel">
          <div className="finance-panel__head">
            <div>
              <p>Bills</p>
              <h2>Upcoming</h2>
            </div>
            <Link to="/app/recurring">Open <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="transaction-list">
            {recurringPayments.map((payment) => (
              <li key={payment.id}>
                <div>
                  <strong>{payment.merchant}</strong>
                  <span>{payment.nextDate} · {payment.cadence}</span>
                </div>
                <em>{formatMoney(-payment.amount)}</em>
              </li>
            ))}
          </ul>
        </div>

        <div className="finance-panel finance-panel--accent">
          <div className="finance-panel__head">
            <div>
              <p>Insights</p>
              <h2>Notes</h2>
            </div>
            <Link to="/app/insights">Open <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ul className="finance-insight-list">
            {insights.map((insight) => (
              <li key={insight.id}>
                <strong>{insight.title}</strong>
                <span>{insight.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
