import { Check, LockKeyhole } from 'lucide-react'
import type { BillingAccess } from '#/server/billing.server'
import { BillingActions } from '#/components/billing/BillingActions'

export function SubscriptionPaywall({ billing }: { billing: BillingAccess }) {
  return (
    <main id="main" className="min-h-[calc(100vh-4rem)] bg-white px-4 py-12 text-zinc-950 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden border border-zinc-200 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="p-7 sm:p-12 lg:p-16">
          <div className="flex size-11 items-center justify-center bg-[color-mix(in_oklch,var(--color-wollie-accent)_12%,white)] text-[var(--color-wollie-accent)]">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-medium text-[var(--color-wollie-accent)]">Your trial has ended</p>
          <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
            Keep your whole month in one calm view.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Your data is still here. Choose monthly or yearly billing to reopen accounts, activity, plans, and bills.
          </p>
          <ul className="mt-9 grid gap-3 text-sm text-zinc-700 sm:grid-cols-2">
            {['Every Wollie feature', 'Read-only bank connections', 'Cancel in Stripe anytime', 'Your existing data preserved'].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-[var(--color-wollie-accent)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <aside className="border-t border-zinc-200 bg-zinc-50 p-7 sm:p-12 lg:border-l lg:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">One plan · all features</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Choose how you pay</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">Annual billing saves €36.88 compared with twelve monthly payments.</p>
          <div className="mt-8">
            <BillingActions billing={billing} />
          </div>
          <p className="mt-6 border-t border-zinc-200 pt-5 text-xs leading-5 text-zinc-500">
            Secure checkout and billing management are hosted by Stripe. Taxes may apply.
          </p>
        </aside>
      </div>
    </main>
  )
}
