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
          <Link to="/app">Feed</Link>
          <span className="foot__sep" aria-hidden="true">
            ·
          </span>
          <Link to="/app/explore">Explore</Link>
          <span className="foot__sep" aria-hidden="true">
            ·
          </span>
          <Link to="/blog">Blog</Link>
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
      <p className="foot__tag">
        Share the skills, prompts, and harnesses that actually work in your field.
      </p>
      <p className="foot__set">
        Set in Bricolage Grotesque &amp; Fraunces, with JetBrains Mono for the margins.
        Built for builders working with AI agents.
      </p>
      <p className="foot__links">
        <Link to="/app/explore">Explore</Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/blog">Blog</Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/about">About</Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <Link to="/login" search={loginSearch({ signup: true })}>
          Get started
        </Link>
        <span className="foot__sep" aria-hidden="true">
          ·
        </span>
        <a href="#index">Top</a>
      </p>
    </footer>
  )
}
