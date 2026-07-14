import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Category } from '#/generated/prisma/client'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
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
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-1.5 rounded-md border-zinc-200 bg-white font-normal text-zinc-700">
            Account
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500">Profile and preferences</p>
        </div>
        <Button asChild variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100">
          <Link to="/app">
            <ArrowLeft aria-hidden="true" />
            Overview
          </Link>
        </Button>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
          <CardHeader className="border-b border-zinc-200 pb-4">
            <CardTitle>Account details</CardTitle>
            <CardDescription>Used only inside your Wollie account</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="username">Handle</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  pattern="[a-z0-9-]+"
                  required
                  className="border-zinc-200 bg-white text-zinc-950 focus-visible:border-zinc-950 focus-visible:ring-zinc-950/15"
                />
                <p className="text-xs text-zinc-500">Lowercase letters, numbers, and hyphens.</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="headline">Budget name</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Personal budget"
                  className="border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-zinc-950/15"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Note</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Optional"
                  className="min-h-28 resize-none border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-zinc-950/15"
                />
              </div>

              {error && <p className="text-sm font-medium text-zinc-950" role="alert">{error}</p>}
              {saved && <p className="text-sm text-zinc-700" role="status">Saved.</p>}

              <div>
                <Button type="submit" disabled={loading} className="bg-zinc-950 text-white hover:bg-zinc-800">
                  {loading ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
            <CardHeader className="border-b border-zinc-200 pb-4">
              <CardTitle>Bank connections</CardTitle>
              <CardDescription>SimpleFIN accounts</CardDescription>
              <CardAction>
                <Badge variant="outline" className="rounded-md border-zinc-200 bg-white text-zinc-700">
                  Sync
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="pt-5">
              <Button asChild variant="outline" className="w-full justify-between border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100">
                <Link to="/app/accounts">
                  Manage accounts
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
            <CardHeader className="border-b border-zinc-200 pb-4">
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Your financial data stays private</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <ul className="grid gap-3 text-sm text-zinc-600">
                <li className="border-b border-zinc-200 pb-3">Private by default</li>
                <li className="border-b border-zinc-200 pb-3">No public financial profile</li>
                <li>Credentials stay server-side</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
