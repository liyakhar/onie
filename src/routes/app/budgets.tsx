import { createFileRoute } from '@tanstack/react-router'
import { BudgetMeter } from '#/components/finance/BudgetMeter'
import { formatMoney, getDemoFinanceDashboard } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'

export const Route = createFileRoute('/app/budgets')({
  loader: () => {
    const dashboard = getDemoFinanceDashboard()
    return {
      month: dashboard.month,
      budget: dashboard.budget,
      budgetPlan: dashboard.budgetPlan,
      summary: dashboard.summary,
    }
  },
  head: () => ({
    meta: buildPageMeta({
      path: '/app/budgets',
      title: 'Budgets',
      description: 'Plan monthly spending.',
      noindex: true,
    }).meta,
  }),
  component: BudgetsPage,
})

function BudgetsPage() {
  const { budgetPlan, month, summary } = Route.useLoaderData()

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">Monthly plan</p>
        <h1 className="app-page__title">Budget.</h1>
      </header>

      <section className="finance-grid finance-grid--summary">
        <div className="finance-card">
          <p className="finance-card__eyebrow">Planned</p>
          <h2>{month}</h2>
          <p className="finance-card__value">{formatMoney(budgetPlan.allocated)}</p>
        </div>
        <div className="finance-card">
          <p className="finance-card__eyebrow">Spent</p>
          <h2>Now</h2>
          <p className="finance-card__value">{formatMoney(budgetPlan.spent)}</p>
        </div>
        <div className="finance-card">
          <p className="finance-card__eyebrow">Can spend</p>
          <h2>Left</h2>
          <p className="finance-card__value">{formatMoney(summary.safeToSpend)}</p>
        </div>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <p>Categories</p>
            <h2>Monthly plan</h2>
          </div>
          <span className="finance-pill">{month}</span>
        </div>
        <div className="budget-group-list">
          {budgetPlan.groups.map((group) => (
            <section key={group.name} className="budget-group-card">
              <div className="budget-group-card__head">
                <div>
                  <strong>{group.name}</strong>
                  <span>{formatMoney(group.spent)} spent</span>
                </div>
                <em>{formatMoney(group.available)} left</em>
              </div>
              <div className="finance-stack">
                {group.categories.map((category) => (
                  <BudgetMeter key={category.name} category={category} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}
