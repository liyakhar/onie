import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES, profileFieldLabel } from '#/lib/categories'
import {
  completeOnboarding,
  followMany,
  getMyProfile,
  getSuggestedProfiles,
} from '#/server/profiles'
import { buildPageMeta } from '#/lib/seo'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Plus, Check } from 'lucide-react'
import { cn } from '#/lib/utils'
import { useQuery } from '@tanstack/react-query'

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
  loader: async () => {
    const profile = await getMyProfile()
    return { profile }
  },
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === 'string' && search.redirect.startsWith('/')
        ? search.redirect
        : '/app/explore',
  }),
  component: WelcomePage,
})

function WelcomePage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const { profile } = Route.useLoaderData()
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState(profile?.username ?? '')
  const [headline, setHeadline] = useState(profile?.headline ?? '')
  const [field, setField] = useState<Category>(profile?.field ?? 'OTHER')
  const [selectedFollows, setSelectedFollows] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: suggested = [] } = useQuery({
    queryKey: ['suggested-profiles', field],
    queryFn: () => getSuggestedProfiles({ data: { field } }),
    enabled: step === 2,
  })

  if (!profile) {
    return <main className="app-loading">Loading…</main>
  }

  const toggleFollow = (uname: string) => {
    setSelectedFollows((prev) => {
      const next = new Set(prev)
      if (next.has(uname)) next.delete(uname)
      else next.add(uname)
      return next
    })
  }

  const finish = async (followUsernames: string[]) => {
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
      if (followUsernames.length > 0) {
        await followMany({ data: { usernames: followUsernames } })
      }
      void router.navigate({ href: redirectTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
      setLoading(false)
    }
  }

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const fieldLabel = profileFieldLabel(field)

  if (step === 1) {
    return (
      <main id="main" className="app-page">
        <header className="app-page__head">
          <p className="app-page__eyebrow">Welcome · Step 1 of 2</p>
          <h1 className="app-page__title">Set up your page</h1>
          <p className="app-page__lede">
            Pick a username and field so people can find you. You can add a bio later in{' '}
            <Link to="/settings">Settings</Link>.
          </p>
        </header>

        <form onSubmit={handleStep1} className="app-form app-form--narrow">
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
              Headline <span className="app-form__optional">(optional)</span>
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
              <span className="btn__label">Continue</span>
            </button>
            <button
              type="button"
              className="feed-tab"
              disabled={loading}
              onClick={() => void finish([])}
            >
              Skip for now
            </button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main id="main" className="app-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Welcome · Step 2 of 2</p>
        <h1 className="app-page__title">Follow builders</h1>
        <p className="app-page__lede">
          {fieldLabel
            ? `Suggested practitioners in ${fieldLabel}. Follow a few to personalize your feed.`
            : 'Follow a few builders to personalize your feed.'}
        </p>
      </header>

      {suggested.length === 0 ? (
        <div className="feed-empty">
          <p>No suggestions yet — explore workflows and follow people as you browse.</p>
          <button
            type="button"
            className="btn"
            disabled={loading}
            onClick={() => void finish([])}
          >
            <span className="btn__label">{loading ? 'Saving…' : 'Finish'}</span>
          </button>
        </div>
      ) : (
        <ul className="suggested-follows">
          {suggested.map((person) => {
            const selected = selectedFollows.has(person.username)
            return (
              <li key={person.id}>
                <button
                  type="button"
                  className={cn('suggested-follows__row', selected && 'is-selected')}
                  onClick={() => toggleFollow(person.username)}
                  aria-pressed={selected}
                >
                  <Avatar className="h-10 w-10 border border-[var(--line)]">
                    <AvatarImage src={person.user.image ?? undefined} />
                    <AvatarFallback>{person.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="suggested-follows__body">
                    <p className="suggested-follows__name">{person.user.name}</p>
                    <p className="suggested-follows__meta">
                      @{person.username} · {person.user._count.posts} workflows
                    </p>
                  </div>
                  <span className="suggested-follows__check" aria-hidden="true">
                    {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="post-detail__error">{error}</p>}

      {suggested.length > 0 && (
        <div className="app-form__actions">
          <button
            type="button"
            className="btn"
            disabled={loading}
            onClick={() => void finish([...selectedFollows])}
          >
            <span className="btn__label">
              {loading ? 'Saving…' : `Finish${selectedFollows.size > 0 ? ` (${selectedFollows.size} follows)` : ''}`}
            </span>
          </button>
          <button
            type="button"
            className="feed-tab"
            disabled={loading}
            onClick={() => setStep(1)}
          >
            Back
          </button>
          <button
            type="button"
            className="feed-tab"
            disabled={loading}
            onClick={() => void finish([])}
          >
            Skip
          </button>
        </div>
      )}
    </main>
  )
}
