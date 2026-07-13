import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import Footer from '#/components/Footer'
import { OnieMark } from '#/components/OnieMark'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta, jsonLdScript, webSiteJsonLd } from '#/lib/seo'

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
            See your money without spreadsheet work.
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

          <div className="finance-snapshot" aria-label="How Wollie starts">
            <div>
              <span>First</span>
              <strong>Connect bank</strong>
            </div>
            <div>
              <span>Then</span>
              <strong>Wollie sorts</strong>
            </div>
            <div>
              <span>Only if needed</span>
              <strong>You review</strong>
            </div>
          </div>
        </section>

        <section className="finance-principles finance-principles--minimal" aria-label="Product principles">
          <article>
            <span>Connect</span>
            <h2>Connect</h2>
            <p>Link accounts once.</p>
          </article>
          <article>
            <span>Review</span>
            <h2>Review</h2>
            <p>Only unclear charges.</p>
          </article>
          <article>
            <span>Spend</span>
            <h2>Spend</h2>
            <p>Know what you can spend.</p>
          </article>
        </section>

        <section className="finance-copy-band finance-copy-band--small" aria-labelledby="sync-note-title">
          <div>
            <p className="discovery-kicker">Bank sync</p>
            <h2 id="sync-note-title">Demo now. Live sync next.</h2>
          </div>
          <p>
            The current app shows sample data. Real bank connections will turn on after SimpleFIN
            credentials and auth are stable.
          </p>
          <Link to={session?.user ? '/app/accounts' : '/login'} search={session?.user ? undefined : loginSearch({ redirect: '/app/accounts', signup: true })}>
            Open Wollie
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>

      <Footer variant="landing" />
    </div>
  )
}
