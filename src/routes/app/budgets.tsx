import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/budgets')({
  beforeLoad: () => {
    throw redirect({ to: '/app' })
  },
})
