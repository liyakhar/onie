import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { requireOnboarded, requireSignedIn } from '#/server/profiles'

export const Route = createFileRoute('/new')({
  loader: async () => {
    await requireSignedIn({ data: { redirect: '/new' } })
    await requireOnboarded()
    return null
  },
  component: AppShell,
})
