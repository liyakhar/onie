import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { buildPageMeta } from '#/lib/seo'

const resetMeta = buildPageMeta({
  path: '/reset-password',
  title: 'Reset password',
  description: 'Choose a new password for your Wollie account.',
  noindex: true,
})

export const Route = createFileRoute('/reset-password/')({
  head: () => ({
    meta: resetMeta.meta,
    links: resetMeta.links,
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const router = useRouter()
  const { token, error: tokenError } = Route.useSearch()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (tokenError || !token) {
    return (
      <main id="main" className="app-page auth-page">
        <header className="app-page__head">
          <p className="app-page__eyebrow">Reset password</p>
          <h1 className="app-page__title">Link expired</h1>
          <p className="app-page__lede">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
        </header>
        <Link to="/login" className="btn">
          <span className="btn__label">Back to sign in</span>
        </Link>
      </main>
    )
  }

  if (done) {
    return (
      <main id="main" className="app-page auth-page">
        <header className="app-page__head">
          <p className="app-page__eyebrow">Reset password</p>
          <h1 className="app-page__title">Password updated</h1>
          <p className="app-page__lede">You can sign in with your new password.</p>
        </header>
        <Link to="/login" className="btn">
          <span className="btn__label">Sign in</span>
        </Link>
      </main>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (result.error) {
        setError(result.error.message || 'Could not reset password')
        setLoading(false)
        return
      }
      setDone(true)
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <main id="main" className="app-page auth-page">
      <header className="app-page__head">
        <p className="app-page__eyebrow">Reset password</p>
        <h1 className="app-page__title">Choose a new password</h1>
        <p className="app-page__lede">Use at least 8 characters.</p>
      </header>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            className="app-form__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="app-form__field">
          <label className="app-form__label" htmlFor="confirm-password">
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            className="app-form__input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        {error && <p className="post-detail__error">{error}</p>}
        <div className="app-form__actions">
          <button type="submit" className="btn" disabled={loading}>
            <span className="btn__label">{loading ? 'Saving…' : 'Update password'}</span>
          </button>
          <Link to="/login" className="auth-link">
            Cancel
          </Link>
        </div>
      </form>
    </main>
  )
}
