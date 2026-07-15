import { Outlet } from '@tanstack/react-router'
import AppNav from '#/components/AppNav'
import { AppMobileNav } from '#/components/AppMobileNav'

export function AppShell({ children, locked = false }: { children?: React.ReactNode; locked?: boolean }) {
  return (
    <div className="app-shell">
      <AppNav locked={locked} />
      <div className="app-shell__main">
        {children ?? <Outlet />}
      </div>
      <AppMobileNav locked={locked} />
    </div>
  )
}
