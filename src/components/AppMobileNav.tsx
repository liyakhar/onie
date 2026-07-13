import { Link } from '@tanstack/react-router'
import { Landmark, LayoutDashboard, ReceiptText, WalletCards } from 'lucide-react'
import { appNavActiveOptions } from '#/lib/nav-active'

export function AppMobileNav() {
  return (
    <nav className="app-mobile-nav" aria-label="Mobile navigation">
      <Link
        to="/app"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        <span>Home</span>
      </Link>
      <Link
        to="/app/transactions"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <ReceiptText className="h-5 w-5" aria-hidden="true" />
        <span>Activity</span>
      </Link>
      <Link
        to="/app/budgets"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <WalletCards className="h-5 w-5" aria-hidden="true" />
        <span>Budget</span>
      </Link>
      <Link
        to="/app/accounts"
        className="app-mobile-nav__item"
        activeOptions={appNavActiveOptions}
        activeProps={{ className: 'app-mobile-nav__item is-active' }}
      >
        <Landmark className="h-5 w-5" aria-hidden="true" />
        <span>Bank</span>
      </Link>
    </nav>
  )
}
