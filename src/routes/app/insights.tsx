import { createFileRoute } from '@tanstack/react-router'
import { buildPageMeta } from '#/lib/seo'
import { getFinanceInsights } from '#/server/finance'

export const Route = createFileRoute('/app/insights')({
  loader: async () => getFinanceInsights(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/insights',
      title: 'Money insights',
      description: 'Plain-English money summaries.',
      noindex: true,
    }).meta,
  }),
  component: InsightsPage,
})

function InsightsPage() {
  const { insights } = Route.useLoaderData()

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">Notes</p>
        <h1 className="app-page__title">Insights.</h1>
      </header>

      <section className="finance-panel finance-panel--accent">
        <div className="finance-panel__head">
          <div>
            <p>July</p>
            <h2>What changed</h2>
          </div>
          <span className="finance-pill">{insights.length} notes</span>
        </div>
        <ul className="finance-insight-list finance-insight-list--large">
          {insights.map((insight) => (
            <li key={insight.id}>
              <strong>{insight.title}</strong>
              <span>{insight.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
