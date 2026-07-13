import { createFileRoute, Link } from '@tanstack/react-router'
import { buildPageMeta, breadcrumbJsonLd, jsonLdScript } from '#/lib/seo'
import { site } from '#/lib/site'

const aboutMeta = buildPageMeta({
  path: '/about',
  title: 'About Wollie',
  description: 'Wollie is a calm budget that shows what you can spend.',
})

export const Route = createFileRoute('/about/')({
  head: () => ({
    meta: aboutMeta.meta,
    links: aboutMeta.links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]),
      ),
    ],
  }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">About</p>
        <h1 className="app-page__title">{site.name}</h1>
        <p className="app-page__lede">Budgeting without the chore.</p>
      </header>

      <article className="post-detail__body">
        <p>Connect accounts. Review less. Spend with a number.</p>
        <p><Link to="/app">Open the demo</Link>.</p>
      </article>
    </main>
  )
}
