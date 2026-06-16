import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import type { Category, PostKind } from '#/generated/prisma/client'
import { categoryLabel } from '#/lib/categories'
import { kindLabel } from '#/lib/kinds'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader } from '#/components/ui/card'
import { PostEngagement } from '#/components/PostEngagement'
import { cn } from '#/lib/utils'
import { isExamplePost } from '#/lib/example-content'
import { Pin, TrendingUp } from 'lucide-react'

export type PostCardData = {
  id: string
  title: string
  description: string | null
  category: Category
  kind: PostKind
  tools: string[]
  createdAt: Date | string
  author: {
    id: string
    name: string
    image: string | null
    profile: {
      username: string
      field: Category
    } | null
  }
  _count?: {
    likes: number
    comments: number
  }
}

export function PostCard({
  post,
  pinned,
  ranked,
  className,
  variant = 'card',
  actions,
}: {
  post: PostCardData
  pinned?: boolean
  ranked?: number
  className?: string
  variant?: 'card' | 'ledger'
  actions?: ReactNode
}) {
  const username = post.author.profile?.username
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const likeCount = post._count?.likes ?? 0
  const commentCount = post._count?.comments ?? 0
  const example = isExamplePost({ id: post.id, author: post.author })

  if (variant === 'ledger') {
    const meta = [
      example ? 'Example' : null,
      kindLabel(post.kind),
      categoryLabel(post.category),
      username ? post.author.name : null,
      `${likeCount} likes · ${commentCount} comments`,
      pinned ? 'Pinned' : null,
      ranked !== undefined ? `#${ranked}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    return (
      <li className={cn('ledger__row', actions && 'ledger__row--actions', className)}>
        <span className="ledger__year">{date}</span>
        <Link
          to="/p/$postId"
          params={{ postId: post.id }}
          className="ledger__name"
        >
          {post.title}
        </Link>
        <span className="ledger__kind">{meta}</span>
        {actions ? <div className="ledger__actions">{actions}</div> : null}
      </li>
    )
  }

  return (
    <Card
      className={cn(
        'group border-[var(--line)] bg-[var(--surface-strong)] shadow-none transition hover:border-[var(--accent)]/30 hover:shadow-sm',
        className,
      )}
    >
      <CardHeader className="space-y-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {username ? (
              <Link to="/u/$username" params={{ username }} className="shrink-0">
                <Avatar className="h-9 w-9 border border-[var(--line)]">
                  <AvatarImage src={post.author.image ?? undefined} />
                  <AvatarFallback className="bg-[var(--code-bg)] text-xs font-medium">
                    {post.author.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Avatar className="h-9 w-9 border border-[var(--line)]">
                <AvatarFallback className="bg-[var(--code-bg)] text-xs font-medium">
                  ?
                </AvatarFallback>
              </Avatar>
            )}
            <div className="min-w-0">
              {username ? (
                <Link
                  to="/u/$username"
                  params={{ username }}
                  className="block truncate text-sm font-semibold text-[var(--ink)] no-underline hover:text-[var(--accent)]"
                >
                  {post.author.name}
                </Link>
              ) : (
                <span className="text-sm font-semibold">{post.author.name}</span>
              )}
              <p className="text-xs text-[var(--ink-muted)]">{date}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {example && (
              <Badge variant="outline" className="border-[var(--color-rule-2)] text-[var(--ink-muted)]">
                Example
              </Badge>
            )}
            {ranked !== undefined && (
              <Badge variant="outline" className="gap-1 border-[var(--accent)]/30 text-[var(--accent)]">
                <TrendingUp className="h-3 w-3" />
                #{ranked}
              </Badge>
            )}
            {pinned && (
              <Badge variant="outline" className="gap-1 border-[var(--accent)]/30 text-[var(--accent)]">
                <Pin className="h-3 w-3" />
                Pinned
              </Badge>
            )}
            <Badge variant="secondary" className="bg-[var(--code-bg)] text-[var(--ink-soft)]">
              {kindLabel(post.kind)}
            </Badge>
            <Badge variant="secondary" className="bg-[var(--code-bg)] text-[var(--ink-soft)]">
              {categoryLabel(post.category)}
            </Badge>
          </div>
        </div>
        <Link to="/p/$postId" params={{ postId: post.id }} className="no-underline">
          <h3 className="text-lg font-semibold leading-snug text-[var(--ink)] transition group-hover:text-[var(--accent)]">
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {post.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {post.description}
          </p>
        )}
        {post.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tools.slice(0, 5).map((tool) => (
              <Badge
                key={tool}
                variant="outline"
                className="font-mono text-[10px] uppercase tracking-wide"
              >
                {tool}
              </Badge>
            ))}
          </div>
        )}
        <PostEngagement
          postId={post.id}
          likeCount={likeCount}
          commentCount={commentCount}
        />
      </CardContent>
    </Card>
  )
}
