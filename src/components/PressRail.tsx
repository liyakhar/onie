import { Link } from '@tanstack/react-router'
import BetterAuthHeader from '#/integrations/better-auth/header-user'
import { NotificationBell } from '#/components/NotificationBell'
import { OnieIcon } from '#/components/OnieIcon'
import { authClient } from '#/lib/auth-client'

const SECTIONS = [
  { href: '#living', label: 'Intro' },
  { href: '#trending', label: 'Trending' },
  { href: '#work', label: 'Workflows' },
] as const

export default function PressRail() {
  const { data: session } = authClient.useSession()

  return (
    <nav className="rail" aria-label="Primary">
      <Link className="rail__mark" to="/">
        <OnieIcon size="sm" />
        <span className="rail__role" aria-hidden="true">
          workflows
        </span>
      </Link>

      <ul className="rail__dots" aria-label="Sections">
        {SECTIONS.map((section) => (
          <li key={section.href}>
            <a href={section.href} data-label={section.label}>
              <span className="rail__dot" />
            </a>
          </li>
        ))}
      </ul>

      <div className="rail__actions">
        <Link to="/explore" className="rail__action-link">
          Explore
        </Link>
        {session?.user && (
          <>
            <NotificationBell />
            <Link to="/new" className="rail__action-link">
              Share
            </Link>
          </>
        )}
        <BetterAuthHeader />
      </div>
    </nav>
  )
}
