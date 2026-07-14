import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'

export default function AppNav() {
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)

  return (
    <header className="app-nav" role="banner">
      <div className="app-nav__inner">
        <Link
          to={isSignedIn ? '/app' : '/'}
          className="app-nav__brand"
        >
          <OnieMark variant="nav" />
        </Link>

        <Link
          to={isSignedIn ? '/app' : '/'}
          className="app-nav__single"
        >
          Dashboard
        </Link>

        <div className="app-nav__actions">
          {isSignedIn && (
            <Link to="/app/accounts" className="app-nav__share">
              <span>Sync</span>
            </Link>
          )}
          <BetterAuthHeader />
        </div>
      </div>
    </header>
  )
}
