import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugifyHeading } from '#/lib/blog'

export function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="blog-prose">
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
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http')
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
