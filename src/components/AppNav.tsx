import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  ChartNoAxesCombined,
  Landmark,
  LayoutDashboard,
  ListFilter,
  CreditCard,
  Settings,
  Users,
} from 'lucide-react'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'

export default function AppNav({ locked = false }: { locked?: boolean }) {
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)

  return (
    <aside className="app-nav">
      <div className="app-nav__inner">
        <Link to="/" className="app-nav__brand" aria-label="Wollie home">
          <OnieMark variant="nav" />
        </Link>

        {!locked && <nav className="app-nav__tabs" aria-label="Primary">
          <p className="app-nav__section-label">Your money</p>
          <Link to="/app" activeOptions={{ exact: true }} className="app-nav__tab" activeProps={{ className: 'app-nav__tab is-active' }}>
            <LayoutDashboard aria-hidden="true" />
            <span>Overview</span>
          </Link>
          <Link to="/app/transactions" className="app-nav__tab" activeProps={{ className: 'app-nav__tab is-active' }}>
            <ListFilter aria-hidden="true" />
            <span>Activity</span>
          </Link>
          <Link to="/app/budgets" className="app-nav__tab" activeProps={{ className: 'app-nav__tab is-active' }}>
            <ChartNoAxesCombined aria-hidden="true" />
            <span>Plan</span>
          </Link>
          <Link to="/app/recurring" className="app-nav__tab" activeProps={{ className: 'app-nav__tab is-active' }}>
            <CalendarDays aria-hidden="true" />
            <span>Bills</span>
          </Link>
        </nav>}

        <div className="app-nav__actions">
          {!locked && <Link
            to="/app/accounts"
            className="app-nav__account-link"
            activeProps={{ className: 'app-nav__account-link is-active' }}
          >
            <Landmark aria-hidden="true" />
            <span>Bank accounts</span>
          </Link>}
          {!locked && <Link
            to="/app/household"
            className="app-nav__account-link"
            activeProps={{ className: 'app-nav__account-link is-active' }}
          >
            <Users aria-hidden="true" />
            <span>Household</span>
          </Link>}
          <Link
            to="/pricing"
            search={{ checkout: undefined }}
            className="app-nav__account-link"
            activeProps={{ className: 'app-nav__account-link is-active' }}
          >
            <CreditCard aria-hidden="true" />
            <span>Pricing &amp; billing</span>
          </Link>
          {isSignedIn && (
            <Link
              to="/settings"
              className="app-nav__account-link"
              activeProps={{ className: 'app-nav__account-link is-active' }}
            >
              <Settings aria-hidden="true" />
              <span>Profile &amp; settings</span>
            </Link>
          )}
          <BetterAuthHeader />
        </div>
      </div>
    </aside>
  )
}
