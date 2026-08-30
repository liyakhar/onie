import { createFileRoute, Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { BillingActions } from '#/components/billing/BillingActions'
import { Button } from '#/components/ui/button'
import { buildPageMeta } from '#/lib/seo'
import { getBillingOverview } from '#/server/billing'

const pricingMeta = buildPageMeta({
  path: '/pricing',
  title: 'Pricing',
  description: 'Wollie is free during early access. No card and no trial deadline.',
})

export const Route = createFileRoute('/pricing')({
  head: () => ({ meta: pricingMeta.meta, links: pricingMeta.links }),
  loader: () => getBillingOverview(),
  component: PricingPage,
})

function PricingPage() {
  const billing = Route.useLoaderData()

  return (
    <div className="wollie-landing min-h-screen bg-white text-zinc-950">
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

      <main id="main" className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-[var(--color-wollie-accent)]">Pricing</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            Free during early access.
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            Use every Wollie feature while we prepare the permanent Free and Household plans.
          </p>
        </div>

        <section className="mt-12 max-w-3xl border border-zinc-200 p-6 sm:p-9" aria-labelledby="early-access-plan">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="early-access-plan" className="text-sm font-medium text-zinc-500">Early access</h2>
              <p className="mt-4 text-5xl font-semibold tracking-[-0.05em]">€0</p>
              <p className="mt-2 text-sm text-zinc-500">No card. No trial deadline.</p>
            </div>
            <BillingActions billing={billing} />
          </div>

          <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2">
            {['Connect your bank accounts', 'Plan spending, savings, and goals', 'Share a household with your partner', 'Export and back up your data'].map((item) => (
              <p key={item} className="flex items-center gap-2 text-sm text-zinc-700">
                <Check className="size-4 text-[var(--color-wollie-accent)]" aria-hidden="true" />{item}
              </p>
            ))}
          </div>
        </section>

        <p className="mt-6 max-w-3xl text-sm leading-6 text-zinc-500">
          We’ll give you notice before paid limits are introduced. Existing data will remain accessible and exportable.
        </p>
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
