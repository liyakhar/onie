import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { requireSignedIn } from '#/server/profiles'

export const Route = createFileRoute('/app')({
  head: () => ({
    meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
  }),
  loader: async () => {
    await requireSignedIn({ data: { redirect: '/app' } })
  },
  component: AppRoute,
})

function AppRoute() {
  return <AppShell />
}
