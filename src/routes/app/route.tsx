import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { SubscriptionPaywall } from '#/components/billing/SubscriptionPaywall'
import { getBillingOverview } from '#/server/billing'
import { requireSignedIn } from '#/server/profiles'

export const Route = createFileRoute('/app')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
  }),
  loader: async () => {
    await requireSignedIn({ data: { redirect: '/app' } })
    return getBillingOverview()
  },
  component: AppRoute,
})

function AppRoute() {
  const billing = Route.useLoaderData()
  if (!billing) return null
  return (
    <AppShell locked={!billing.hasAccess}>
      {billing.hasAccess ? undefined : <SubscriptionPaywall billing={billing} />}
    </AppShell>
  )
}
