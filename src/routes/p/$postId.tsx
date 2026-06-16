import { useState } from 'react'
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { getPost, forkPost } from '#/server/posts'
import { getComments } from '#/server/comments'
import { categoryLabel } from '#/lib/categories'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { MarkdownContent } from '#/components/MarkdownContent'
import { PostEngagement } from '#/components/PostEngagement'
import { CommentsSection } from '#/components/CommentsSection'
import { authClient } from '#/lib/auth-client'
import { GitFork } from 'lucide-react'

export const Route = createFileRoute('/p/$postId')({
  loader: async ({ params }) => {
    const [post, comments] = await Promise.all([
      getPost({ data: { id: params.postId } }),
      getComments({ data: { postId: params.postId } }),
    ])
    if (!post) {
      throw notFound()
    }
    return { post, comments }
  },
  component: PostPage,
})

function PostPage() {
  const router = useRouter()
  const { post, comments } = Route.useLoaderData()
  const { data: session } = authClient.useSession()
  const [forking, setForking] = useState(false)
  const [forkError, setForkError] = useState('')

  const username = post.author.profile?.username
  const isOwn = session?.user?.id === post.author.id
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleFork = async () => {
    if (!session?.user) {
      void router.navigate({ to: '/login' })
      return
    }
    setForkError('')
    setForking(true)
    try {
      const forked = await forkPost({ data: { postId: post.id } })
      void router.navigate({ to: '/p/$postId', params: { postId: forked.id } })
    } catch (err) {
      setForkError(err instanceof Error ? err.message : 'Fork failed')
      setForking(false)
    }
  }

  return (
    <main className="page-wrap px-4 pb-12 pt-8">
      <article className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel(post.category)}</Badge>
          {post.tools.map((tool) => (
            <Badge key={tool} variant="outline" className="font-mono text-[10px] uppercase">
              {tool}
            </Badge>
          ))}
          {post.forkedFromId && (
            <Badge variant="outline" className="gap-1 border-violet-200 text-violet-600 dark:border-violet-800 dark:text-violet-400">
              <GitFork className="h-3 w-3" />
              Forked
            </Badge>
          )}
        </div>

        <h1 className="mb-4 text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">
          {post.title}
        </h1>

        {post.description && (
          <p className="mb-6 text-lg text-[var(--ink-soft)]">{post.description}</p>
        )}

        {post.forkedFromId && (
          <p className="mb-4 flex items-center gap-1.5 text-sm text-[var(--ink-muted)]">
            <GitFork className="h-3.5 w-3.5" />
            Forked from{' '}
            <Link
              to="/p/$postId"
              params={{ postId: post.forkedFromId }}
              className="font-medium text-[var(--accent)]"
            >
              original workflow
            </Link>
          </p>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-6">
          {username ? (
            <Link to="/u/$username" params={{ username }} className="flex items-center gap-3 no-underline">
              <Avatar className="h-10 w-10 border border-[var(--line)]">
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-[var(--ink)]">{post.author.name}</p>
                <p className="text-sm text-[var(--ink-muted)]">@{username} · {date}</p>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-[var(--ink-muted)]">{date}</p>
          )}
          <div className="flex items-center gap-3">
            <PostEngagement
              postId={post.id}
              likeCount={post._count.likes}
              commentCount={post._count.comments}
              likedByMe={post.likedByMe}
              interactive
            />
            {!isOwn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFork}
                disabled={forking}
                className="gap-1.5 border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
              >
                <GitFork className="h-3.5 w-3.5" />
                {forking ? 'Forking…' : 'Fork'}
              </Button>
            )}
          </div>
        </div>

        {forkError && (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {forkError}
          </p>
        )}

        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 sm:p-8">
          <MarkdownContent content={post.content} />
        </div>

        <CommentsSection postId={post.id} initialComments={comments} />
      </article>
    </main>
  )
}
