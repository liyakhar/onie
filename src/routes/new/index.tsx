import { createFileRoute } from '@tanstack/react-router'
import { PostForm } from '#/components/PostForm'
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
