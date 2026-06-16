import { useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { createComment } from '#/server/comments'
import { authClient } from '#/lib/auth-client'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'

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
    <section className="mt-10 border-t border-[var(--line)] pt-8">
      <h2 className="mb-6 text-lg font-semibold text-[var(--ink)]">
        Comments ({comments.length})
      </h2>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="mb-8 grid gap-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ask a question or share how you adapted this workflow..."
            rows={3}
            className="border-[var(--line)] resize-none"
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !content.trim()}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            >
              {loading ? 'Posting…' : 'Post comment'}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mb-8 text-sm text-[var(--ink-soft)]">
          <Link to="/login" className="font-medium text-[var(--accent)]">
            Sign in
          </Link>{' '}
          to join the discussion.
        </p>
      )}

      <div className="space-y-5">
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--ink-muted)]">
            No comments yet. Be the first to respond.
          </p>
        ) : (
          comments.map((comment) => {
            const username = comment.author.profile?.username
            const date = new Date(comment.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })

            return (
              <article
                key={comment.id}
                className="flex gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-4"
              >
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
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {username ? (
                      <Link
                        to="/u/$username"
                        params={{ username }}
                        className="text-sm font-semibold text-[var(--ink)] no-underline hover:text-[var(--accent)]"
                      >
                        {comment.author.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold">{comment.author.name}</span>
                    )}
                    <span className="text-xs text-[var(--ink-muted)]">{date}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-soft)]">
                    {comment.content}
                  </p>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}
