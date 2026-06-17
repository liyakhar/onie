import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

export function NotFoundPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void navigate({
      to: '/app/explore',
      search: q.trim() ? { q: q.trim() } : {},
    })
  }

  return (
    <main id="main" className="app-page not-found">
      <header className="app-page__head">
        <p className="app-page__eyebrow">404</p>
        <h1 className="app-page__title">Page not found</h1>
        <p className="app-page__lede">
          That workflow, profile, or URL doesn&apos;t exist. Search Explore or head back
          Home.
        </p>
      </header>

      <form className="landing-search not-found__search" onSubmit={handleSearch}>
        <Search className="landing-search__icon" aria-hidden="true" />
        <input
          className="landing-search__input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search workflows, tools, or people…"
        />
        <button type="submit" className="btn btn--compact">
          <span className="btn__label">Search</span>
        </button>
      </form>

      <div className="feed-empty__actions not-found__actions">
        <Link to="/app/explore" className="btn">
          <span className="btn__label">Explore workflows</span>
        </Link>
        <Link to="/app" className="btn btn--compact">
          <span className="btn__label">Go Home</span>
        </Link>
        <Link to="/" className="link-arrow">
          <span>Back to landing</span>
        </Link>
      </div>
    </main>
  )
}
