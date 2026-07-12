import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import Footer from '#/components/Footer'
import { OnieMark } from '#/components/OnieMark'
import { PostCard } from '#/components/PostCard'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { CATEGORIES } from '#/lib/categories'
import { buildPageMeta, jsonLdScript, webSiteJsonLd } from '#/lib/seo'
import { getFeedPosts } from '#/server/posts'

const landingMeta = buildPageMeta({
  path: '/',
  title: 'Find agent workflows that work',
  description:
    'Search practical agent workflows from people doing the work — prompts, tools, and setups organized by field.',
})

export const Route = createFileRoute('/')({
  head: () => ({
    meta: landingMeta.meta,
    links: landingMeta.links,
    scripts: [jsonLdScript(webSiteJsonLd())],
  }),
  loader: async () => {
    try {
      const popularWorkflows = (
        await getFeedPosts({ data: { tab: 'discover' } })
      ).slice(0, 8)
      return { popularWorkflows }
    } catch {
      return { popularWorkflows: [] }
    }
  },
  component: LandingPage,
})

function LandingPage() {
  const navigate = useNavigate()
  const { data: session } = authClient.useSession()
  const { popularWorkflows } = Route.useLoaderData()
  const [searchQ, setSearchQ] = useState('')

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    void navigate({
      to: '/app/explore',
      search: searchQ.trim() ? { q: searchQ.trim() } : {},
    })
  }

  return (
    <div className="discovery-page">
      <header className="discovery-nav">
        <Link to="/" aria-label="Onie home" className="discovery-nav__brand">
          <OnieMark variant="display" as="span" />
        </Link>
        <nav className="discovery-nav__links" aria-label="Main navigation">
          <Link to="/app/explore">Explore</Link>
          <Link to="/app">Feed</Link>
          {session?.user ? (
            <Link to="/new" className="discovery-nav__action">Publish</Link>
          ) : (
            <Link to="/login" search={loginSearch({ signup: false })}>
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main id="main" className="discovery-main">
        <section className="discovery-hero" aria-labelledby="discovery-title">
          <p className="discovery-kicker">The agent workflow directory</p>
          <h1 id="discovery-title">Find a workflow for the work in front of you.</h1>
          <p className="discovery-intro">
            Search the prompts, tools, and working setups shared by people who use them.
          </p>

          <form className="discovery-search" onSubmit={handleSearch} role="search">
            <Search aria-hidden="true" />
            <label className="sr-only" htmlFor="workflow-search">Search workflows</label>
            <input
              id="workflow-search"
              type="search"
              autoComplete="off"
              value={searchQ}
              onChange={(event) => setSearchQ(event.target.value)}
              placeholder="Try ‘research synthesis’ or ‘code review’"
            />
            <button type="submit" aria-label="Search workflows">
              <span>Search</span>
              <ArrowRight aria-hidden="true" />
            </button>
          </form>

          <div className="discovery-fields" aria-label="Browse workflows by field">
            <span>Browse:</span>
            {CATEGORIES.slice(0, 8).map((category) => (
              <Link
                key={category.value}
                to="/app/explore"
                search={{ category: category.value }}
              >
                {category.label}
              </Link>
            ))}
            <Link to="/app/explore">All fields</Link>
          </div>
        </section>

        <section className="discovery-results" aria-labelledby="popular-workflows-title">
          <div className="discovery-section-head">
            <div>
              <p>Start here</p>
              <h2 id="popular-workflows-title">Popular workflows</h2>
            </div>
            <Link to="/app/explore" className="discovery-section-link">
              Explore all <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {popularWorkflows.length > 0 ? (
            <ol className="ledger discovery-ledger" aria-label="Popular workflows">
              {popularWorkflows.map((post, index) => (
                <PostCard key={post.id} post={post} ranked={index + 1} variant="ledger" />
              ))}
            </ol>
          ) : (
            <div className="discovery-empty">
              <p>The workflow index is being prepared.</p>
              <Link to="/app/explore">Open Explore</Link>
            </div>
          )}
        </section>

        <section className="discovery-paths" aria-label="More ways to use Onie">
          <Link to="/app/explore">
            <span>01</span>
            <strong>Explore every workflow</strong>
            <small>Search by field, tool, person, or keyword.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/app">
            <span>02</span>
            <strong>Follow your field</strong>
            <small>Build a feed from practitioners you trust.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            to={session?.user ? '/new' : '/login'}
            search={session?.user ? undefined : loginSearch({ signup: true })}
          >
            <span>03</span>
            <strong>Share what works</strong>
            <small>Publish the setup behind your result.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer variant="landing" />
    </div>
  )
}
