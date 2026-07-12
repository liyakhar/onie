import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { loginSearch, type LoginSearch } from '#/lib/auth-nav'
import { getMyProfile } from '#/server/profiles'
import { buildPageMeta } from '#/lib/seo'

const loginMeta = buildPageMeta({
  path: '/login',
  title: 'Sign in',
  description: 'Sign in to Onie to follow practitioners, publish workflows, and build your feed.',
  noindex: true,
})

export type { LoginSearch }

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
    googleEnabled: Boolean(
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    ),
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
  const { redirect: redirectTo, signup } = useSearch({ from: '/login/' })
  const { googleEnabled, isDev } = Route.useLoaderData()
  const { data: session, isPending } = authClient.useSession()
  const [mode, setMode] = useState<AuthMode>(signup === '1' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

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

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectTo,
      })
      if (result.error) {
        setError(result.error.message || 'Google sign in failed')
        setGoogleLoading(false)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setGoogleLoading(false)
    }
  }

  const backToSignIn = () => {
    setMode('signin')
    setError('')
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
        <p className="app-page__eyebrow">{isSignUp ? 'Join' : 'Sign in'}</p>
        <h1 className="app-page__title">{isSignUp ? 'Create your account' : 'Welcome back'}</h1>
        <p className="app-page__lede">
          {isSignUp
            ? 'Share agent workflows, follow builders, and build your feed.'
            : 'Sign in to follow builders and publish workflows.'}
        </p>
      </header>

      <div className="auth-stack">
        {googleEnabled && (
          <>
            <button
              type="button"
              disabled={loading || googleLoading}
              onClick={() => void handleGoogleSignIn()}
              className="login-google"
            >
              {googleLoading ? (
                'Redirecting…'
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>
            <div className="login-divider" role="separator">
              <span>or</span>
            </div>
          </>
        )}

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
            <button type="submit" className="btn" disabled={loading || googleLoading}>
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
              : "Don't have an account? Join"}
          </button>

          <p className="login-footnote">
            By continuing you agree to share workflows responsibly.
          </p>
        </footer>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
