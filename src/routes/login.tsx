import { createFileRoute, Link, useRouter, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '#/lib/auth-client'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : '/app',
  }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect: redirectTo } = useSearch({ from: '/login' })
  const { data: session, isPending } = authClient.useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isPending) {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      </main>
    )
  }

  if (session?.user) {
    void router.navigate({ href: redirectTo })
    return null
  }

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
          void router.navigate({ href: redirectTo })
        }
      } else {
        const result = await authClient.signIn.email({ email, password })
        if (result.error) {
          setError(result.error.message || 'Sign in failed')
        } else {
          void router.navigate({ href: redirectTo })
        }
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap flex min-h-[70vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-[var(--line)] bg-[var(--surface-strong)] shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Join Onie' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Create an account to share your agent workflows.'
              : 'Sign in to follow builders and publish workflows.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {isSignUp && (
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-[var(--line)]"
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[var(--line)]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="border-[var(--line)]"
              />
            </div>
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            >
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError('')
            }}
            className="mt-4 w-full text-center text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Join"}
          </button>
          <p className="mt-6 text-center text-xs text-[var(--ink-muted)]">
            By continuing you agree to share workflows responsibly.
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
