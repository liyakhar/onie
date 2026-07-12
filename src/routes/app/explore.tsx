import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import type { Category, PostKind } from '#/generated/prisma/client'
import { FeedSearchBar } from '#/components/FeedSearchBar'
import { PostCard } from '#/components/PostCard'
import { getFeedPosts } from '#/server/posts'
import { searchProfiles } from '#/server/profiles'
import { profileFieldLabel } from '#/lib/categories'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { PeopleCard } from '#/components/PeopleCard'
import { breadcrumbJsonLd, buildPageMeta, jsonLdScript } from '#/lib/seo'
import { cn } from '#/lib/utils'

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
  tool?: string
  view?: 'workflows' | 'people'
}

function peopleMeta(person: {
  field: Category
  user: { _count: { posts: number; followers: number } }
}) {
  const fieldLabel = profileFieldLabel(person.field)
  const stats = `${person.user._count.followers} followers · ${person.user._count.posts} workflows`
  return fieldLabel ? `${fieldLabel} · ${stats}` : stats
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
  validateSearch: (search: Record<string, unknown>): ExploreSearch => {
    const view = search.view
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
      category:
        typeof search.category === 'string'
          ? (search.category as Category)
          : undefined,
      kind:
        typeof search.kind === 'string' ? (search.kind as PostKind) : undefined,
      tool: typeof search.tool === 'string' ? search.tool : undefined,
      view: view === 'people' || view === 'workflows' ? view : 'workflows',
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const hasFilters = Boolean(deps.q || deps.category || deps.kind || deps.tool)
    const view = deps.view ?? 'workflows'

    const [posts, people] = await Promise.all([
      view === 'workflows' || hasFilters
        ? getFeedPosts({
            data: {
              tab: 'discover',
              category: deps.category,
              kind: deps.kind,
              tool: deps.tool,
              q: deps.q,
            },
          })
        : Promise.resolve([]),
      view === 'people' || (hasFilters && deps.q)
        ? searchProfiles({
            data: {
              category: deps.category,
              q: deps.q,
              sort: 'popular',
            },
          })
        : Promise.resolve([]),
    ])
    return { posts, people, hasFilters }
  },
  component: ExplorePage,
})

function ExplorePage() {
  const navigate = useNavigate()
  const { q, category, kind, tool, view } = Route.useSearch()
  const { posts, people, hasFilters } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const isSignedIn = Boolean(session?.user)
  const activeView = hasFilters ? 'workflows' : (view ?? 'workflows')

  const setView = (next: ExploreSearch['view']) => {
    void navigate({
      to: '/app/explore',
      search: { q, category, kind, tool, view: next },
    })
  }

  const clearFilters = () => {
    void navigate({
      to: '/app/explore',
      search: { view: activeView },
    })
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <h1 className="app-page__title">Explore</h1>
        <p className="app-page__lede">
          Find workflows and people by type, field, tool, or keyword.
        </p>
      </header>

      <div className="feed-controls feed-controls--sticky">
        <FeedSearchBar
          q={q}
          category={category}
          kind={kind}
          tool={tool}
          basePath="/app/explore"
          view={activeView}
          hasActiveFilters={hasFilters}
          onClearFilters={clearFilters}
        />
      </div>

      {!hasFilters && (
        <div className="feed-tabs feed-tabs--segmented" role="tablist" aria-label="Explore views">
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'workflows'}
            className={cn('feed-tab', activeView === 'workflows' && 'is-active')}
            onClick={() => setView('workflows')}
          >
            Workflows
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'people'}
            className={cn('feed-tab', activeView === 'people' && 'is-active')}
            onClick={() => setView('people')}
          >
            People
          </button>
        </div>
      )}

      {activeView === 'people' && !hasFilters && (
        <section className="app-section" aria-labelledby="people-h">
          <h2 className="app-section__title" id="people-h">
            People
          </h2>
          {people.length === 0 ? (
            <p className="feed-empty">No people to show yet.</p>
          ) : (
            <ul className="people-grid">
              {people.map((person) => (
                <PeopleCard
                  key={person.id}
                  username={person.username}
                  name={person.user.name}
                  image={person.user.image}
                  meta={peopleMeta(person)}
                />
              ))}
            </ul>
          )}
        </section>
      )}

      {(activeView === 'workflows' || hasFilters) && (
        <section className="app-section" aria-labelledby="workflows-h">
          <h2 className="app-section__title" id="workflows-h">
            Workflows
          </h2>
          <ol className="ledger" aria-label="Workflow results">
            {posts.length === 0 ? (
              <li className="feed-empty">
                {hasFilters ? (
                  <p>No matches. Try another type, field, tool, or keyword.</p>
                ) : (
                  <>
                    <p className="feed-empty__title">Explore is getting started.</p>
                    <p>
                      No workflows published yet. Sign in to follow builders, or share a
                      setup you already run.
                    </p>
                    <div className="feed-empty__actions">
                      {isSignedIn ? (
                        <Link to="/new" className="btn">
                          <span className="btn__label">Publish</span>
                        </Link>
                      ) : (
                        <Link
                          to="/login"
                          className="btn"
                          search={loginSearch({ redirect: '/app/explore', signup: true })}
                        >
                          <span className="btn__label">Sign in</span>
                        </Link>
                      )}
                      <Link to="/app/explore" search={{ view: 'people' }} className="btn btn--compact">
                        <span className="btn__label">Browse people</span>
                      </Link>
                    </div>
                  </>
                )}
              </li>
            ) : (
              posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  ranked={!hasFilters ? index + 1 : undefined}
                  variant="ledger"
                />
              ))
            )}
          </ol>
        </section>
      )}

      {hasFilters && people.length > 0 && (
        <section className="app-section" aria-labelledby="people-filter-h">
          <h2 className="app-section__title" id="people-filter-h">
            People
          </h2>
          <ul className="people-grid">
            {people.map((person) => (
              <PeopleCard
                key={person.id}
                username={person.username}
                name={person.user.name}
                image={person.user.image}
                meta={peopleMeta(person)}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
