import { createFileRoute, Link } from '@tanstack/react-router'
import type { Category, PostKind } from '#/generated/prisma/client'
import { FeedSearchBar } from '#/components/FeedSearchBar'
import { PostCard } from '#/components/PostCard'
import { getFeedPosts, getTopWorkflowsWeek } from '#/server/posts'
import { searchProfiles } from '#/server/profiles'
import { categoryLabel } from '#/lib/categories'
import { isExampleAuthor } from '#/lib/example-content'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { breadcrumbJsonLd, buildPageMeta, jsonLdScript } from '#/lib/seo'

const exploreMeta = buildPageMeta({
  path: '/app/explore',
  title: 'Explore agent workflows',
  description:
    'Discover agent workflows and practitioners by field, tool, or keyword — prompts, skills, and setups from the Onie community.',
})

type ExploreSearch = {
  q?: string
  category?: Category
  kind?: PostKind
}

export const Route = createFileRoute('/app/explore')({
  head: () => ({
    meta: exploreMeta.meta,
    links: exploreMeta.links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Explore', path: '/app/explore' },
        ]),
      ),
    ],
  }),
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    category:
      typeof search.category === 'string'
        ? (search.category as Category)
        : undefined,
    kind:
      typeof search.kind === 'string' ? (search.kind as PostKind) : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [posts, people, topThisWeek] = await Promise.all([
      getFeedPosts({
        data: {
          tab: 'discover',
          category: deps.category,
          kind: deps.kind,
          q: deps.q,
        },
      }),
      searchProfiles({ data: { category: deps.category, q: deps.q } }),
      !deps.q && !deps.category && !deps.kind ? getTopWorkflowsWeek() : Promise.resolve([]),
    ])
    return { posts, people, topThisWeek }
  },
  component: ExplorePage,
})

function ExplorePage() {
  const { q, category, kind } = Route.useSearch()
  const { posts, people, topThisWeek } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const hasFilters = Boolean(q || category || kind)
  const isSignedIn = Boolean(session?.user)

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Discover</p>
        <h1 className="app-page__title">Explore</h1>
        <p className="app-page__lede">
          Find workflows and people by type, field, tool, or keyword.
        </p>
      </header>

      <div className="feed-controls">
        <FeedSearchBar q={q} category={category} kind={kind} basePath="/app/explore" />
      </div>

      {!hasFilters && topThisWeek.length > 0 && (
        <section className="app-section" aria-labelledby="trending-h">
          <h2 className="app-section__title" id="trending-h">
            Top this week
          </h2>
          <ol className="ledger" aria-label="Top workflows this week">
            {topThisWeek.map((post, index) => (
              <PostCard key={post.id} post={post} ranked={index + 1} variant="ledger" />
            ))}
          </ol>
        </section>
      )}

      {people.length > 0 && (
        <section className="app-section" aria-labelledby="people-h">
          <h2 className="app-section__title" id="people-h">
            People
          </h2>
          <ul className="people-grid">
            {people.map((person) => (
              <li key={person.id}>
                <Link
                  to="/u/$username"
                  params={{ username: person.username }}
                  className="people-card"
                >
                  <Avatar className="people-card__avatar">
                    <AvatarImage src={person.user.image ?? undefined} />
                    <AvatarFallback>{person.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="people-card__body">
                    <p className="people-card__name">
                      {person.user.name}
                      {isExampleAuthor(person.user.id) && (
                        <span className="people-card__tag">Example</span>
                      )}
                    </p>
                    <p className="people-card__handle">@{person.username}</p>
                    <p className="people-card__meta">
                      {categoryLabel(person.field)} · {person.user._count.posts} workflows
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="app-section" aria-labelledby="workflows-h">
        <h2 className="app-section__title" id="workflows-h">
          Workflows
        </h2>
        <ol className="ledger" aria-label="Workflow results">
          {posts.length === 0 ? (
            <li className="feed-empty">
              {hasFilters ? (
                <p>No matches. Try another type, field, or keyword.</p>
              ) : (
                <>
                  <p className="feed-empty__title">Explore is getting started.</p>
                  <p>
                    No workflows published yet. Read a guide for inspiration, sign in to
                    follow builders, or share a setup you already run.
                  </p>
                  <div className="feed-empty__actions">
                    <Link to="/blog" className="btn btn--compact">
                      <span className="btn__label">Read guides</span>
                    </Link>
                    {isSignedIn ? (
                      <Link to="/new" className="btn btn--compact">
                        <span className="btn__label">Publish workflow</span>
                      </Link>
                    ) : (
                      <Link to="/login" className="btn btn--compact">
                        <span className="btn__label">Sign in</span>
                      </Link>
                    )}
                    {!isSignedIn && (
                      <Link to="/new" className="link-arrow">
                        <span>Publish workflow</span>
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
                </>
              )}
            </li>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} variant="ledger" />)
          )}
        </ol>
      </section>
    </main>
  )
}
