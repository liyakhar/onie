import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import Footer from '#/components/Footer'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta, jsonLdScript, webSiteJsonLd } from '#/lib/seo'
import { formatMoney, getDemoFinanceSummary } from '#/lib/finance-demo'

const landingMeta = buildPageMeta({
  path: '/',
  title: 'Calm money',
  description:
    'Wollie syncs accounts, sorts spending, and shows what you can spend this month.',
})

export const Route = createFileRoute('/')({
  head: () => ({
    meta: landingMeta.meta,
    links: landingMeta.links,
    scripts: [jsonLdScript(webSiteJsonLd())],
  }),
  component: LandingPage,
})

function LandingPage() {
  const { data: session } = authClient.useSession()
  const summary = getDemoFinanceSummary()

  return (
    <div className="discovery-page finance-landing">
      <header className="discovery-nav">
        <Link to="/" aria-label="Wollie home" className="discovery-nav__brand">
          <OnieMark variant="display" as="span" />
        </Link>
        <nav className="discovery-nav__links" aria-label="Main navigation">
          <Link to="/app">Dashboard</Link>
          <Link to="/app/accounts">Sync</Link>
          {session?.user ? (
            <Link to="/app" className="discovery-nav__action">Open app</Link>
          ) : (
            <Link to="/login" search={loginSearch({ signup: false })}>
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main id="main" className="discovery-main">
        <section className="discovery-hero finance-hero" aria-labelledby="landing-title">
          <p className="discovery-kicker">Wollie</p>
          <h1 id="landing-title">Money, made quiet.</h1>
          <p className="discovery-intro">
            A budget that updates itself.
          </p>

          <div className="finance-hero__actions">
            <Link
              to={session?.user ? '/app' : '/login'}
              search={session?.user ? undefined : loginSearch({ redirect: '/app', signup: true })}
              className="btn finance-hero__primary"
            >
              <span className="btn__label">Open demo</span>
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link to="/app/accounts" className="finance-hero__secondary">
              Bank sync
            </Link>
          </div>

          <div className="finance-snapshot" aria-label="Demo budget snapshot">
            <div>
              <span>Can spend</span>
              <strong>{formatMoney(summary.safeToSpend)}</strong>
            </div>
            <div>
              <span>Cash position</span>
              <strong>{formatMoney(summary.cash)}</strong>
            </div>
            <div>
              <span>Needs review</span>
              <strong>{summary.reviewCount}</strong>
            </div>
          </div>
        </section>

        <section className="finance-principles finance-principles--minimal" aria-label="Product principles">
          <article>
            <span>01</span>
            <h2>Connect</h2>
            <p>Link your accounts once.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Sort</h2>
            <p>Spending lands in the right place.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Spend</h2>
            <p>Know what you can spend.</p>
          </article>
        </section>

        <section className="finance-copy-band" aria-labelledby="wollie-for-title">
          <p className="discovery-kicker">Built for</p>
          <h2 id="wollie-for-title">People who do not want to “do budgeting.”</h2>
          <p>
            Wollie keeps the budget moving from your real transactions. You only review what looks
            unclear.
          </p>
        </section>

        <section className="discovery-paths finance-paths" aria-label="Budgeting flow">
          <Link to="/app/accounts">
            <span>01</span>
            <strong>Connect</strong>
            <small>Accounts and cards.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/app/transactions">
            <span>02</span>
            <strong>Review</strong>
            <small>Unclear charges.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/app/budgets">
            <span>03</span>
            <strong>Spend</strong>
            <small>What you can spend.</small>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>

        <section className="finance-copy-band finance-copy-band--small" aria-labelledby="sync-note-title">
          <p className="discovery-kicker">Bank sync</p>
          <h2 id="sync-note-title">Paid sync. No hidden cost.</h2>
          <p>
            Demo mode is free. Real bank connections require a paid plan or a user-paid sync
            provider.
          </p>
        </section>
      </main>

      <Footer variant="landing" />
    </div>
  )
}
