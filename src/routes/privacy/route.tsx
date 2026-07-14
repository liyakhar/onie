import { createFileRoute } from '@tanstack/react-router'
import { PublicShell } from '#/components/PublicShell'

export const Route = createFileRoute('/privacy')({
  component: PublicShell,
})
