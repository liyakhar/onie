import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { getFinanceInsights } from '#/server/finance'

export const Route = createFileRoute('/app/insights')({
  loader: () => getFinanceInsights(),
  component: InsightsPage,
})

function InsightsPage() {
  const { insights } = Route.useLoaderData()
  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-5"><h1 className="text-2xl font-semibold tracking-tight">Insights</h1><p className="mt-1 text-sm text-zinc-500">Clear observations that lead to a useful action.</p></header>
      <section aria-labelledby="insight-list-heading" className="overflow-hidden rounded-lg border border-zinc-200">
        <h2 id="insight-list-heading" className="sr-only">Money insights</h2>
        {insights.length > 0 ? <ol className="divide-y divide-zinc-200">{insights.map((insight, index) => <li key={insight.id} className="grid gap-3 p-5 sm:grid-cols-[3rem_1fr_auto] sm:items-center"><span className="text-xs font-medium tabular-nums text-zinc-400">{String(index + 1).padStart(2, '0')}</span><div><h3 className="font-medium">{insight.title}</h3><p className="mt-1 text-sm leading-6 text-zinc-500">{insight.body}</p></div><Link to="/app" className="flex min-h-11 items-center gap-2 text-sm font-medium">Open dashboard<ArrowRight className="size-4" aria-hidden="true" /></Link></li>)}</ol> : <p className="p-12 text-center text-sm text-zinc-500">No insights yet.</p>}
      </section>
    </main>
  )
}
