import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { getMyProfile, updateProfile } from '#/server/profiles'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'

const settingsMeta = buildPageMeta({
  path: '/settings',
  title: 'Settings',
  description: 'Manage your Wollie account.',
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
  const [field] = useState<Category>(profile?.field ?? 'FINANCE')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPending && !session?.user) {
      void router.navigate({
        to: '/login',
        search: loginSearch({ redirect: '/settings' }),
      })
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
      setUsername(updated.username)
      setSaved(true)
      void router.invalidate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Wollie</p>
        <h1 className="app-page__title">Settings.</h1>
        <p className="app-page__lede">
          Keep this boring on purpose: account, sync, privacy.
        </p>
      </header>

      <div className="settings-layout">
        <form onSubmit={handleSubmit} className="app-form settings-panel">
          <div>
            <p className="settings-panel__kicker">Account</p>
            <h2 className="settings-panel__title">Your budget</h2>
          </div>

          <div className="app-form__field">
            <label className="app-form__label" htmlFor="username">
              Handle
            </label>
            <input
              id="username"
              className="app-form__input app-form__textarea--mono"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              pattern="[a-z0-9-]+"
              required
            />
            <p className="app-form__hint">Private account handle. Not a public profile.</p>
          </div>

          <div className="app-form__field">
            <label className="app-form__label" htmlFor="headline">
              Budget name
            </label>
            <input
              id="headline"
              className="app-form__input"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Personal budget"
            />
          </div>

          <div className="app-form__field">
            <label className="app-form__label" htmlFor="bio">
              Note
            </label>
            <textarea
              id="bio"
              className="app-form__textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Optional"
            />
          </div>

          {error && <p className="post-detail__error">{error}</p>}
          {saved && <p className="app-form__hint" data-tone="success">Saved.</p>}

          <div className="app-form__actions">
            <button type="submit" className="btn" disabled={loading}>
              <span className="btn__label">{loading ? 'Saving…' : 'Save'}</span>
            </button>
          </div>
        </form>

        <section className="settings-panel" aria-labelledby="sync-title">
          <p className="settings-panel__kicker">Sync</p>
          <h2 id="sync-title" className="settings-panel__title">Bank sync</h2>
          <dl className="settings-list">
            <div>
              <dt>Current mode</dt>
              <dd>Demo data</dd>
            </div>
            <div>
              <dt>Live banks</dt>
              <dd>Requires a paid bank-data provider before launch.</dd>
            </div>
            <div>
              <dt>Safety</dt>
              <dd>Bank credentials never belong in the browser.</dd>
            </div>
          </dl>
        </section>

        <section className="settings-panel" aria-labelledby="privacy-title">
          <p className="settings-panel__kicker">Privacy</p>
          <h2 id="privacy-title" className="settings-panel__title">Your data</h2>
          <ul className="settings-checklist">
            <li>Private by default.</li>
            <li>No public profiles.</li>
            <li>No demo accounts in production sign-in.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
