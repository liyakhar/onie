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
  'Monthly budgets and spending progress',
  'Upcoming and recurring bills',
  'Household sharing and ownership splits',
  'CSV exports and downloadable reports',
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
  const billingConfigured = billing?.billingConfigured ?? false

  return (
    <div className="wollie-landing min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-semibold tracking-[-0.04em]">Wollie</Link>
          <nav className="flex items-center gap-2" aria-label="Pricing navigation">
            <Button variant="ghost" asChild className="min-h-11"><Link to="/">Home</Link></Button>
            <Button variant="outline" asChild className="min-h-11">
              <Link to={billing ? '/app' : '/login'}>{billing ? 'Open app' : 'Sign in'}</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {checkout === 'cancelled' && (
              <p className="mx-auto mb-10 max-w-5xl rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600" role="status">
                Checkout was closed. Nothing was charged.
              </p>
            )}
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Simple pricing</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                One plan. Everything included.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                {billingConfigured
                  ? 'Start with a 14-day free trial. Continue monthly or save with yearly billing.'
                  : 'Start with a no-card trial while paid checkout is being prepared for launch.'}
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-5xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_24px_70px_-48px_rgba(9,30,24,0.45)] lg:grid-cols-[1.08fr_0.92fr]">
              <div className="p-6 sm:p-10 lg:p-12">
                <div className="inline-flex items-center rounded-full bg-[color-mix(in_oklch,var(--color-wollie-accent)_10%,white)] px-3 py-1 text-xs font-semibold text-[var(--color-wollie-accent)]">
                  Wollie Complete
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-[-0.045em]">Your full money toolkit</h2>
                <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600">
                  One subscription covers personal finances and the household you invite.
                </p>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-zinc-700">
                      <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-wollie-accent)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-zinc-200 bg-zinc-50 p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
                <p className="text-sm font-semibold">14 days free</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Then €7.99 monthly or €59 yearly. No card is required to start your trial.
                </p>
                <div className="mt-8">
                  <BillingActions billing={billing} />
                </div>
                <p className="mt-6 border-t border-zinc-200 pt-5 text-xs leading-5 text-zinc-500">
                  Cancel anytime. Prices are shown in EUR; taxes may apply depending on your location.
                </p>
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-6 border-t border-zinc-200 pt-8 md:grid-cols-3 md:gap-10">
              {[
                [ShieldCheck, 'Private by default', 'Financial data stays with you and household members you invite.'],
                [LockKeyhole, billingConfigured ? 'Stripe-hosted payment' : 'Checkout opening soon', billingConfigured ? 'Wollie never stores your card details.' : 'Paid plans will use Stripe-hosted checkout once live billing is connected.'],
                [RefreshCcw, 'Change anytime', 'Manage invoices, billing, and cancellation in Stripe.'],
              ].map(([Icon, title, body]) => {
                const ItemIcon = Icon as typeof ShieldCheck
                return (
                  <article key={String(title)} className="flex gap-4">
                    <ItemIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-wollie-accent)]" aria-hidden="true" />
                    <div>
                      <h2 className="text-sm font-semibold">{String(title)}</h2>
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{String(body)}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-zinc-200 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>© 2026 Wollie</span>
        <nav className="flex gap-5" aria-label="Legal">
          <Link to="/privacy" className="hover:text-zinc-950">Privacy</Link>
          <Link to="/terms" className="hover:text-zinc-950">Terms</Link>
        </nav>
      </footer>
    </div>
  )
}
