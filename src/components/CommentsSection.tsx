import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { createComment } from '#/server/comments'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

type Comment = {
  id: string
  content: string
  createdAt: Date | string
  author: {
    id: string
    name: string
    image: string | null
    profile: { username: string } | null
  }
}

export function CommentsSection({
  postId,
  initialComments,
}: {
  postId: string
  initialComments: Comment[]
}) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      void router.navigate({ to: '/login' })
      return
    }

    setError('')
    setLoading(true)
    try {
      const comment = await createComment({ data: { postId, content } })
      setComments((prev) => [...prev, comment])
      setContent('')
      void router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="post-comments" aria-labelledby="comments-h">
      <h2 className="post-comments__title" id="comments-h">
        Comments ({comments.length})
      </h2>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="post-comments__form">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question or share how you adapted this workflow..."
            rows={4}
            className="post-comments__input"
          />
          {error && <p className="post-detail__error">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="btn btn--compact"
            >
              <span className="btn__label">{loading ? 'Posting…' : 'Post comment'}</span>
            </button>
          </div>
        </form>
      ) : (
        <p className="post-comments__signin">
          <Link to="/login">Sign in</Link> to join the discussion.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="post-comments__empty">No comments yet. Be the first to respond.</p>
      ) : (
        <ul className="post-comments__list">
          {comments.map((comment) => {
            const username = comment.author.profile?.username
            const date = new Date(comment.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })

            return (
              <li key={comment.id} className="post-comments__item">
                {username ? (
                  <Link to="/u/$username" params={{ username }} className="shrink-0">
                    <Avatar className="h-8 w-8 border border-[var(--line)]">
                      <AvatarImage src={comment.author.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {comment.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                ) : (
                  <Avatar className="h-8 w-8 shrink-0 border border-[var(--line)]">
                    <AvatarFallback className="text-xs">?</AvatarFallback>
                  </Avatar>
                )}
                <div className="post-comments__item-body">
                  <div className="post-comments__item-head">
                    {username ? (
                      <Link
                        to="/u/$username"
                        params={{ username }}
                        className="post-comments__item-name"
                      >
                        {comment.author.name}
                      </Link>
                    ) : (
                      <span className="post-comments__item-name">{comment.author.name}</span>
                    )}
                    <span className="post-comments__item-date">{date}</span>
                  </div>
                  <p className="post-comments__item-text">{comment.content}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
