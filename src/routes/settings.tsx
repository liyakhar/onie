import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { CATEGORIES, categoryLabel } from '#/lib/categories'
import { getMyProfile, updateProfile } from '#/server/profiles'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/settings')({
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
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--accent)]" />
      </main>
    )
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
    <main className="page-wrap px-4 pb-12 pt-8">
      <Card className="mx-auto max-w-xl border-[var(--line)] bg-[var(--surface-strong)]">
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
          <CardDescription>
            Your public page shows your field, workflows, and pinned highlight.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-[var(--ink-soft)]">
            Public page:{' '}
            <Link
              to="/u/$username"
              params={{ username: profile.username }}
              className="font-medium text-[var(--accent)]"
            >
              weavel.app/u/{profile.username}
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                pattern="[a-z0-9-]+"
                required
                className="border-[var(--line)] font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Product designer shipping with agents"
                className="border-[var(--line)]"
              />
            </div>
            <div className="grid gap-2">
              <Label>Primary field</Label>
              <Select value={field} onValueChange={(v) => setField(v as Category)}>
                <SelectTrigger className="border-[var(--line)]">
                  <SelectValue>{categoryLabel(field)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="border-[var(--line)]"
              />
            </div>
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {saved && <p className="text-sm text-green-700">Profile saved.</p>}
            <Button
              type="submit"
              disabled={loading}
              className="bg-[var(--accent)] hover:bg-[var(--accent-hover)]"
            >
              {loading ? 'Saving…' : 'Save profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
