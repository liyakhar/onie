import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/blog/$slug')({
  loader: async () => {
    throw redirect({ to: '/' })
  },
})
