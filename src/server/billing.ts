import { createServerFn } from '@tanstack/react-start'
import { getSessionUser } from '#/server/session.server'
import { getFinanceHouseholdForUser } from '#/server/household-access.server'

export const getBillingOverview = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getSessionUser()
  if (!user) return null
  const { loadBillingAccess } = await import('#/server/billing.server')
  const household = await getFinanceHouseholdForUser(user.id)
  if (!household) return { ...(await loadBillingAccess(user.id)), isHouseholdOwner: true }
  const { getDb } = await import('#/server/db-access.server')
  const prisma = await getDb()
  const [billing, owner] = await Promise.all([
    loadBillingAccess(household.ownerUserId),
    household.ownerUserId === user.id
      ? Promise.resolve(user)
      : prisma.user.findUnique({
          where: { id: household.ownerUserId },
          select: { name: true, email: true },
        }),
  ])
  return {
    ...billing,
    isHouseholdOwner: household.role === 'OWNER',
    householdOwnerName: owner?.name || owner?.email || 'the household owner',
  }
})

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: { interval: 'month' | 'year' }) => ({
    interval: data?.interval === 'year' ? 'year' as const : 'month' as const,
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in before choosing a plan.')
    const household = await getFinanceHouseholdForUser(user.id)
    if (household?.role === 'MEMBER') throw new Error('The household owner manages this subscription.')
    const { createStripeCheckout } = await import('#/server/billing.server')
    return { url: await createStripeCheckout(user.id, data.interval) }
  })

export const createCustomerPortalSession = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getSessionUser()
  if (!user) throw new Error('Sign in to manage billing.')
  const household = await getFinanceHouseholdForUser(user.id)
  if (household?.role === 'MEMBER') throw new Error('The household owner manages this subscription.')
  const { createStripePortal } = await import('#/server/billing.server')
  return { url: await createStripePortal(user.id) }
})

export const syncCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: { sessionId: string }) => ({ sessionId: String(data?.sessionId || '') }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in to finish checkout.')
    const { synchronizeCheckoutSession } = await import('#/server/billing.server')
    return synchronizeCheckoutSession(data.sessionId, user.id)
  })
