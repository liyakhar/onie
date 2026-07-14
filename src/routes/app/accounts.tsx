import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
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
import { Label } from '#/components/ui/label'
import { Textarea } from '#/components/ui/textarea'
import { formatMoney } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import {
  claimSimpleFinConnection,
  disconnectSimpleFinConnection,
} from '#/server/bank-sync'
import { getFinanceAccounts } from '#/server/finance'

export const Route = createFileRoute('/app/accounts')({
  loader: () => getFinanceAccounts(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/accounts',
      title: 'Bank sync',
      description: 'Connected accounts and provider status.',
      noindex: true,
    }).meta,
  }),
  component: AccountsPage,
})

function AccountsPage() {
  const { accounts, syncStatus } = Route.useLoaderData()
  const router = useRouter()
  const [token, setToken] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const connected = syncStatus.mode === 'live-connected'

  function refreshAccounts() {
    return router.invalidate()
  }

  function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    setError('')

    setLoading(true)
    void claimSimpleFinConnection({ data: { token } })
      .then(async () => {
        setToken('')
        setMessage('Connected. Wollie loaded your latest accounts.')
        await refreshAccounts()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not connect SimpleFIN.')
      })
      .finally(() => setLoading(false))
  }

  function handleDisconnect() {
    setMessage('')
    setError('')

    setLoading(true)
    void disconnectSimpleFinConnection()
      .then(async () => {
        setMessage('Disconnected. Live bank sync is off for this account.')
        await refreshAccounts()
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not disconnect SimpleFIN.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="outline" className="mb-1.5 rounded-md border-zinc-200 bg-white font-normal text-zinc-700">
            Bank sync
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">SimpleFIN</p>
        </div>
        <Button asChild variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100">
          <Link to="/app">
            <ArrowLeft aria-hidden="true" />
            Overview
          </Link>
        </Button>
      </header>

      <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
        <CardHeader className="border-b border-zinc-200 pb-4">
          <CardTitle>Connect account</CardTitle>
          <CardDescription>Bank or credit card via SimpleFIN</CardDescription>
          <CardAction>
            <Badge variant="outline" className="rounded-md border-zinc-200 bg-white text-zinc-700">
              {connected ? `Synced ${syncStatus.lastSynced}` : 'Not connected'}
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="grid gap-8 pt-6 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">
                {connected ? 'Connection active' : 'Get a SimpleFIN token'}
              </h2>
              <p className="mt-1.5 max-w-sm text-sm leading-6 text-zinc-500">
                {connected
                  ? 'Reconnect with a new token or disconnect this provider.'
                  : 'Create a token, then paste it here. Your balances and transactions will sync automatically.'}
              </p>
            </div>
            <Button asChild variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100">
              <a
                href="https://bridge.simplefin.org/simplefin/create"
                target="_blank"
                rel="noreferrer"
              >
                Create token
                <ExternalLink aria-hidden="true" />
              </a>
            </Button>
          </div>

          <form className="grid gap-4" onSubmit={handleConnect}>
            <div className="grid gap-2">
              <Label htmlFor="simplefin-token">Access token</Label>
              <Textarea
                id="simplefin-token"
                value={token}
                onChange={(event) => setToken(event.currentTarget.value)}
                placeholder="Paste your SimpleFIN token"
                rows={4}
                className="min-h-28 resize-none border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-visible:border-zinc-950 focus-visible:ring-zinc-950/15"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={loading || !token.trim()}
                className="bg-zinc-950 text-white hover:bg-zinc-800"
              >
                {loading ? 'Connecting…' : connected ? 'Reconnect' : 'Connect'}
              </Button>
              {connected && (
                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  onClick={handleDisconnect}
                  className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100"
                >
                  Disconnect
                </Button>
              )}
            </div>
            {message && <p className="text-sm text-zinc-700" role="status">{message}</p>}
            {error && <p className="text-sm font-medium text-zinc-950" role="alert">{error}</p>}
          </form>
        </CardContent>
      </Card>

      {accounts.length > 0 && (
        <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
          <CardHeader className="border-b border-zinc-200 pb-4">
            <CardTitle>Connected accounts</CardTitle>
            <CardDescription>{accounts.length} total</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="divide-y divide-zinc-200">
              {accounts.map((account) => (
                <li key={account.id} className="flex items-center justify-between gap-4 py-3 first:pt-2 last:pb-1">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {account.institution} · {account.type} · {account.lastSynced}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(account.balance)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
