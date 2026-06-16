import { createFileRoute, Link } from '@tanstack/react-router'
import Footer from '#/components/Footer'
import { OnieMark } from '#/components/OnieMark'
import { formatBlogDate, getAllBlogPosts } from '#/lib/blog'
import { buildPageMeta, breadcrumbJsonLd, jsonLdScript } from '#/lib/seo'

const blogIndexMeta = buildPageMeta({
  path: '/blog',
  title: 'Agent workflow guides',
  description:
    'Practical guides on Claude Code skills, agent harnesses, and documenting workflows — written for practitioners who ship with AI agents.',
})

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: blogIndexMeta.meta,
    links: blogIndexMeta.links,
    scripts: [
      jsonLdScript(
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]),
      ),
    ],
  }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  const posts = getAllBlogPosts()
  const [featured, ...rest] = posts

  return (
    <div className="blog-page">
      <header className="blog-page__header">
        <Link to="/" className="blog-page__wordmark">
          <OnieMark variant="display" as="span" />
        </Link>
        <p className="blog-page__eyebrow">Guides</p>
        <h1 className="blog-page__title">Agent workflow advice, plainly written.</h1>
        <p className="blog-page__lede">
          Skills, harnesses, and documentation patterns from people who run agents in real
          work — not generic prompt lists.
        </p>
      </header>

      <main className="blog-page__main" id="main">
        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="blog-card blog-card--featured"
          >
            <div className="blog-card__meta">
              <time dateTime={featured.publishedAt}>{formatBlogDate(featured.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{featured.readingMinutes} min read</span>
              <span aria-hidden="true">·</span>
              <span>{featured.author.name}</span>
            </div>
            <h2 className="blog-card__title">{featured.title}</h2>
            <p className="blog-card__excerpt">{featured.description}</p>
            <span className="blog-card__cta">Read the guide →</span>
          </Link>
        )}

        {rest.length > 0 && (
          <ul className="blog-list">
            {rest.map((post) => (
              <li key={post.slug}>
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="blog-card">
                  <div className="blog-card__meta">
                    <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingMinutes} min read</span>
                  </div>
                  <h2 className="blog-card__title">{post.title}</h2>
                  <p className="blog-card__excerpt">{post.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer variant="minimal" />
    </div>
  )
}
