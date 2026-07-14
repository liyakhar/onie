import { createFileRoute } from '@tanstack/react-router'
import { PublicShell } from '#/components/PublicShell'

export const Route = createFileRoute('/login')({
  component: PublicShell,
})
