import { Link } from '@tanstack/react-router'
import { OnieMark } from '#/components/OnieMark'
import { loginSearch } from '#/lib/auth-nav'

export default function Footer({ variant = 'landing' }: { variant?: 'landing' | 'minimal' }) {
  if (variant === 'minimal') {
    return (
      <footer className="foot foot--minimal" role="contentinfo">
        <p className="foot__links">
          <Link to="/">Home</Link>
          <span className="foot__sep" aria-hidden="true">
            ·
          </span>
          <Link to="/app">Dashboard</Link>
          <span className="foot__sep" aria-hidden="true">
            ·
          </span>
          <Link to="/about">About</Link>
        </p>
      </footer>
    )
  }

  return (
    <footer className="foot" role="contentinfo">
      <OnieMark variant="display" as="p" />
      <p className="foot__tag">Money, made quiet.</p>
      <p className="foot__links">
        <Link to="/app">Dashboard</Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/app/accounts">Bank sync</Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/login" search={loginSearch({ signup: true })}>
          Start
        </Link>
        <span className="foot__sep" aria-hidden="true">·</span>
        <Link to="/privacy">Privacy</Link>
        <span className="foot__sep" aria-hidden="true">·</span>
        <Link to="/terms">Terms</Link>
        <span className="foot__sep" aria-hidden="true">·</span>
        <Link to="/legal-notice">Legal</Link>
      </p>
    </footer>
  )
}
