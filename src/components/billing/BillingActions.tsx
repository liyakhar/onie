import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { BillingAccess } from '#/server/billing.server'
import { createCheckoutSession, createCustomerPortalSession } from '#/server/billing'
import { loginSearch } from '#/lib/auth-nav'
import { Button } from '#/components/ui/button'

export function BillingActions({
  billing,
  compact = false,
  theme = 'light',
}: {
  billing: BillingAccess | null
  compact?: boolean
  theme?: 'light' | 'dark'
}) {
  const [interval, setInterval] = useState<'month' | 'year'>('year')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const subscribed = billing?.state === 'subscribed'
  const billingConfigured = billing?.billingConfigured ?? false

  if (billing?.isHouseholdOwner === false) {
    return (
      <p className={`text-sm leading-6 ${theme === 'dark' ? 'text-white/65' : 'text-zinc-600'}`}>
        Your household plan is managed by {billing.householdOwnerName || 'the household owner'}.
      </p>
    )
  }

  const openCheckout = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await createCheckoutSession({ data: { interval } })
      window.location.assign(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Checkout could not be opened.')
      setLoading(false)
    }
  }

  const openPortal = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await createCustomerPortalSession()
      window.location.assign(result.url)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Billing could not be opened.')
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <div className="grid gap-3">
        <Button
          type="button"
          onClick={() => void openPortal()}
          disabled={loading}
          className="wollie-primary-action min-h-11 rounded-none"
        >
          {loading ? 'Opening billing…' : 'Manage subscription'}
        </Button>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </div>
    )
  }

  if (billing && !billingConfigured) {
    return (
      <div className="grid gap-3">
        <div className={`border px-4 py-3 ${theme === 'dark' ? 'border-white/15 bg-white/5 text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-950'}`}>
          <p className="text-sm font-medium">Paid plans are opening soon.</p>
          <p className={`mt-1 text-sm leading-6 ${theme === 'dark' ? 'text-white/60' : 'text-zinc-600'}`}>
            Your free trial and demo remain available. Checkout will appear here once live billing is connected.
          </p>
        </div>
        {billing.state === 'trial' && (
          <p className={`text-xs leading-5 ${theme === 'dark' ? 'text-white/55' : 'text-zinc-500'}`}>
            Your no-card trial remains available for {billing.daysRemaining} more day{billing.daysRemaining === 1 ? '' : 's'}.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <div
        className="grid grid-cols-2 border border-zinc-200 bg-zinc-50 p-1"
        role="group"
        aria-label="Billing interval"
      >
        <button
          type="button"
          aria-pressed={interval === 'month'}
          onClick={() => setInterval('month')}
          className={`min-h-10 px-3 text-sm font-medium transition-colors ${interval === 'month' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-500 hover:text-zinc-950'}`}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={interval === 'year'}
          onClick={() => setInterval('year')}
          className={`min-h-10 px-3 text-sm font-medium transition-colors ${interval === 'year' ? 'bg-[var(--color-wollie-accent)] text-white' : 'text-zinc-500 hover:text-zinc-950'}`}
        >
          Yearly · save €36.88
        </button>
      </div>

      <div className={compact ? 'flex items-end justify-between gap-4' : 'grid gap-3'}>
        <p className={`text-sm ${theme === 'dark' ? 'text-white/55' : 'text-zinc-600'}`}>
          <span className={`text-2xl font-semibold tracking-[-0.04em] ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>
            {interval === 'year' ? '€59' : '€7.99'}
          </span>{' '}
          / {interval === 'year' ? 'year' : 'month'}
        </p>
        {billing ? (
          <Button
            type="button"
            onClick={() => void openCheckout()}
            disabled={loading}
            className="wollie-primary-action min-h-11 rounded-none"
          >
            {loading ? 'Opening checkout…' : `Choose ${interval === 'year' ? 'yearly' : 'monthly'}`}
          </Button>
        ) : (
          <Button asChild className="wollie-primary-action min-h-11 rounded-none">
            <Link to="/login" search={loginSearch({ signup: true })}>
              Start 14-day free trial
            </Link>
          </Button>
        )}
      </div>
      {billing?.hasCustomer && (
        <Button
          type="button"
          variant="outline"
          onClick={() => void openPortal()}
          disabled={loading}
          className="min-h-11 rounded-none"
        >
          Manage billing history
        </Button>
      )}
      {billing?.state === 'trial' && (
        <p className={`text-xs leading-5 ${theme === 'dark' ? 'text-white/55' : 'text-zinc-500'}`}>
          Your no-card trial remains available for {billing.daysRemaining} more day{billing.daysRemaining === 1 ? '' : 's'}. Choosing a plan starts paid billing now.
        </p>
      )}
      {error && <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`} role="alert">{error}</p>}
    </div>
  )
}
