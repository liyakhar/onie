import { createFileRoute, Link } from '@tanstack/react-router'
import { PostCard } from '#/components/PostCard'
import { getFeedPosts } from '#/server/posts'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'

const feedMeta = buildPageMeta({
  path: '/app',
  title: 'Your feed',
  description: 'Workflows from practitioners you follow on Onie.',
  noindex: true,
})

export const Route = createFileRoute('/app/')({
  head: () => ({
    meta: feedMeta.meta,
    links: feedMeta.links,
  }),
  loader: async () => {
    const posts = await getFeedPosts({ data: { tab: 'following' } })
    return { posts }
  },
  component: FeedPage,
})

function FeedPage() {
  const { posts } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Your feed</p>
        <h1 className="app-page__title">Following</h1>
        <p className="app-page__lede">
          {isSignedIn
            ? 'Workflows from people you follow — the builders you chose to keep close.'
            : 'Sign in to follow builders and build a personalized feed. Until then, browse Explore.'}
        </p>
      </header>

      {!isSignedIn && (
        <div className="app-banner">
          <p>You are browsing as a guest.</p>
          <Link to="/login" className="btn btn--compact" search={loginSearch({ redirect: '/app' })}>
            <span className="btn__label">Sign in</span>
          </Link>
        </div>
      )}

      <ol className="ledger" aria-label="Following feed">
        {posts.length === 0 ? (
          <li className="feed-empty">
            <p>
              {isSignedIn
                ? 'Your feed is quiet. Follow builders on Explore, or share your first workflow.'
                : 'Nothing here yet without an account. Explore the community or sign in to follow people.'}
            </p>
            <div className="feed-empty__actions">
              <Link to="/app/explore" className="btn">
                <span className="btn__label">Explore workflows</span>
              </Link>
              {!isSignedIn && (
                <Link to="/login" className="link-arrow" search={loginSearch({ redirect: '/app' })}>
                  <span>Sign in</span>
                  <svg
                    className="link-arrow__glyph"
                    viewBox="0 0 24 12"
                    width="32"
                    height="16"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 6h22M17 1l5 5-5 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </li>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} variant="ledger" />)
        )}
      </ol>
    </main>
  )
}
