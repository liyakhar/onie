import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Heart, MessageCircle } from 'lucide-react'
import { toggleLike } from '#/server/posts'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type PostEngagementProps = {
  postId: string
  likeCount: number
  commentCount: number
  likedByMe?: boolean
  interactive?: boolean
  onChange?: (next: { likeCount: number; likedByMe: boolean }) => void
  className?: string
}

export function PostEngagement({
  postId,
  likeCount: initialLikes,
  commentCount,
  likedByMe: initialLiked = false,
  interactive = false,
  onChange,
  className,
}: PostEngagementProps) {
  const { data: session } = authClient.useSession()
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [likedByMe, setLikedByMe] = useState(initialLiked)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (!interactive || loading) return

    if (!session?.user) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    try {
      const result = await toggleLike({ data: { postId } })
      setLikeCount(result.likeCount)
      setLikedByMe(result.liked)
      onChange?.({ likeCount: result.likeCount, likedByMe: result.liked })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('flex items-center gap-4 text-sm text-[var(--ink-muted)]', className)}>
      {interactive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={handleLike}
          className={cn(
            'h-8 gap-1.5 px-2 text-[var(--ink-muted)] hover:text-[var(--accent)]',
            likedByMe && 'text-[var(--accent)]',
          )}
        >
          <Heart className={cn('h-4 w-4', likedByMe && 'fill-current')} />
          {likeCount}
        </Button>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4" />
          {likeCount}
        </span>
      )}
      <Link
        to="/p/$postId"
        params={{ postId }}
        className="inline-flex items-center gap-1.5 no-underline hover:text-[var(--ink)]"
      >
        <MessageCircle className="h-4 w-4" />
        {commentCount}
      </Link>
    </div>
  )
}
