import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'

export const Route = createFileRoute('/reset-password')({
  component: AppShell,
})
