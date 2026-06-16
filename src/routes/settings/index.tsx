import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES, categoryLabel } from '#/lib/categories'
import { getMyProfile, updateProfile } from '#/server/profiles'
import { authClient } from '#/lib/auth-client'
import { buildPageMeta } from '#/lib/seo'

const settingsMeta = buildPageMeta({
  path: '/settings',
  title: 'Settings',
  description: 'Manage your Onie profile and account settings.',
  noindex: true,
})

export const Route = createFileRoute('/settings/')({
  head: () => ({
    meta: settingsMeta.meta,
    links: settingsMeta.links,
  }),
  loader: async () => getMyProfile(),
  component: SettingsPage,
})

function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const profile = Route.useLoaderData()
  const [username, setUsername] = useState(profile?.username ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [field, setField] = useState<Category>(profile?.field ?? 'OTHER')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPending && !session?.user) {
      void router.navigate({ to: '/login' })
    }
  }, [isPending, session?.user, router])

  if (isPending || !session?.user || !profile) {
    return <main className="app-loading">Loading…</main>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaved(false)
    setLoading(true)

    try {
      const updated = await updateProfile({
        data: { username, headline, bio, field },
      })
      setSaved(true)
      if (updated.username !== profile.username) {
        void router.navigate({
          to: '/u/$username',
          params: { username: updated.username },
        })
      } else {
        void router.invalidate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Account</p>
        <h1 className="app-page__title">Profile settings</h1>
        <p className="app-page__lede">
          Your public page shows your field, workflows, and pinned highlight.{' '}
          <Link to="/u/$username" params={{ username: profile.username }} className="text-[var(--accent)]">
            View your page
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="app-form">
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="app-form__input app-form__textarea--mono"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            pattern="[a-z0-9-]+"
            required
          />
          <p className="app-form__hint">onie.app/u/{username || 'your-name'}</p>
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="headline">
            Headline
          </label>
          <input
            id="headline"
            className="app-form__input"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Product designer shipping with agents"
          />
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="field">
            Primary field
          </label>
          <select
            id="field"
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
            {CATEGORIES.find((c) => c.value === field)?.description ?? categoryLabel(field)}
          </p>
        </div>

        <div className="app-form__field">
          <label className="app-form__label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            className="app-form__textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
          />
        </div>

        {error && <p className="post-detail__error">{error}</p>}
        {saved && <p className="app-form__hint" data-tone="success">Profile saved.</p>}

        <div className="app-form__actions">
          <button type="submit" className="btn" disabled={loading}>
            <span className="btn__label">{loading ? 'Saving…' : 'Save profile'}</span>
          </button>
          <Link to="/u/$username" params={{ username: profile.username }} className="feed-tab">
            View page
          </Link>
        </div>
      </form>
    </main>
  )
}
