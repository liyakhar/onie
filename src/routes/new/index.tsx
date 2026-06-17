import { useEffect } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { PostForm } from '#/components/PostForm'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'

const newPostMeta = buildPageMeta({
  path: '/new',
  title: 'Publish',
  description:
    'Share prompts, skills, setups, harnesses, and workflows from your practice on Onie.',
  noindex: true,
})

export const Route = createFileRoute('/new/')({
  head: () => ({
    meta: newPostMeta.meta,
    links: newPostMeta.links,
  }),
  component: NewPostPage,
})

function NewPostPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (!isPending && !session?.user) {
      void router.navigate({
        to: '/login',
        search: loginSearch({ redirect: '/new' }),
      })
    }
  }, [isPending, session?.user, router])

  if (isPending || !session?.user) {
    return <main className="app-loading">Loading…</main>
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Publish</p>
        <h1 className="app-page__title">Share what works for you</h1>
        <p className="app-page__lede">
          Post the skills, prompts, file structure, or agent setup that works for you.
        </p>
      </header>
      <PostForm
        mode="create"
        cancelTo="/app"
        initial={{
          title: '',
          description: '',
          content: '',
          category: 'OTHER',
          kind: 'WORKFLOW',
          tools: [],
        }}
      />
    </main>
  )
}
