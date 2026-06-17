import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { isBookmarked, toggleBookmark } from '#/lib/bookmarks'
import { cn } from '#/lib/utils'

export function BookmarkButton({
  postId,
  className,
}: {
  postId: string
  className?: string
}) {
  const [saved, setSaved] = useState(() => isBookmarked(postId))

  const handleClick = () => {
    const next = toggleBookmark(postId)
    setSaved(next)
  }

  return (
    <button
      type="button"
      className={cn('post-action', saved && 'is-active', className)}
      onClick={handleClick}
      aria-pressed={saved}
    >
      <Bookmark className="h-3.5 w-3.5" aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
