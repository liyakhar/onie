import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/u/$username')({
  loader: async () => {
    throw redirect({ to: '/app' })
  },
})
