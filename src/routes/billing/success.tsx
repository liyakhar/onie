import { createFileRoute, redirect } from '@tanstack/react-router'
import { syncCheckoutSession } from '#/server/billing'
import { buildPageMeta } from '#/lib/seo'

const successMeta = buildPageMeta({
  path: '/billing/success',
  title: 'Finishing subscription',
  description: 'Finishing your Wollie subscription.',
  noindex: true,
})

export const Route = createFileRoute('/billing/success')({
  head: () => ({ meta: successMeta.meta, links: successMeta.links }),
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === 'string' ? search.session_id : '',
  }),
  loaderDeps: ({ search }) => ({ sessionId: search.session_id }),
  loader: async ({ deps }) => {
    if (!deps.sessionId) return { error: 'Missing checkout session.' }
    await syncCheckoutSession({ data: { sessionId: deps.sessionId } })
    throw redirect({ to: '/app' })
  },
  component: BillingSuccess,
})

function BillingSuccess() {
  const result = Route.useLoaderData()
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 text-zinc-950">
      <div className="max-w-md border border-zinc-200 p-8 text-center">
        <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Wollie billing</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Finishing your subscription</h1>
        <p className="mt-4 leading-7 text-zinc-600">{result?.error || 'Stripe is confirming your plan. This usually takes only a moment.'}</p>
      </div>
    </main>
  )
}
