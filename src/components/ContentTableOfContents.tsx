import { extractToc } from '#/lib/markdown-toc'
import { cn } from '#/lib/utils'

export function ContentTableOfContents({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  const items = extractToc(content)
  if (items.length < 3) return null

  return (
    <nav aria-label="Table of contents" className={cn('content-toc', className)}>
      <p className="content-toc__label">On this page</p>
      <ol className="content-toc__list">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(item.level === 3 && 'content-toc__item--nested')}
          >
            <a href={`#${item.id}`}>{item.label}</a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
