import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/p')({
  loader: async () => {
    throw redirect({ to: '/app' })
  },
})
