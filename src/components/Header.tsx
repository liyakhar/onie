import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import ThemeToggle from './ThemeToggle'
import { NotificationBell } from '#/components/NotificationBell'
import { OnieIcon } from '#/components/OnieIcon'
import { Button } from '#/components/ui/button'
import { Plus } from 'lucide-react'
import { authClient } from '#/lib/auth-client'

export default function Header() {
  const { data: session } = authClient.useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-3.5">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg px-2 py-1 text-[var(--ink)] no-underline"
          >
            <OnieIcon />
          </Link>
        </h2>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 pb-1 text-sm font-medium sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link
            to="/"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Feed
          </Link>
          <Link
            to="/explore"
            className="nav-link"
            activeProps={{ className: 'nav-link is-active' }}
          >
            Explore
          </Link>
          {session?.user && (
            <Link
              to="/settings"
              className="nav-link"
              activeProps={{ className: 'nav-link is-active' }}
            >
              Profile
            </Link>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {session?.user && (
            <>
              <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex">
                <Link to="/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Share workflow
                </Link>
              </Button>
              <NotificationBell />
            </>
          )}
          <BetterAuthHeader />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
