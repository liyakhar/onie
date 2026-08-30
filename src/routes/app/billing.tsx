import { createFileRoute } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { BillingActions } from '#/components/billing/BillingActions'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import { buildPageMeta } from '#/lib/seo'
import { getBillingOverview } from '#/server/billing'

export const Route = createFileRoute('/app/billing')({
  loader: () => getBillingOverview(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/billing',
      title: 'Plan & billing',
      description: 'See your Wollie plan and manage billing.',
      noindex: true,
    }).meta,
  }),
  component: BillingPage,
})

function BillingPage() {
  const billing = Route.useLoaderData()
  if (!billing) return null
  const earlyAccess = billing.billingMode === 'early_access'

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Plan &amp; billing</h1>
        <p className="mt-1 text-sm text-zinc-500">Your Wollie access in one place.</p>
      </header>

      <Card className="max-w-3xl rounded-lg border-zinc-200 bg-white shadow-none">
        <CardContent className="grid gap-8 p-6 sm:p-8">
          <div>
            <Badge className="rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-50">
              {earlyAccess ? 'Early access' : billing.plan === 'free' ? 'Free' : 'Household'}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              {earlyAccess ? 'Wollie is free for now.' : `${billing.statusLabel}.`}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              {earlyAccess
                ? 'Every current feature is included. No card and no trial deadline.'
                : billing.plan === 'free'
                  ? 'Keep planning for free. Upgrade only if you need more than the Free plan includes.'
                  : 'Your household has full Wollie access.'}
            </p>
          </div>

          {earlyAccess && (
            <div className="grid gap-2 border-t border-zinc-200 pt-6 sm:grid-cols-2">
              {['Bank connections', 'Money plan', 'Household sharing', 'Exports and backups'].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                  <Check className="size-4 text-[var(--color-wollie-accent)]" aria-hidden="true" />{item}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col items-start justify-between gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-zinc-500">
              We’ll tell you before paid limits are introduced. Your data stays yours.
            </p>
            <div className="shrink-0"><BillingActions billing={billing} /></div>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
