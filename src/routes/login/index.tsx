import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authClient } from '#/lib/auth-client'
import type { LoginSearch } from '#/lib/auth-nav'
import { completeOnboarding, getMyProfile } from '#/server/profiles'
import { buildPageMeta } from '#/lib/seo'

const loginMeta = buildPageMeta({
  path: '/login',
  title: 'Sign in',
  description: 'Sign in to Wollie.',
  noindex: true,
})

export type { LoginSearch }

const DEV_LOGIN = {
  email: 'dev@wollie.local',
  password: 'wollie-dev-password',
  name: 'Wollie Dev',
} as const

async function goAfterAuth(
  router: ReturnType<typeof useRouter>,
  redirectTo: string,
  isSignUp: boolean,
) {
  if (isSignUp) {
    void router.navigate({
      to: '/welcome',
      search: { redirect: redirectTo },
    })
    return
  }

  const profile = await getMyProfile()
  if (profile && !profile.onboarded) {
    void router.navigate({
      to: '/welcome',
      search: { redirect: redirectTo },
    })
    return
  }

  void router.navigate({ href: redirectTo })
}

export const Route = createFileRoute('/login/')({
  head: () => ({
    meta: loginMeta.meta,
    links: loginMeta.links,
  }),
  loader: () => ({
    isDev: process.env.NODE_ENV === 'development',
  }),
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : '/app',
    signup: search.signup === '1' || search.signup === true ? '1' : undefined,
  }),
  component: LoginPage,
})

type AuthMode = 'signin' | 'signup' | 'forgot' | 'forgot-sent'

function LoginPage() {
  const router = useRouter()
  const { redirect, signup } = useSearch({ from: '/login/' })
  const redirectTo = redirect ?? '/app'
  const { isDev } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const [mode, setMode] = useState<AuthMode>(signup === '1' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devLoading, setDevLoading] = useState(false)

  useEffect(() => {
    if (!isPending && session?.user) {
      void goAfterAuth(router, redirectTo, false)
    }
  }, [isPending, session?.user, router, redirectTo])

  if (isPending) {
    return <main className="app-loading">Loading…</main>
  }

  if (session?.user) {
    return null
  }

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const result = await authClient.signUp.email({ email, password, name })
        if (result.error) {
          setError(result.error.message || 'Sign up failed')
        } else {
          await goAfterAuth(router, redirectTo, true)
        }
      } else {
        const result = await authClient.signIn.email({ email, password })
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
        } else {
          await goAfterAuth(router, redirectTo, false)
        }
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (result.error) {
        setError(result.error.message || 'Could not send reset email')
      } else {
        setMode('forgot-sent')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const backToSignIn = () => {
    setMode('signin')
    setError('')
  }

  const handleDevSignIn = async () => {
    if (!isDev) return

    setError('')
    setDevLoading(true)

    try {
      let result = await authClient.signIn.email({
        email: DEV_LOGIN.email,
        password: DEV_LOGIN.password,
      })

      if (result.error) {
        const signup = await authClient.signUp.email(DEV_LOGIN)
        if (signup.error) {
          setError(signup.error.message || 'Dev sign in failed')
          return
        }

        result = await authClient.signIn.email({
          email: DEV_LOGIN.email,
          password: DEV_LOGIN.password,
        })
      }

      if (result.error) {
        setError(result.error.message || 'Dev sign in failed')
        return
      }

      const profile = await getMyProfile()
      if (profile && !profile.onboarded) {
        await completeOnboarding({
          data: {
            username: profile.username,
            field: 'FINANCE',
            headline: 'Dev budget',
          },
        })
      }

      void router.navigate({ to: '/app' })
    } catch {
      setError('Dev sign in failed. Try again.')
    } finally {
      setDevLoading(false)
    }
  }

  if (mode === 'forgot' || mode === 'forgot-sent') {
    return (
      <main id="main" className="app-page auth-page">
        <header className="app-page__head">
          <p className="app-page__eyebrow">Account</p>
          <h1 className="app-page__title">
            {mode === 'forgot-sent' ? 'Check your email' : 'Reset password'}
          </h1>
          <p className="app-page__lede">
            {mode === 'forgot-sent'
              ? 'If an account exists for that address, we sent a reset link.'
              : 'Enter your email and we will send a reset link.'}
          </p>
        </header>

        <div className="auth-stack">
          {mode === 'forgot' ? (
            <form onSubmit={handleForgot} className="auth-form">
              <div className="app-form__field">
                <label className="app-form__label" htmlFor="forgot-email">
                  Email
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  className="app-form__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              {error && <p className="post-detail__error">{error}</p>}
              <div className="app-form__actions">
                <button type="submit" className="btn" disabled={loading}>
                  <span className="btn__label">{loading ? 'Sending…' : 'Send reset link'}</span>
                </button>
              </div>
            </form>
          ) : (
            isDev && (
              <p className="app-form__hint">
                Local dev: the reset URL is printed in the server console.
              </p>
            )
          )}

          <footer className="auth-footer">
            <button type="button" className="login-switch" onClick={backToSignIn}>
              Back to sign in
            </button>
          </footer>
        </div>
      </main>
    )
  }

  return (
    <main id="main" className="app-page auth-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Wollie</p>
        <h1 className="app-page__title">{isSignUp ? 'Create account' : 'Sign in'}</h1>
      </header>

      <div className="auth-stack">
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="app-form__field">
              <label className="app-form__label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="app-form__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="app-form__field">
            <label className="app-form__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="app-form__input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="app-form__field">
            <div className="app-form__label-row">
              <label className="app-form__label" htmlFor="password">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => {
                    setMode('forgot')
                    setError('')
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              className="app-form__input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
          {error && <p className="post-detail__error">{error}</p>}
          <div className="app-form__actions">
            <button type="submit" className="btn" disabled={loading}>
              <span className="btn__label">
                {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </span>
            </button>
          </div>
        </form>

        <footer className="auth-footer">
          <button
            type="button"
            onClick={() => {
              setMode(isSignUp ? 'signin' : 'signup')
              setError('')
            }}
            className="login-switch"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : 'Create account'}
          </button>
          {isDev && !isSignUp && (
            <button
              type="button"
              className="login-switch"
              disabled={devLoading || loading}
              onClick={() => void handleDevSignIn()}
            >
              {devLoading ? 'Opening dev account...' : 'Dev sign in'}
            </button>
          )}
        </footer>
      </div>
    </main>
  )
}
