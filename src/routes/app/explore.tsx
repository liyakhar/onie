import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/explore')({
  beforeLoad: () => {
    throw redirect({ to: '/app' })
  },
})
