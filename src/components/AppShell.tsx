import { Outlet } from '@tanstack/react-router'
import AppNav from '#/components/AppNav'
import { AppMobileNav } from '#/components/AppMobileNav'
import { NotificationToast } from '#/components/NotificationToast'

export function AppShell() {
  return (
    <div className="app-shell">
      <AppNav />
      <div className="app-shell__main">
        <Outlet />
      </div>
      <AppMobileNav />
      <NotificationToast />
    </div>
  )
}
