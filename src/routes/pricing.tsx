import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'
import { createCheckoutSession, createCustomerPortalSession, getBillingOverview } from '#/server/billing'
import type { BillingAccess } from '#/server/billing.server'

const pricingMeta = buildPageMeta({
  path: '/pricing',
  title: 'Pricing',
  description: 'Try every Wollie feature free for 14 days, then choose €7.99 monthly or €59 yearly.',
})

const included = [
  'Accounts',
  'Transactions',
  'Budgets',
  'Bills',
  'Household sharing',
  'Exports',
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
        <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            {checkout === 'cancelled' && (
              <p className="mb-8 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600" role="status">
                Checkout was closed. Nothing was charged.
              </p>
            )}

            <div className="max-w-3xl">
              <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Pricing</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Choose how you pay.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                Every option includes all Wollie features for you and one shared household.
              </p>
            </div>

            <div className="mt-12 grid border border-zinc-200 md:grid-cols-3">
              <article className="flex min-h-full flex-col border-b border-zinc-200 p-6 sm:p-8 md:border-b-0 md:border-r">
                <h2 className="text-sm font-medium text-zinc-500">Free trial</h2>
                <p className="mt-8 text-4xl font-semibold tracking-[-0.05em]">14 days</p>
                <p className="mt-2 text-sm text-zinc-500">No card required</p>
                <p className="mt-6 flex-1 text-sm leading-6 text-zinc-600">
                  Try every feature before choosing a paid plan.
                </p>
                <div className="mt-8">
                  <TrialAction billing={billing} />
                </div>
              </article>

              <article className="flex min-h-full flex-col border-b border-zinc-200 p-6 sm:p-8 md:border-b-0 md:border-r">
                <h2 className="text-sm font-medium text-zinc-500">Monthly</h2>
                <p className="mt-8 text-4xl font-semibold tracking-[-0.05em]">€7.99</p>
                <p className="mt-2 text-sm text-zinc-500">per month</p>
                <p className="mt-6 flex-1 text-sm leading-6 text-zinc-600">
                  Pay month to month. Cancel anytime.
                </p>
                <div className="mt-8">
                  <PaidPlanAction billing={billing} interval="month" />
                </div>
              </article>

              <article className="flex min-h-full flex-col bg-[color-mix(in_oklch,var(--color-wollie-accent)_5%,white)] p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-sm font-medium text-zinc-500">Yearly</h2>
                  <span className="text-xs font-semibold text-[var(--color-wollie-accent)]">Best value</span>
                </div>
                <p className="mt-8 text-4xl font-semibold tracking-[-0.05em]">€59</p>
                <p className="mt-2 text-sm text-zinc-500">per year · €4.92/month</p>
                <p className="mt-6 flex-1 text-sm leading-6 text-zinc-600">
                  Save 38% compared with monthly billing.
                </p>
                <div className="mt-8">
                  <PaidPlanAction billing={billing} interval="year" featured />
                </div>
              </article>
            </div>

            <div className="mt-10 border-y border-zinc-200 py-6">
              <p className="text-sm font-medium text-zinc-950">Everything included</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">{included.join(' · ')}</p>
            </div>

            <div className="mt-6 flex flex-col gap-2 text-sm leading-6 text-zinc-500 sm:flex-row sm:flex-wrap sm:gap-x-8">
              <span>Read-only bank access</span>
              <span>Stripe-hosted payments</span>
              <span>Prices in EUR; taxes may apply</span>
            </div>

            {billing && !billing.billingConfigured && billing.state !== 'subscribed' && (
              <p className="mt-6 text-sm text-zinc-500" role="status">
                Paid checkout is opening soon. Your free trial remains available now.
              </p>
            )}
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

function TrialAction({ billing }: { billing: BillingAccess | null }) {
  if (!billing) {
    return (
      <Button variant="outline" asChild className="min-h-11 w-full rounded-none">
        <Link to="/login" search={loginSearch({ signup: true })}>Start free trial</Link>
      </Button>
    )
  }

  if (billing.state === 'expired') {
    return <Button variant="outline" disabled className="min-h-11 w-full rounded-none">Trial complete</Button>
  }

  return (
    <Button variant="outline" asChild className="min-h-11 w-full rounded-none">
      <Link to="/app">Open app</Link>
    </Button>
  )
}

function PaidPlanAction({
  billing,
  interval,
  featured = false,
}: {
  billing: BillingAccess | null
  interval: 'month' | 'year'
  featured?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const subscribed = billing?.state === 'subscribed'

  if (!billing) {
    return (
      <Button
        variant={featured ? 'default' : 'outline'}
        asChild
        className={`${featured ? 'wollie-primary-action' : ''} min-h-11 w-full rounded-none`}
      >
        <Link to="/login" search={loginSearch({ signup: true })}>Start free trial</Link>
      </Button>
    )
  }

  if (billing.isHouseholdOwner === false) {
    return <Button variant="outline" disabled className="min-h-11 w-full rounded-none">Managed by owner</Button>
  }

  if (!billing.billingConfigured && !subscribed) {
    return <Button variant="outline" disabled className="min-h-11 w-full rounded-none">Coming soon</Button>
  }

  const openBilling = async () => {
    setError('')
    setLoading(true)
    try {
      const result = subscribed
        ? await createCustomerPortalSession()
        : await createCheckoutSession({ data: { interval } })
      window.location.assign(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Billing could not be opened.')
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant={featured ? 'default' : 'outline'}
        onClick={() => void openBilling()}
        disabled={loading}
        className={`${featured ? 'wollie-primary-action' : ''} min-h-11 w-full rounded-none`}
      >
        {loading
          ? 'Opening…'
          : subscribed
            ? 'Manage subscription'
            : `Choose ${interval === 'year' ? 'yearly' : 'monthly'}`}
      </Button>
      {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
    </div>
  )
}
