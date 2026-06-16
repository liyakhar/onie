import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '#/lib/utils'

export function MarkdownContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'prose prose-neutral max-w-none dark:prose-invert',
        'prose-headings:font-semibold prose-headings:text-[var(--ink)]',
        'prose-p:text-[var(--ink-soft)] prose-p:leading-relaxed',
        'prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline',
        'prose-code:rounded prose-code:border prose-code:border-[var(--line)] prose-code:bg-[var(--code-bg)] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:rounded-lg prose-pre:border prose-pre:border-[var(--line)] prose-pre:bg-[var(--code-bg)] prose-pre:text-[var(--ink)]',
        'prose-li:text-[var(--ink-soft)] prose-strong:text-[var(--ink)]',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
