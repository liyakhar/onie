import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugifyHeading } from '#/lib/markdown-toc'
import { cn } from '#/lib/utils'

export function MarkdownContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={cn('post-detail__prose', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const text = String(children)
            const id = slugifyHeading(text)
            return <h2 id={id}>{children}</h2>
          },
          h3: ({ children }) => {
            const text = String(children)
            const id = slugifyHeading(text)
            return <h3 id={id}>{children}</h3>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
