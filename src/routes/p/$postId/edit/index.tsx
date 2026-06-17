import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { useEffect } from 'react'
import { getPost } from '#/server/posts'
import { PostForm } from '#/components/PostForm'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'

export const Route = createFileRoute('/p/$postId/edit/')({
  loader: async ({ params }) => {
    const post = await getPost({ data: { id: params.postId } })
    if (!post) {
      throw notFound()
    }
    return { post }
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post
    if (!post) return {}

    const pageMeta = buildPageMeta({
      path: `/p/${post.id}/edit`,
      title: `Edit ${post.title}`,
      description: 'Edit your post on Onie.',
      noindex: true,
    })

    return {
      meta: pageMeta.meta,
      links: pageMeta.links,
    }
  },
  component: EditPostPage,
})

function EditPostPage() {
  const router = useRouter()
  const { post } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const isOwner = session?.user?.id === post.author.id

  useEffect(() => {
    if (!isPending && !session?.user) {
      void router.navigate({
        to: '/login',
        search: loginSearch({ redirect: `/p/${post.id}/edit` }),
      })
      return
    }
    if (!isPending && session?.user && !isOwner) {
      void router.navigate({ to: '/p/$postId', params: { postId: post.id } })
    }
  }, [isPending, session?.user, isOwner, post.id, router])

  if (isPending || !session?.user || !isOwner) {
    return <main className="app-loading">Loading…</main>
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Edit</p>
        <h1 className="app-page__title">Edit post</h1>
        <p className="app-page__lede">Change the title, tags, field, or markdown body.</p>
      </header>
      <PostForm
        mode="edit"
        postId={post.id}
        cancelTo={`/p/${post.id}`}
        initial={{
          title: post.title,
          description: post.description ?? '',
          content: post.content,
          kind: post.kind,
          category: post.category,
          tools: post.tools,
        }}
      />
    </main>
  )
}
