import { createFileRoute, Link } from '@tanstack/react-router'
import { Check, LockKeyhole, RefreshCcw, ShieldCheck } from 'lucide-react'
import { BillingActions } from '#/components/billing/BillingActions'
import { Button } from '#/components/ui/button'
import { buildPageMeta } from '#/lib/seo'
import { getBillingOverview } from '#/server/billing'

const pricingMeta = buildPageMeta({
  path: '/pricing',
  title: 'Pricing',
  description: 'Try every Wollie feature free for 14 days, then choose €7.99 monthly or €59 yearly.',
})

const included = [
  'All accounts in one dashboard',
  'Transaction review and categories',
  'Monthly spending plan',
  'Upcoming and recurring bills',
  'Read-only bank connections',
  'Every future core feature',
] as const

export const Route = createFileRoute('/pricing')({
  head: () => ({ meta: pricingMeta.meta, links: pricingMeta.links }),
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: search.checkout === 'cancelled' ? 'cancelled' as const : undefined,
  }),
  loader: () => getBillingOverview(),
  component: PricingPage,
})

function PricingPage() {
  const billing = Route.useLoaderData()
  const { checkout } = Route.useSearch()

  return (
    <div className="wollie-landing min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-semibold tracking-[-0.04em]">Wollie</Link>
          <nav className="flex items-center gap-2" aria-label="Pricing navigation">
            <Button variant="ghost" asChild><Link to="/">Home</Link></Button>
            <Button variant="outline" asChild className="rounded-none">
              <Link to={billing ? '/app' : '/login'}>{billing ? 'Open app' : 'Sign in'}</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="border-b border-zinc-200 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {checkout === 'cancelled' && (
              <p className="mb-8 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600" role="status">
                Checkout was closed. Nothing was charged.
              </p>
            )}
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-wollie-accent)]">
                  <span className="size-2 bg-[var(--color-wollie-accent)]" aria-hidden="true" />
                  Simple pricing
                </div>
                <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl lg:text-8xl">
                  One plan for a calmer month.
                </h1>
              </div>
              <p className="max-w-xl text-lg leading-8 text-zinc-600 lg:pb-2">
                Try all of Wollie for 14 days without a card. Then keep everything for €7.99 monthly, or save with €59 yearly.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden border border-zinc-200 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="bg-zinc-950 p-7 text-white sm:p-12 lg:p-16">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Wollie complete</p>
              <div className="mt-8 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-[-0.06em]">€59</span>
                <span className="pb-2 text-white/55">per year</span>
              </div>
              <p className="mt-3 text-sm text-emerald-300">Best value · equivalent to €4.92/month</p>
              <div className="mt-10 border-t border-white/15 pt-8">
                <BillingActions billing={billing} theme="dark" />
              </div>
            </div>

            <div className="p-7 sm:p-12 lg:p-16">
              <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Everything is included</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">No tiers. No feature maze.</h2>
              <ul className="mt-9 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-wollie-accent)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-10 border-t border-zinc-200 pt-6 text-xs leading-5 text-zinc-500">
                Prices are shown in EUR. Taxes may apply depending on your location.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-zinc-50 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-px overflow-hidden border border-zinc-200 bg-zinc-200 md:grid-cols-3">
            {[
              [ShieldCheck, 'Private by default', 'Financial data stays with you and household members you invite.'],
              [LockKeyhole, 'Stripe-hosted payment', 'Wollie never stores your card details.'],
              [RefreshCcw, 'Change anytime', 'Manage invoices, billing, and cancellation in Stripe.'],
            ].map(([Icon, title, body]) => {
              const ItemIcon = Icon as typeof ShieldCheck
              return (
                <article key={String(title)} className="bg-white p-7 sm:p-9">
                  <ItemIcon className="size-5 text-[var(--color-wollie-accent)]" aria-hidden="true" />
                  <h2 className="mt-5 text-lg font-semibold">{String(title)}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{String(body)}</p>
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>© 2026 Wollie</span>
        <nav className="flex gap-5" aria-label="Legal">
          <Link to="/privacy" className="hover:text-zinc-950">Privacy</Link>
          <Link to="/terms" className="hover:text-zinc-950">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}
