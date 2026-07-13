import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/u')({
  loader: async () => {
    throw redirect({ to: '/app' })
  },
})
