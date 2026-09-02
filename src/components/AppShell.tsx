import { Outlet } from '@tanstack/react-router'
import AppNav from '#/components/AppNav'
import { AppMobileNav } from '#/components/AppMobileNav'

export function AppShell({
  children,
  locked = false,
  demo = false,
}: {
  children?: React.ReactNode;
  locked?: boolean;
  demo?: boolean;
}) {
  return (
    <div className="app-shell">
      <AppNav demo={demo} locked={locked} />
      <div className="app-shell__main">
        {children ?? <Outlet />}
      </div>
      <AppMobileNav demo={demo} locked={locked} />
    </div>
  )
}
