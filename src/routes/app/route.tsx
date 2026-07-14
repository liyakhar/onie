import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { requireSignedIn } from '#/server/profiles'

export const Route = createFileRoute('/app')({
  loader: async () => {
    await requireSignedIn({ data: { redirect: '/app' } })
    return null
  },
  component: AppShell,
})
