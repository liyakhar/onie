import { createFileRoute } from '@tanstack/react-router'
import { formatMoney, getDemoFinanceDashboard } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'

export const Route = createFileRoute('/app/recurring')({
  loader: () => ({
    recurringPayments: getDemoFinanceDashboard().recurringPayments,
  }),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/recurring',
      title: 'Recurring bills',
      description: 'Subscriptions and upcoming bills.',
      noindex: true,
    }).meta,
  }),
  component: RecurringPage,
})

function RecurringPage() {
  const { recurringPayments } = Route.useLoaderData()

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">Bills</p>
        <h1 className="app-page__title">Recurring.</h1>
      </header>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <p>Upcoming</p>
            <h2>Bills and subscriptions</h2>
          </div>
          <span className="finance-pill">{recurringPayments.length} active</span>
        </div>
        <ul className="transaction-list transaction-list--large">
          {recurringPayments.map((payment) => (
            <li key={payment.id}>
              <div>
                <strong>{payment.merchant}</strong>
                <span>{payment.category} · {payment.cadence} · next on {payment.nextDate}</span>
              </div>
              <em>{formatMoney(-payment.amount)}</em>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
