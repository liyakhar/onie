import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { requireOnboarded } from '#/server/profiles'

export const Route = createFileRoute('/new')({
  loader: async () => {
    await requireOnboarded()
    return null
  },
  component: AppShell,
})
