import { createFileRoute, Outlet } from '@tanstack/react-router'
import AppNav from '#/components/AppNav'

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="app-shell">
      <AppNav />
      <div className="app-shell__main">
        <Outlet />
      </div>
    </div>
  )
}
