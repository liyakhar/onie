import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { completeOnboarding, getMyProfile } from '#/server/profiles'
import { buildPageMeta } from '#/lib/seo'

const welcomeMeta = buildPageMeta({
  path: '/welcome',
  title: 'Welcome',
  description: 'Start with Wollie.',
  noindex: true,
})

export const Route = createFileRoute('/welcome/')({
  head: () => ({
    meta: welcomeMeta.meta,
    links: welcomeMeta.links,
  }),
  loader: async () => {
    const profile = await getMyProfile()
    return { profile }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : '/app',
  }),
  component: WelcomePage,
})

function WelcomePage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const { profile } = Route.useLoaderData()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [field] = useState<Category>(profile?.field ?? 'FINANCE')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!profile) {
    return <main className="app-loading">Loading…</main>
  }

  const finish = async () => {
    setError('')
    const resolvedUsername = username.trim().toLowerCase() || profile.username
    if (!resolvedUsername || !/^[a-z0-9-]+$/.test(resolvedUsername)) {
      setError('Choose a username with letters, numbers, and hyphens only')
      return
    }
    setLoading(true)
    try {
      await completeOnboarding({
        data: { username: resolvedUsername, field, headline },
      })
      void router.navigate({ href: redirectTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
      setLoading(false)
    }
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    void finish()
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Wollie</p>
        <h1 className="app-page__title">Start.</h1>
      </header>

      <form onSubmit={handleStep1} className="app-form app-form--narrow">
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="welcome-username">
            Name
          </label>
          <input
            id="welcome-username"
            className="app-form__input app-form__textarea--mono"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            pattern="[a-z0-9-]+"
            required
          />
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="welcome-headline">
            Note <span className="app-form__optional">(optional)</span>
          </label>
          <input
            id="welcome-headline"
            className="app-form__input"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Personal budget"
          />
        </div>

        {error && <p className="post-detail__error">{error}</p>}

        <div className="app-form__actions">
          <button type="submit" className="btn" disabled={loading}>
            <span className="btn__label">{loading ? 'Saving…' : 'Open budget'}</span>
          </button>
        </div>
      </form>
    </main>
  )
}
