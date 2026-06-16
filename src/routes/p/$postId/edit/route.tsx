import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireOnboarded } from '#/server/profiles'

export const Route = createFileRoute('/p/$postId/edit')({
  loader: async () => {
    await requireOnboarded()
    return null
  },
  component: () => <Outlet />,
})
