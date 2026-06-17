import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { PostCard } from '#/components/PostCard'
import { loadHomeFeed } from '#/server/posts'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'
import { profileFieldLabel } from '#/lib/categories'
import { PeopleCard } from '#/components/PeopleCard'

type HomeSearch = {
  tab?: 'for-you' | 'following'
}

const feedMeta = buildPageMeta({
  path: '/app',
  title: 'Home',
  description: 'Curated and following workflows from practitioners on Onie.',
  noindex: true,
})

export const Route = createFileRoute('/app/')({
  head: () => ({
    meta: feedMeta.meta,
    links: feedMeta.links,
  }),
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    tab: search.tab === 'following' ? 'following' : 'for-you',
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const tab = deps.tab ?? 'for-you'
    return loadHomeFeed({ data: { tab } })
  },
  component: FeedPage,
})

function FeedPage() {
  const navigate = useNavigate()
  const { posts, topThisWeek, suggested, tab, field, isGuest } = Route.useLoaderData()
  const fieldLabel = profileFieldLabel(field)

  const setTab = (next: 'for-you' | 'following') => {
    if (next === 'following' && isGuest) {
      void navigate({
        to: '/login',
        search: loginSearch({ redirect: '/app', signup: true }),
      })
      return
    }
    void navigate({ to: '/app', search: { tab: next } })
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Home</p>
        <h1 className="app-page__title">
          {tab === 'following' ? 'Following' : 'For you'}
        </h1>
        <p className="app-page__lede">
          {tab === 'following'
            ? 'Workflows from people you follow.'
            : 'Curated workflows, trending this week, and picks in your field.'}
        </p>
      </header>

      {isGuest && (
        <div className="app-banner">
          <p>Browsing as a guest — sign in to follow builders and personalize your feed.</p>
          <Link
            to="/login"
            className="btn btn--compact"
            search={loginSearch({ redirect: '/app', signup: true })}
          >
            <span className="btn__label">Sign in</span>
          </Link>
        </div>
      )}

      <div className="feed-tabs" role="tablist" aria-label="Feed views">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'for-you'}
          className={`feed-tab${tab === 'for-you' ? ' is-active' : ''}`}
          onClick={() => setTab('for-you')}
        >
          For you
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'following'}
          className={`feed-tab${tab === 'following' ? ' is-active' : ''}`}
          onClick={() => setTab('following')}
        >
          Following
        </button>
      </div>

      {tab === 'for-you' && topThisWeek.length > 0 && (
        <section className="app-section" aria-labelledby="home-trending-h">
          <h2 className="app-section__title" id="home-trending-h">
            Top this week
          </h2>
          <ol className="ledger" aria-label="Top workflows this week">
            {topThisWeek.map((post, index) => (
              <PostCard key={post.id} post={post} ranked={index + 1} variant="ledger" />
            ))}
          </ol>
        </section>
      )}

      <section className="app-section" aria-labelledby="home-feed-h">
        <h2 className="app-section__title" id="home-feed-h">
          {tab === 'following' ? 'From people you follow' : 'Recommended'}
        </h2>
        <ol className="ledger" aria-label="Feed">
          {posts.length === 0 ? (
            <li className="feed-empty">
              <p>
                {tab === 'following'
                  ? isGuest
                    ? 'Sign in to follow builders and see their workflows here.'
                    : 'Your feed is quiet. Follow builders on Explore, or share something from your practice.'
                  : 'Nothing to show yet. Explore the community or publish a workflow.'}
              </p>
              <div className="feed-empty__actions">
                <Link to="/app/explore" className="btn">
                  <span className="btn__label">Explore workflows</span>
                </Link>
                {isGuest ? (
                  <Link
                    to="/login"
                    className="btn btn--compact"
                    search={loginSearch({ redirect: '/app', signup: true })}
                  >
                    <span className="btn__label">Sign in</span>
                  </Link>
                ) : (
                  <Link to="/new" className="btn btn--compact">
                    <span className="btn__label">Share a workflow</span>
                  </Link>
                )}
              </div>
            </li>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} variant="ledger" />)
          )}
        </ol>
      </section>

      {tab === 'for-you' && suggested.length > 0 && (
        <section className="app-section" aria-labelledby="suggested-h">
          <h2 className="app-section__title" id="suggested-h">
            {fieldLabel ? `Builders in ${fieldLabel}` : 'Suggested builders'}
          </h2>
          <ul className="people-grid">
            {suggested.map((person) => (
              <PeopleCard
                key={person.id}
                username={person.username}
                name={person.user.name}
                image={person.user.image}
                userId={person.user.id}
                meta={`${person.user._count.posts} workflows · ${person.user._count.followers} followers`}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
