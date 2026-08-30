import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import type { BillingAccess } from '#/server/billing.server'
import { createCustomerPortalSession } from '#/server/billing'
import { loginSearch } from '#/lib/auth-nav'
import { Button } from '#/components/ui/button'

export function BillingActions({ billing }: { billing: BillingAccess | null }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!billing) {
    return (
      <Button asChild className="wollie-primary-action min-h-11 rounded-lg">
        <Link to="/login" search={loginSearch({ signup: true })}>Create free account</Link>
      </Button>
    )
  }

  const canManageSubscription = billing.hasCustomer && billing.isHouseholdOwner !== false

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

  if (canManageSubscription) {
    return (
      <div className="grid gap-3">
        <Button type="button" variant="outline" onClick={() => void openPortal()} disabled={loading} className="min-h-11 rounded-lg">
          {loading ? 'Opening billing…' : 'Manage subscription'}
        </Button>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </div>
    )
  }

  return (
    <Button asChild className="wollie-primary-action min-h-11 rounded-lg">
      <Link to="/app">Open Wollie</Link>
    </Button>
  )
}
