import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES } from '#/lib/categories'
import { getMyProfile, completeOnboarding } from '#/server/profiles'
import { buildPageMeta } from '#/lib/seo'

const welcomeMeta = buildPageMeta({
  path: '/welcome',
  title: 'Welcome',
  description: 'Set up your Onie profile.',
  noindex: true,
})

export const Route = createFileRoute('/welcome/')({
  head: () => ({
    meta: welcomeMeta.meta,
    links: welcomeMeta.links,
  }),
  loader: async () => getMyProfile(),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : '/new',
  }),
  component: WelcomePage,
})

function WelcomePage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const profile = Route.useLoaderData()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [field, setField] = useState<Category>(profile?.field ?? 'OTHER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!profile) {
    return <main className="app-loading">Loading…</main>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await completeOnboarding({
        data: { username, field, headline },
      })
      void router.navigate({ href: redirectTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setError('')
    setLoading(true)
    try {
      await completeOnboarding({
        data: {
          username: profile.username,
          field: profile.field,
          headline: profile.headline ?? '',
        },
      })
      void router.navigate({ href: redirectTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
      setLoading(false)
    }
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Welcome</p>
        <h1 className="app-page__title">Set up your page</h1>
        <p className="app-page__lede">
          Pick a username and field so people can find you. You can add a bio later in{' '}
          <Link to="/settings">Settings</Link>.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="app-form">
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="welcome-username">
            Username
          </label>
          <input
            id="welcome-username"
            className="app-form__input app-form__textarea--mono"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            pattern="[a-z0-9-]+"
            required
          />
          <p className="app-form__hint">onie.app/u/{username || 'your-name'}</p>
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="welcome-headline">
            Headline
          </label>
          <input
            id="welcome-headline"
            className="app-form__input"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Product designer shipping with agents"
          />
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="welcome-field">
            Primary field
          </label>
          <select
            id="welcome-field"
            className="app-form__select"
            value={field}
            onChange={(e) => setField(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="app-form__hint">
            {CATEGORIES.find((c) => c.value === field)?.description}
          </p>
        </div>

        {error && <p className="post-detail__error">{error}</p>}

        <div className="app-form__actions">
          <button type="submit" className="btn" disabled={loading}>
            <span className="btn__label">{loading ? 'Saving…' : 'Continue'}</span>
          </button>
          <button
            type="button"
            className="feed-tab"
            disabled={loading}
            onClick={() => void handleSkip()}
          >
            Skip for now
          </button>
        </div>
      </form>
    </main>
  )
}
