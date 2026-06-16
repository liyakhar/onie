import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { NotificationBell } from '#/components/NotificationBell'
import { OnieIcon } from '#/components/OnieIcon'
import { authClient } from '#/lib/auth-client'
import { Plus } from 'lucide-react'

export default function AppNav() {
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)

  return (
    <header className="app-nav" role="banner">
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__brand" aria-label="Onie home">
          <OnieIcon />
        </Link>

        <nav className="app-nav__tabs" aria-label="App sections">
          <Link
            to="/app"
            className="app-nav__tab"
            activeOptions={{ exact: true }}
            activeProps={{ className: 'app-nav__tab is-active' }}
          >
            Feed
          </Link>
          <Link
            to="/app/explore"
            className="app-nav__tab"
            activeProps={{ className: 'app-nav__tab is-active' }}
          >
            Explore
          </Link>
        </nav>

        <div className="app-nav__actions">
          {isSignedIn && (
            <>
              <Link to="/new" className="app-nav__share">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Share</span>
              </Link>
              <NotificationBell />
            </>
          )}
          <BetterAuthHeader />
        </div>
      </div>
    </header>
  )
}
