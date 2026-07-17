import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
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
  const pricingRef = useRef<HTMLDivElement>(null)
  const billing = Route.useLoaderData()
  const { checkout } = Route.useSearch()

  useEffect(() => {
    const root = pricingRef.current
    if (!root) return

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>('.wollie-reveal'))
    root.dataset.motionReady = 'true'

    if (!('IntersectionObserver' in window)) {
      revealItems.forEach((item) => {
        item.dataset.visible = 'true'
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).dataset.visible = 'true'
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={pricingRef} className="wollie-landing min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-semibold tracking-[-0.04em]">Wollie</Link>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Pricing navigation">
            <Button variant="ghost" asChild className="min-h-11"><Link to="/">Home</Link></Button>
            <Button variant="outline" asChild className="min-h-11">
              <Link to={billing ? '/app' : '/login'}>{billing ? 'Open app' : 'Sign in'}</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div>
            {checkout === 'cancelled' && (
              <p className="mb-8 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600" role="status">
                Checkout was closed. Nothing was charged.
              </p>
            )}

            <div className="wollie-reveal max-w-3xl">
              <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Pricing</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Choose how you pay.
              </h1>
            </div>

            <div className="mt-12 grid border border-zinc-200 md:grid-cols-3">
              <article className="wollie-reveal flex min-h-full flex-col border-b border-zinc-200 p-6 sm:p-8 md:border-b-0 md:border-r" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
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

              <article className="wollie-reveal flex min-h-full flex-col border-b border-zinc-200 p-6 sm:p-8 md:border-b-0 md:border-r" style={{ '--reveal-delay': '130ms' } as CSSProperties}>
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

              <article className="wollie-reveal flex min-h-full flex-col bg-[color-mix(in_oklch,var(--color-wollie-accent)_5%,white)] p-6 sm:p-8" style={{ '--reveal-delay': '180ms' } as CSSProperties}>
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

            <div className="wollie-reveal mt-10 border-y border-zinc-200 py-6" style={{ '--reveal-delay': '220ms' } as CSSProperties}>
              <p className="text-sm font-medium text-zinc-950">Everything included</p>
              <p className="mt-3 text-sm leading-7 text-zinc-500">{included.join(' · ')}</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-zinc-200 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
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
  const founder = billing?.state === 'founder'

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

  if (founder) {
    return <Button variant="outline" disabled className="min-h-11 w-full rounded-none">Founder access</Button>
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
