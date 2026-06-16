import { useState } from 'react'
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { getPost, forkPost } from '#/server/posts'
import { getComments } from '#/server/comments'
import { categoryLabel } from '#/lib/categories'
import { kindLabel } from '#/lib/kinds'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { MarkdownContent } from '#/components/MarkdownContent'
import { PostEngagement } from '#/components/PostEngagement'
import { CommentsSection } from '#/components/CommentsSection'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { isExamplePost } from '#/lib/example-content'
import { GitFork, Pencil } from 'lucide-react'
import {
  articleJsonLd,
  breadcrumbJsonLd,
  buildPageMeta,
  jsonLdScript,
  pageDescription,
} from '#/lib/seo'

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
  head: ({ loaderData }) => {
    const post = loaderData?.post
    if (!post) return {}

    const description =
      post.description ??
      pageDescription(`Agent workflow by ${post.author.name} on Onie.`)

    const pageMeta = buildPageMeta({
      path: `/p/${post.id}`,
      title: post.title,
      description,
      ogType: 'article',
    })

    const breadcrumbs = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/app/explore' },
      { name: post.title, path: `/p/${post.id}` },
    ])

    const article = articleJsonLd({
      title: post.title,
      description,
      path: `/p/${post.id}`,
      publishedAt: new Date(post.createdAt).toISOString(),
      updatedAt: new Date(post.updatedAt).toISOString(),
      authorName: post.author.name,
      authorUrl: post.author.profile?.username
        ? `/u/${post.author.profile.username}`
        : undefined,
    })

    return {
      meta: pageMeta.meta,
      links: pageMeta.links,
      scripts: [jsonLdScript([article, breadcrumbs])],
    }
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
  const example = isExamplePost({ id: post.id, author: post.author })
  const date = new Date(post.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const handleFork = async () => {
    if (!session?.user) {
      void router.navigate({
        to: '/login',
        search: loginSearch({ redirect: `/p/${post.id}` }),
      })
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
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">
          {example && <span className="post-detail__example-tag">Example · </span>}
          {kindLabel(post.kind)} · {categoryLabel(post.category)}
        </p>
        <h1 className="app-page__title">{post.title}</h1>
        {post.description && <p className="app-page__lede">{post.description}</p>}
      </header>

      {post.tools.length > 0 && (
        <ul className="post-detail__tools" aria-label="Tools used">
          {post.tools.map((tool) => (
            <li key={tool} className="post-detail__tool">
              {tool}
            </li>
          ))}
        </ul>
      )}

      {post.forkedFromId && (
        <p className="post-detail__fork-note">
          <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
          Forked from{' '}
          <Link to="/p/$postId" params={{ postId: post.forkedFromId }}>
            original workflow
          </Link>
        </p>
      )}

      <div className="post-detail__meta">
        {username ? (
          <Link to="/u/$username" params={{ username }} className="post-detail__author">
            <Avatar className="h-10 w-10 border border-[var(--line)]">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="post-detail__author-name">{post.author.name}</p>
              <p className="post-detail__author-handle">
                @{username} ·{' '}
                <time dateTime={new Date(post.createdAt).toISOString()}>{date}</time>
              </p>
            </div>
          </Link>
        ) : (
          <p className="post-detail__author-handle">
            <time dateTime={new Date(post.createdAt).toISOString()}>{date}</time>
          </p>
        )}
        <div className="post-detail__actions">
          <PostEngagement
            postId={post.id}
            likeCount={post._count.likes}
            commentCount={post._count.comments}
            likedByMe={post.likedByMe}
            interactive
          />
          {isOwn ? (
            <Link to="/p/$postId/edit" params={{ postId: post.id }} className="feed-tab">
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleFork}
              disabled={forking}
              className="feed-tab"
            >
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
              {forking ? 'Forking…' : 'Fork'}
            </button>
          )}
        </div>
      </div>

      {forkError && <p className="post-detail__error">{forkError}</p>}

      <article className="post-detail__body">
        <MarkdownContent content={post.content} />
      </article>

      <CommentsSection postId={post.id} initialComments={comments} />
    </main>
  )
}
