import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/transactions')({
  beforeLoad: () => {
    throw redirect({ to: '/app' })
  },
})
