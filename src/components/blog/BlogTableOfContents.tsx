export function BlogTableOfContents({
  items,
}: {
  items: Array<{ id: string; label: string; level: 2 | 3 }>
}) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="blog-toc">
      <p className="blog-toc__label">On this page</p>
      <ol>
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? 'blog-toc__item--nested' : undefined}>
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
