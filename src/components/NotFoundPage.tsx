import { Link } from '@tanstack/react-router'
export function NotFoundPage() {
  return (
    <main id="main" className="app-page not-found">
      <header className="app-page__head">
        <p className="app-page__eyebrow">404</p>
        <h1 className="app-page__title">Page not found</h1>
        <p className="app-page__lede">
          That page is gone or moved. Open your budget or go back home.
        </p>
      </header>

      <div className="feed-empty__actions not-found__actions">
        <Link to="/app" className="btn">
          <span className="btn__label">Open demo</span>
        </Link>
        <Link to="/" className="btn btn--compact">
          <span className="btn__label">Home</span>
        </Link>
      </div>
    </main>
  )
}
