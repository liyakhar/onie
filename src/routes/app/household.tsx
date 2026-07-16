import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Copy, FileText, Mail, Users } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { formatMoney } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import {
  createHouseholdInvitation,
  getHouseholdOverview,
  removeHouseholdMember,
  revokeHouseholdInvitation,
  updateAccountOwnership,
  updateHouseholdShares,
} from '#/server/household'

export const Route = createFileRoute('/app/household')({
  loader: () => getHouseholdOverview(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/household',
      title: 'Household finances',
      description: 'Manage household members, contribution shares, and account ownership.',
      noindex: true,
    }).meta,
  }),
  component: HouseholdPage,
})

function HouseholdPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const owner = data.members.find((member) => member.role === 'OWNER')
  const partner = data.members.find((member) => member.role === 'MEMBER')
  const isOwner = data.currentRole === 'OWNER'

  async function refreshWith(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await action()
      setMessage(success)
      await router.invalidate()
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  async function invitePartner(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const invitation = await createHouseholdInvitation({ data: { email } })
      setInviteUrl(invitation.url)
      setEmail('')
      setMessage(invitation.delivery === 'sent'
        ? `Invitation sent to ${invitation.email}.`
        : 'Email delivery was unavailable. Copy and send the secure link below.')
      await router.invalidate()
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  async function copyInviteLink() {
    setError('')
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setMessage('Invitation link copied.')
    } catch {
      setError('Copy failed. Select the link and copy it manually.')
    }
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Household</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Share the full picture while keeping a clear view of what is mine, yours, and ours.
          </p>
        </div>
        <Button asChild variant="outline" className="min-h-11 sm:justify-self-end">
          <Link to="/app/reports/household" target="_blank">
            <FileText aria-hidden="true" /> PDF report
          </Link>
        </Button>
      </header>

      {(message || error) && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm" role={error ? 'alert' : 'status'}>
          {error || message}
        </div>
      )}

      <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
        <CardHeader className="border-b border-zinc-200 pb-4">
          <CardTitle>People</CardTitle>
          <CardDescription>{data.members.length === 1 ? 'Your personal household' : 'One shared household plan'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 pt-5">
          <ul className="divide-y divide-zinc-200">
            {data.members.map((member) => (
              <li key={member.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{member.name}</p>
                    <Badge variant="outline" className="rounded-md border-zinc-200 bg-white text-zinc-700">
                      {member.id === data.currentMemberId ? 'You' : member.role === 'OWNER' ? 'Owner' : 'Partner'}
                    </Badge>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">{member.email}</p>
                </div>
                <p className="text-sm tabular-nums text-zinc-600">{member.householdShareBasisPoints / 100}% of shared costs</p>
                {isOwner && member.role === 'MEMBER' && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    className="min-h-11 justify-self-start text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                    onClick={() => {
                      if (!window.confirm(`Remove ${member.name} from this household?`)) return
                      void refreshWith(
                        () => removeHouseholdMember({ data: { memberId: member.id } }),
                        `${member.name} was removed from the household.`,
                      )
                    }}
                  >
                    Remove
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {isOwner && !partner && (
            <form onSubmit={invitePartner} className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-medium">
                Invite your partner
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  placeholder="partner@example.com"
                  className="min-h-11 rounded-md border border-zinc-200 bg-white px-3 text-base font-normal outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 sm:text-sm"
                />
              </label>
              <Button type="submit" disabled={busy || !email} className="min-h-11 wollie-primary-action">
                <Mail aria-hidden="true" /> {busy ? 'Sending…' : 'Send invitation'}
              </Button>
            </form>
          )}

          {inviteUrl && (
            <div className="grid gap-2 rounded-lg border border-zinc-200 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="min-w-0">
                <p className="text-sm font-medium">Invitation link</p>
                <p className="mt-1 truncate text-xs text-zinc-500">{inviteUrl}</p>
              </div>
              <Button type="button" variant="outline" className="min-h-11" onClick={() => void copyInviteLink()}>
                <Copy aria-hidden="true" /> Copy link
              </Button>
            </div>
          )}

          {isOwner && data.invitations.length > 0 && !partner && (
            <div>
              <p className="text-sm font-medium">Pending invitations</p>
              <ul className="mt-2 divide-y divide-zinc-200">
                {data.invitations.map((invitation) => (
                  <li key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span>{invitation.email} · expires {new Date(invitation.expiresAt).toLocaleDateString()}</span>
                    <Button type="button" variant="ghost" disabled={busy} className="min-h-11" onClick={() => void refreshWith(
                      () => revokeHouseholdInvitation({ data: { invitationId: invitation.id } }),
                      'Invitation revoked.',
                    )}>Revoke</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {owner && partner && (
        <HouseholdSplitCard
          owner={owner}
          partner={partner}
          editable={isOwner}
          busy={busy}
          onSave={(ownerPercent) => refreshWith(
            () => updateHouseholdShares({ data: { shares: [
              { memberId: owner.id, shareBasisPoints: ownerPercent * 100 },
              { memberId: partner.id, shareBasisPoints: (100 - ownerPercent) * 100 },
            ] } }),
            'Shared cost split saved.',
          )}
        />
      )}

      <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
        <CardHeader className="border-b border-zinc-200 pb-4">
          <CardTitle>Account ownership</CardTitle>
          <CardDescription>Choose who each balance and transaction belongs to. Joint shares must total 100%.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {data.accounts.length === 0 ? (
            <div className="grid min-h-40 place-items-center text-center text-sm text-zinc-500">
              <div><Users className="mx-auto mb-3 size-5" aria-hidden="true" /><p>Connect a bank account to assign ownership.</p></div>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {data.accounts.map((account) => (
                <AccountOwnershipRow
                  key={`${account.id}:${account.ownership.map((share: { shareBasisPoints: number }) => share.shareBasisPoints).join('-')}`}
                  account={account}
                  members={data.members}
                  busy={busy}
                  onSave={(shares) => refreshWith(
                    () => updateAccountOwnership({ data: { accountId: account.id, shares } }),
                    `${account.name} ownership saved.`,
                  )}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

type Member = ReturnType<typeof Route.useLoaderData>['members'][number]
type Account = ReturnType<typeof Route.useLoaderData>['accounts'][number]

function HouseholdSplitCard({ owner, partner, editable, busy, onSave }: {
  owner: Member
  partner: Member
  editable: boolean
  busy: boolean
  onSave: (ownerPercent: number) => Promise<unknown>
}) {
  const [ownerPercent, setOwnerPercent] = useState(owner.householdShareBasisPoints / 100)
  return (
    <Card className="rounded-lg border-zinc-200 bg-white shadow-none">
      <CardHeader className="border-b border-zinc-200 pb-4">
        <CardTitle>Shared cost split</CardTitle>
        <CardDescription>Used for household budgets, bills, and each person’s safe-to-spend view.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-5 sm:grid-cols-2">
        <PercentField name={owner.name} value={ownerPercent} disabled={!editable || busy} onChange={setOwnerPercent} />
        <PercentField name={partner.name} value={100 - ownerPercent} disabled onChange={() => undefined} />
        {editable && <Button type="button" disabled={busy} className="min-h-11 wollie-primary-action sm:col-span-2 sm:justify-self-start" onClick={() => void onSave(ownerPercent)}>Save cost split</Button>}
      </CardContent>
    </Card>
  )
}

function AccountOwnershipRow({ account, members, busy, onSave }: {
  account: Account
  members: Member[]
  busy: boolean
  onSave: (shares: Array<{ memberId: string; shareBasisPoints: number }>) => Promise<unknown>
}) {
  const initial = account.ownership.find((share: { memberId: string; shareBasisPoints: number }) => share.memberId === members[0]?.id)?.shareBasisPoints ?? 10_000
  const [firstPercent, setFirstPercent] = useState(initial / 100)
  const second = members[1]
  const ownerName = members.find((member) => member.userId === account.connectionOwnerUserId)?.name
  const freshness = account.lastSyncedAt || account.connectionLastSyncedAt
  const shares = members.length === 1
    ? [{ memberId: members[0].id, shareBasisPoints: 10_000 }]
    : [
        { memberId: members[0].id, shareBasisPoints: firstPercent * 100 },
        { memberId: second.id, shareBasisPoints: (100 - firstPercent) * 100 },
      ]
  return (
    <li className="grid gap-4 py-5 first:pt-3 lg:grid-cols-[minmax(13rem,1fr)_minmax(18rem,1.4fr)_auto] lg:items-end">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{account.name}</p>
        <p className="mt-1 text-xs text-zinc-500">{account.institution} · {formatMoney(account.balanceMinor / 100, account.currency)}</p>
        <p className="mt-1 text-xs text-zinc-500">{connectionLabel(account.connectionStatus)}{freshness ? ` · updated ${new Date(freshness).toLocaleString()}` : ' · never updated'}{ownerName ? ` · connected by ${ownerName}` : ''}</p>
      </div>
      {second ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <PercentField name={members[0].name} value={firstPercent} disabled={busy} onChange={setFirstPercent} />
          <PercentField name={second.name} value={100 - firstPercent} disabled onChange={() => undefined} />
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setFirstPercent(100)}>Mine</Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setFirstPercent(0)}>Yours</Button>
            <Button type="button" variant="outline" className="min-h-11" onClick={() => setFirstPercent(50)}>Joint 50/50</Button>
          </div>
        </div>
      ) : <p className="text-sm text-zinc-500">100% {members[0]?.name}</p>}
      {second && <Button type="button" disabled={busy} className="min-h-11 wollie-primary-action" onClick={() => void onSave(shares)}>Save</Button>}
    </li>
  )
}

function PercentField({ name, value, disabled, onChange }: { name: string; value: number; disabled: boolean; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {name}
      <span className="relative block">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Math.min(100, Math.max(0, Number(event.currentTarget.value))))}
          className="min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 pr-9 text-base font-normal tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:bg-zinc-50 disabled:text-zinc-500 sm:text-sm"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">%</span>
      </span>
    </label>
  )
}

function connectionLabel(status: string) {
  if (status === 'CONNECTED') return 'Connected'
  if (status === 'NEEDS_RECONNECT') return 'Connection needs attention'
  if (status === 'FAILED') return 'Connection failed'
  if (status === 'SYNCING') return 'Updating'
  return 'Not connected'
}

function errorMessage(value: unknown) {
  return value instanceof Error ? value.message : 'Something went wrong. Please try again.'
}
