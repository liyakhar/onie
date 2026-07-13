import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'
import { appNavActiveOptions } from '#/lib/nav-active'

const financeNav = [
  { to: '/app' as const, label: 'Dashboard' },
  { to: '/app/transactions' as const, label: 'Activity' },
  { to: '/app/budgets' as const, label: 'Budgets' },
  { to: '/app/accounts' as const, label: 'Accounts' },
]

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

        <nav className="app-nav__tabs" aria-label="App sections">
          {financeNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="app-nav__tab"
              activeOptions={appNavActiveOptions}
              activeProps={{ className: 'app-nav__tab is-active' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
