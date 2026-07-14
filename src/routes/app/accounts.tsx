import { useEffect, useRef, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
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
import { formatMoney } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import { getFinanceAccounts } from '#/server/finance'
import {
  completeEnableBankingConnection,
  disconnectEnableBanking,
  getEnableBankingInstitutions,
  getEnableBankingStatus,
  startEnableBankingConnection,
  syncEnableBanking,
} from '#/server/enable-banking-sync'

type AccountsSearch = {
  code?: string
  state?: string
  error?: string
  error_description?: string
}
type Institution = { name: string; country: string; beta: boolean }

export const Route = createFileRoute('/app/accounts')({
  validateSearch: (search: Record<string, unknown>): AccountsSearch => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
    error_description: typeof search.error_description === 'string' ? search.error_description : undefined,
  }),
  loader: async () => {
    const [finance, enableBanking] = await Promise.all([
      getFinanceAccounts(),
      getEnableBankingStatus(),
    ])
    return { ...finance, enableBanking }
  },
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
  const { accounts, enableBanking } = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const callbackStarted = useRef(false)
  const [country, setCountry] = useState('BE')
  const [bankName, setBankName] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(search.error_description || search.error || '')

  useEffect(() => {
    if (!enableBanking.configured) return
    setLoadingBanks(true)
    setBankName('')
    void getEnableBankingInstitutions({ data: { country } })
      .then((banks) => setInstitutions(banks))
      .catch((reason) => setError(errorMessage(reason, 'Could not load available banks.')))
      .finally(() => setLoadingBanks(false))
  }, [country, enableBanking.configured])

  useEffect(() => {
    if (!search.code || !search.state || callbackStarted.current) return
    callbackStarted.current = true
    setLoading(true)
    setError('')
    void completeEnableBankingConnection({ data: { code: search.code, state: search.state } })
      .then(async ({ accounts: connectedAccounts }) => {
        setMessage(`Connected ${connectedAccounts} account${connectedAccounts === 1 ? '' : 's'}.`)
        await router.navigate({ to: '/app/accounts', search: {}, replace: true })
        await router.invalidate()
      })
      .catch((reason) => setError(errorMessage(reason, 'Could not finish the bank connection.')))
      .finally(() => setLoading(false))
  }, [router, search.code, search.state])

  function connectBank() {
    if (!bankName) return
    setMessage('')
    setError('')
    setLoading(true)
    void startEnableBankingConnection({ data: { country, bankName } })
      .then(({ url }) => window.location.assign(url))
      .catch((reason) => {
        setError(errorMessage(reason, 'Could not start the bank connection.'))
        setLoading(false)
      })
  }

  function syncBank() {
    setMessage('')
    setError('')
    setLoading(true)
    void syncEnableBanking()
      .then(async ({ accounts: syncedAccounts }) => {
        setMessage(`Synced ${syncedAccounts} account${syncedAccounts === 1 ? '' : 's'}.`)
        await router.invalidate()
      })
      .catch((reason) => setError(errorMessage(reason, 'Could not sync the bank.')))
      .finally(() => setLoading(false))
  }

  function disconnectBank() {
    setMessage('')
    setError('')
    setLoading(true)
    void disconnectEnableBanking()
      .then(async () => {
        setMessage('Bank access revoked and local bank data removed.')
        await router.invalidate()
      })
      .catch((reason) => setError(errorMessage(reason, 'Could not disconnect the bank.')))
      .finally(() => setLoading(false))
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">Connected banks and balances.</p>
        </div>
      </header>

      <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
        <CardHeader className="border-b border-zinc-200 pb-4">
          <CardTitle>European banks</CardTitle>
          <CardDescription>Banks are loaded directly from the regulated provider</CardDescription>
          <CardAction>
            <Badge variant="outline" className="rounded-md border-zinc-200 bg-white text-zinc-700">
              {enableBanking.connected
                ? enableBanking.needsReconnect
                  ? 'Reconnect'
                  : `Synced ${enableBanking.lastSynced}`
                : enableBanking.configured
                  ? enableBanking.environment
                  : 'Setup required'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          {!enableBanking.configured ? (
            <div className="flex flex-col items-start gap-3 text-sm text-zinc-600">
              <p>Add the Enable Banking application ID and private key to the Wollie server, then reload this page.</p>
              <Button asChild variant="outline" className="border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100">
                <a href="https://enablebanking.com/cp" target="_blank" rel="noreferrer">
                  Open Enable Banking <ExternalLink aria-hidden="true" />
                </a>
              </Button>
            </div>
          ) : enableBanking.connected ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={loading} onClick={syncBank} className="wollie-primary-action">
                {loading ? 'Working…' : 'Sync now'}
              </Button>
              <Button type="button" variant="ghost" disabled={loading} onClick={disconnectBank} className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[14rem_minmax(16rem,1fr)_auto] lg:items-end">
              <label className="grid gap-2 text-sm font-medium">
                Country
                <select
                  value={country}
                  onChange={(event) => setCountry(event.currentTarget.value)}
                  disabled={loading || loadingBanks}
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                >
                  <option value="BE">Belgium</option>
                  <option value="LT">Lithuania</option>
                  <option value="FR">France</option>
                  <option value="NL">Netherlands</option>
                  <option value="DE">Germany</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Bank
                <select
                  value={bankName}
                  onChange={(event) => setBankName(event.currentTarget.value)}
                  disabled={loading || loadingBanks}
                  className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
                >
                  <option value="">{loadingBanks ? 'Loading banks…' : 'Choose a bank'}</option>
                  {institutions.map((bank) => (
                    <option key={`${bank.country}:${bank.name}`} value={bank.name}>
                      {bank.name}{bank.beta ? ' (beta)' : ''}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" disabled={loading || loadingBanks || !bankName} onClick={connectBank} className="wollie-primary-action">
                {loading ? 'Connecting…' : 'Connect bank'}
              </Button>
            </div>
          )}

          {!enableBanking.connected && <p className="text-xs leading-5 text-zinc-500">Coverage varies by country and bank. Wollie never asks for or stores your bank password.</p>}
          {error && <p className="text-sm font-medium text-zinc-950" role="alert">{error}</p>}
          {message && <p className="text-sm text-zinc-700" role="status">{message}</p>}
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
                  <p className="shrink-0 text-sm font-medium tabular-nums">
                    {formatMoney(account.balance, account.currency)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

function errorMessage(value: unknown, fallback: string) {
  return value instanceof Error ? value.message : fallback
}
