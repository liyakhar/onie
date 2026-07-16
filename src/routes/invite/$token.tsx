import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { authClient } from '#/lib/auth-client'
import { loginSearch } from '#/lib/auth-nav'
import { buildPageMeta } from '#/lib/seo'
import { acceptHouseholdInvitation, getHouseholdInvitation } from '#/server/household'

export const Route = createFileRoute('/invite/$token')({
  loader: ({ params }) => getHouseholdInvitation({ data: { token: params.token } }),
  head: () => ({
    meta: buildPageMeta({
      path: '/invite',
      title: 'Join a household',
      description: 'Accept a private Wollie household invitation.',
      noindex: true,
    }).meta,
  }),
  component: HouseholdInvitationPage,
})

function HouseholdInvitationPage() {
  const invitation = Route.useLoaderData()
  const { token } = Route.useParams()
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const available = invitation.status === 'PENDING'

  async function accept() {
    setBusy(true)
    setError('')
    try {
      await acceptHouseholdInvitation({ data: { token } })
      await router.navigate({ to: '/app/household' })
      await router.invalidate()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not accept this invitation.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main id="main" className="grid min-h-screen place-items-center bg-zinc-50 px-4 py-12 text-zinc-950">
      <Card className="w-full max-w-lg rounded-lg border-zinc-200 bg-white shadow-none">
        <CardHeader className="border-b border-zinc-200 pb-5">
          <CardTitle>Join {invitation.householdName}</CardTitle>
          <CardDescription>{invitation.invitedBy} invited {invitation.emailHint} to share a household budget.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6">
          {available ? (
            <>
              <p className="text-sm leading-6 text-zinc-600">
                You will be able to see shared balances, transactions, budgets, bills, and safe-to-spend views. Your bank credentials remain connected only to your login.
              </p>
              {!isPending && !session?.user && (
                <Button asChild className="min-h-11 wollie-primary-action">
                  <Link to="/login" search={loginSearch({ redirect: `/invite/${token}` })}>Sign in to accept</Link>
                </Button>
              )}
              {session?.user && (
                <Button type="button" disabled={busy} className="min-h-11 wollie-primary-action" onClick={() => void accept()}>
                  {busy ? 'Joining…' : 'Accept invitation'}
                </Button>
              )}
            </>
          ) : (
            <div className="grid gap-3 text-sm leading-6 text-zinc-600">
              <p>This invitation is {invitation.status.toLowerCase()}. Ask the household owner for a new link.</p>
              <Button asChild variant="outline" className="min-h-11"><Link to="/">Return to Wollie</Link></Button>
            </div>
          )}
          {error && <p className="text-sm font-medium" role="alert">{error}</p>}
          <p className="text-xs text-zinc-500">Invitation expires {new Date(invitation.expiresAt).toLocaleString()}.</p>
        </CardContent>
      </Card>
    </main>
  )
}
