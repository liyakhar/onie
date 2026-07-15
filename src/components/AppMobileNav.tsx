import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  ChartNoAxesCombined,
  Landmark,
  LayoutDashboard,
  ListFilter,
} from 'lucide-react'

export function AppMobileNav({ locked = false }: { locked?: boolean }) {
  if (locked) return null
  return (
    <nav className="app-mobile-nav" aria-label="Mobile primary">
      <Link to="/app" activeOptions={{ exact: true }} className="app-mobile-nav__item" activeProps={{ className: 'app-mobile-nav__item is-active' }}>
        <LayoutDashboard aria-hidden="true" />
        <span>Overview</span>
      </Link>
      <Link to="/app/transactions" className="app-mobile-nav__item" activeProps={{ className: 'app-mobile-nav__item is-active' }}>
        <ListFilter aria-hidden="true" />
        <span>Activity</span>
      </Link>
      <Link to="/app/budgets" className="app-mobile-nav__item" activeProps={{ className: 'app-mobile-nav__item is-active' }}>
        <ChartNoAxesCombined aria-hidden="true" />
        <span>Plan</span>
      </Link>
      <Link to="/app/recurring" className="app-mobile-nav__item" activeProps={{ className: 'app-mobile-nav__item is-active' }}>
        <CalendarDays aria-hidden="true" />
        <span>Bills</span>
      </Link>
      <Link to="/app/accounts" className="app-mobile-nav__item" activeProps={{ className: 'app-mobile-nav__item is-active' }}>
        <Landmark aria-hidden="true" />
        <span>Accounts</span>
      </Link>
    </nav>
  )
}
