import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '#/components/AppShell'
import { NotFoundPage } from '#/components/NotFoundPage'

export const Route = createFileRoute('/p')({
  component: AppShell,
  notFoundComponent: NotFoundPage,
})
