import { createFileRoute, Link } from '@tanstack/react-router'
import { buildPageMeta, breadcrumbJsonLd, jsonLdScript } from '#/lib/seo'
import { site } from '#/lib/site'

const aboutMeta = buildPageMeta({
  path: '/about',
  title: 'About Onie',
  description:
    'Onie is a public feed of agent workflows from practitioners — prompts, skills, and setups tagged by discipline and stack.',
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
        <p className="app-page__lede">{site.description}</p>
      </header>

      <article className="post-detail__body">
        <p>
          We built Onie because the setups that make AI agents useful in real practice
          rarely travel beyond private chats and local folders.
        </p>
        <p>
          Each workflow documents what practitioners run, how it is wired, and which
          tools it depends on — tagged by discipline and stack so you can filter to
          your field in{' '}
          <Link to="/app/explore">Explore</Link>.
        </p>
        <p>
          Follow peers in your discipline, publish the harnesses you rely on, and fork
          workflows to adapt them to your own stack.
        </p>
      </article>
    </main>
  )
}
