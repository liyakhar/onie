import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { requireNeedsOnboarding } from '#/server/profiles'

export const Route = createFileRoute('/welcome')({
  loader: async () => {
    await requireNeedsOnboarding()
    return null
  },
  component: AppShell,
})
