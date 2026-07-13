import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/p/$postId/edit/')({
  loader: async () => {
    throw redirect({ to: '/app' })
  },
})
