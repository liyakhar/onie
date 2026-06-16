import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import Footer from '#/components/Footer'
import { BlogAuthorCard, BlogFaqSection } from '#/components/blog/BlogAuthorCard'
import { BlogBreadcrumbs } from '#/components/blog/BlogBreadcrumbs'
import { BlogMarkdown } from '#/components/blog/BlogMarkdown'
import { BlogTableOfContents } from '#/components/blog/BlogTableOfContents'
import { OnieMark } from '#/components/OnieMark'
import {
  extractToc,
  formatBlogDate,
  getBlogPost,
} from '#/lib/blog'
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildPageMeta,
  faqPageJsonLd,
  jsonLdScript,
} from '#/lib/seo'

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug)
    if (!post) {
      throw notFound()
    }
    return { post }
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post
    if (!post) return {}

    const path = `/blog/${params.slug}`
    const pageMeta = buildPageMeta({
      path,
      title: post.title,
      description: post.description,
      ogType: 'article',
    })

    const published = new Date(post.publishedAt).toISOString()
    const modified = new Date(post.updatedAt ?? post.publishedAt).toISOString()

    const article = articleJsonLd({
      title: post.title,
      description: post.description,
      path,
      publishedAt: published,
      updatedAt: modified,
      authorName: post.author.name,
    })

    const breadcrumbs = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog' },
      { name: post.title, path },
    ])

    const faq = faqPageJsonLd(post.faqs)

    const extraMeta = [
      { property: 'article:published_time', content: published },
      { property: 'article:modified_time', content: modified },
      { property: 'article:author', content: post.author.name },
    ]

    return {
      meta: [...pageMeta.meta, ...extraMeta],
      links: pageMeta.links,
      scripts: [jsonLdScript([article, breadcrumbs, faq])],
    }
  },
  component: BlogPostPage,
})

function BlogPostPage() {
  const { post } = Route.useLoaderData()
  const toc = extractToc(post.body)
  const related = (post.relatedSlugs ?? [])
    .map((slug) => getBlogPost(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))

  const publishedLabel = formatBlogDate(post.publishedAt)
  const updatedLabel = post.updatedAt ? formatBlogDate(post.updatedAt) : null

  return (
    <div className="blog-page">
      <header className="blog-page__header blog-page__header--compact">
        <Link to="/" className="blog-page__wordmark">
          <OnieMark variant="display" as="span" />
        </Link>
      </header>

      <main className="blog-article" id="main">
        <article className="blog-article__inner">
          <BlogBreadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Blog', to: '/blog' },
              { label: post.title },
            ]}
          />

          <header className="blog-article__head">
            <p className="blog-page__eyebrow">{post.primaryKeyword}</p>
            <h1>{post.title}</h1>
            <div className="blog-article__meta">
              <span>{post.author.name}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={post.publishedAt}>Published {publishedLabel}</time>
              {updatedLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.updatedAt}>Updated {updatedLabel}</time>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
            </div>
          </header>

          <div className="blog-article__tldr" role="note">
            <p className="blog-article__tldr-label">TL;DR</p>
            <p>{post.tldr}</p>
          </div>

          <div className="blog-article__layout">
            <BlogTableOfContents items={toc} />
            <div className="blog-article__content">
              <BlogMarkdown content={post.body} />
              <BlogFaqSection faqs={post.faqs} />
              <BlogAuthorCard author={post.author} />

              {related.length > 0 && (
                <section className="blog-related" aria-labelledby="related-heading">
                  <h2 id="related-heading">Related guides</h2>
                  <ul>
                    {related.map((relatedPost) => (
                      <li key={relatedPost.slug}>
                        <Link to="/blog/$slug" params={{ slug: relatedPost.slug }}>
                          {relatedPost.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="blog-cta" aria-labelledby="cta-heading">
                <h2 id="cta-heading">Browse real workflows</h2>
                <p>
                  See how practitioners document prompts, skills, and setups in the field — tagged
                  by discipline and stack.
                </p>
                <Link to="/app/explore" className="btn btn--compact">
                  <span className="btn__label">Open Explore</span>
                </Link>
              </section>
            </div>
          </div>
        </article>
      </main>

      <Footer variant="minimal" />
    </div>
  )
}
