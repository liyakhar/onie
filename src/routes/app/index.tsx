import { createFileRoute, Link } from '@tanstack/react-router'
import { PostCard } from '#/components/PostCard'
import { loadHomeFeed } from '#/server/posts'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'

const feedMeta = buildPageMeta({
  path: '/app',
  title: 'Feed',
  description: 'Workflows from builders you follow on Onie.',
  noindex: true,
})

export const Route = createFileRoute('/app/')({
  head: () => ({
    meta: feedMeta.meta,
    links: feedMeta.links,
  }),
  loader: async () => loadHomeFeed(),
  component: FeedPage,
})

function FeedPage() {
  const { posts, isGuest } = Route.useLoaderData()

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <h1 className="app-page__title">People you follow</h1>
      </header>

      {isGuest && (
        <div className="app-banner">
          <p>Sign in to follow builders and see their workflows here.</p>
          <Link
            to="/login"
            className="btn btn--compact"
            search={loginSearch({ redirect: '/app', signup: true })}
          >
            <span className="btn__label">Sign in</span>
          </Link>
        </div>
      )}

      <section className="app-section" aria-label="Following feed">
        <ol className="ledger">
          {posts.length === 0 ? (
            isGuest ? null : (
              <li className="feed-empty">
                <p>Follow builders on Explore to fill this feed.</p>
                <div className="feed-empty__actions">
                  <Link to="/app/explore" className="btn">
                    <span className="btn__label">Explore builders</span>
                  </Link>
                </div>
              </li>
            )
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} variant="ledger" />)
          )}
        </ol>
      </section>
    </main>
  )
}
