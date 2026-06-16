import type { BlogAuthor, BlogFaq } from '#/content/blog/types'

export function BlogAuthorCard({ author }: { author: BlogAuthor }) {
  return (
    <aside className="blog-author" aria-label="Author">
      <p className="blog-author__name">{author.name}</p>
      <p className="blog-author__role">{author.role}</p>
      <p className="blog-author__bio">{author.bio}</p>
    </aside>
  )
}

export function BlogFaqSection({ faqs }: { faqs: BlogFaq[] }) {
  return (
    <section className="blog-faq" aria-labelledby="blog-faq-heading">
      <h2 id="blog-faq-heading">Frequently asked</h2>
      <dl>
        {faqs.map((faq) => (
          <div key={faq.question} className="blog-faq__item">
            <dt>{faq.question}</dt>
            <dd>{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
