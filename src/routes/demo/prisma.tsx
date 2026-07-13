import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/demo/prisma')({
  beforeLoad: () => {
    throw redirect({ to: '/app' })
  },
})
