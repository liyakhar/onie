import { useEffect, useRef, useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Download, ExternalLink, Users } from 'lucide-react'
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
import { exportFinanceCsv } from '#/server/account-data'
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

const supportedCountries = [
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'DK', name: 'Denmark' },
  { code: 'EE', name: 'Estonia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IT', name: 'Italy' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ES', name: 'Spain' },
  { code: 'SE', name: 'Sweden' },
] as const

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
  const { accounts, enableBanking, household } = Route.useLoaderData()
  const search = Route.useSearch()
  const router = useRouter()
  const callbackStarted = useRef(false)
  const [country, setCountry] = useState('BE')
  const [bankName, setBankName] = useState('')
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exportingAccountId, setExportingAccountId] = useState<string | null>(null)
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

  async function exportAccount(accountId: string, accountName: string) {
    setExportingAccountId(accountId)
    setError('')
    setMessage('')
    try {
      const data = await exportFinanceCsv({ data: { scope: 'account', accountId } })
      downloadBlob({
        content: data.content,
        filename: data.filename.replace(accountId, slugify(accountName)),
        type: data.mimeType,
      })
      setMessage(`${accountName} export downloaded.`)
    } catch (reason) {
      setError(errorMessage(reason, 'Could not export this account.'))
    } finally {
      setExportingAccountId(null)
    }
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
          <p className="mt-1 text-sm text-zinc-500">Connected banks and balances.</p>
        </div>
        <Button asChild variant="outline" className="min-h-11 sm:justify-self-end">
          <Link to="/app/household"><Users aria-hidden="true" /> Manage ownership</Link>
        </Button>
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
                  {supportedCountries.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
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
                <li key={account.id} className="flex flex-col gap-3 py-3 first:pt-2 last:pb-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{account.name}</p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {account.institution} · {account.type} · {account.lastSynced}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {connectionLabel(account.connectionStatus)} · {ownershipLabel(account.ownership, household.members)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                    <p className="text-sm font-medium tabular-nums">
                      {formatMoney(account.balance, account.currency)}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={exportingAccountId === account.id}
                      onClick={() => void exportAccount(account.id, account.name)}
                      className="min-h-10 border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-100"
                    >
                      <Download aria-hidden="true" />
                      {exportingAccountId === account.id ? 'Exporting…' : 'CSV'}
                    </Button>
                  </div>
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

function connectionLabel(status?: string) {
  if (status === 'CONNECTED') return 'Connected'
  if (status === 'NEEDS_RECONNECT') return 'Connection needs attention'
  if (status === 'FAILED') return 'Connection failed'
  if (status === 'SYNCING') return 'Updating'
  return 'Not connected'
}

function ownershipLabel(
  ownership: Array<{ memberId: string; shareBasisPoints: number }> | undefined,
  members: Array<{ id: string; name: string }>,
) {
  if (!ownership?.length) return 'Ownership not assigned'
  return ownership
    .filter((share) => share.shareBasisPoints > 0)
    .map((share) => {
      const member = members.find((item) => item.id === share.memberId)
      return `${member?.name || 'Member'} ${share.shareBasisPoints / 100}%`
    })
    .join(' · ')
}

function downloadBlob({ content, filename, type }: { content: string; filename: string; type: string }) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'account'
}
