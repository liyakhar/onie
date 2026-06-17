import { useState } from 'react'
import { createFileRoute, Link, notFound, useRouter } from '@tanstack/react-router'
import { getPost, forkPost } from '#/server/posts'
import { getComments } from '#/server/comments'
import { toggleFollow } from '#/server/profiles'
import { categoryLabel } from '#/lib/categories'
import { kindLabel } from '#/lib/kinds'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { MarkdownContent } from '#/components/MarkdownContent'
import { PostEngagement } from '#/components/PostEngagement'
import { CommentsSection } from '#/components/CommentsSection'
import { ContentTableOfContents } from '#/components/ContentTableOfContents'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { isExamplePost } from '#/lib/example-content'
import { GitFork, Copy, Pencil, Check } from 'lucide-react'
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
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(post.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setForkError('Could not copy to clipboard')
    }
  }

  const handleFollow = async () => {
    if (!username) return
    try {
      await toggleFollow({ data: { username } })
      void router.invalidate()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main id="main" className="app-page app-page--wide">
      <header className="app-page__head">
        <p className="app-page__eyebrow">
          {example && <span className="post-detail__example-tag">Example · </span>}
          <span className="post-detail__kind-badge">{kindLabel(post.kind)}</span>
          <span className="post-detail__field-badge">{categoryLabel(post.category)}</span>
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

      {(post.forkedFromId || post.forkedFrom) && (
        <p className="post-detail__fork-note">
          <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
          Forked from{' '}
          <Link
            to="/p/$postId"
            params={{ postId: post.forkedFrom?.id ?? post.forkedFromId! }}
          >
            {post.forkedFrom?.title ?? 'original workflow'}
          </Link>
        </p>
      )}

      <div className="post-detail__action-bar">
        <PostEngagement
          postId={post.id}
          likeCount={post._count.likes}
          commentCount={post._count.comments}
          likedByMe={post.likedByMe}
          interactive
        />
        <div className="post-detail__action-bar-end">
          <button type="button" className="feed-tab" onClick={() => void handleCopy()}>
            {copied ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy markdown'}
          </button>
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
              className="btn btn--compact post-detail__fork-btn"
            >
              <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="btn__label">{forking ? 'Forking…' : 'Fork setup'}</span>
            </button>
          )}
        </div>
      </div>

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
                @{username}
                {post.author.profile?.headline && (
                  <> · {post.author.profile.headline}</>
                )}
              </p>
              <p className="post-detail__author-date">
                <time dateTime={new Date(post.createdAt).toISOString()}>{date}</time>
              </p>
            </div>
          </Link>
        ) : (
          <p className="post-detail__author-handle">
            <time dateTime={new Date(post.createdAt).toISOString()}>{date}</time>
          </p>
        )}
        {username && !isOwn && session?.user && (
          <button type="button" className="btn btn--compact" onClick={() => void handleFollow()}>
            <span className="btn__label">Follow</span>
          </button>
        )}
      </div>

      {forkError && <p className="post-detail__error">{forkError}</p>}

      <div className="post-detail__layout">
        <ContentTableOfContents content={post.content} className="post-detail__toc" />
        <article className="post-detail__body">
          <MarkdownContent content={post.content} />
        </article>
      </div>

      <CommentsSection postId={post.id} initialComments={comments} />
    </main>
  )
}
