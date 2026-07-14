import { createFileRoute } from '@tanstack/react-router'
import { PublicShell } from '#/components/PublicShell'
import { requireNeedsOnboarding } from '#/server/profiles'

export const Route = createFileRoute('/welcome')({
  loader: async () => {
    await requireNeedsOnboarding()
    return null
  },
  component: PublicShell,
})
