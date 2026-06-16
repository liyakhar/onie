import { Link } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { OnieIcon } from '#/components/OnieIcon'

export default function LandingNav() {
  const { data: session } = authClient.useSession()

  return (
    <nav className="rail rail--landing" aria-label="Primary">
      <Link className="rail__mark" to="/">
        <OnieIcon size="sm" />
        <span className="rail__role" aria-hidden="true">
          workflows
        </span>
      </Link>

      <ul className="rail__dots" aria-label="Sections">
        <li>
          <a href="#intro" data-label="Intro">
            <span className="rail__dot" />
          </a>
        </li>
        <li>
          <a href="#how" data-label="How it works">
            <span className="rail__dot" />
          </a>
        </li>
      </ul>

      <div className="rail__actions">
        {session?.user ? (
          <Link to="/app" className="btn btn--compact">
            <span className="btn__label">Open app</span>
          </Link>
        ) : (
          <>
            <Link to="/login" className="rail__action-link">
              Sign in
            </Link>
            <Link to="/login" className="btn btn--compact">
              <span className="btn__label">Get started</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
