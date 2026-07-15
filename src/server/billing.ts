import { createServerFn } from '@tanstack/react-start'
import { getSessionUser } from '#/server/session.server'

export const getBillingOverview = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getSessionUser()
  if (!user) return null
  const { loadBillingAccess } = await import('#/server/billing.server')
  return loadBillingAccess(user.id)
})

export const createCheckoutSession = createServerFn({ method: 'POST' })
  .validator((data: { interval: 'month' | 'year' }) => ({
    interval: data?.interval === 'year' ? 'year' as const : 'month' as const,
  }))
  .handler(async ({ data }) => {
    const user = await getSessionUser()
    if (!user) throw new Error('Sign in before choosing a plan.')
    const { createStripeCheckout } = await import('#/server/billing.server')
    return { url: await createStripeCheckout(user.id, data.interval) }
  })

export const createCustomerPortalSession = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await getSessionUser()
  if (!user) throw new Error('Sign in to manage billing.')
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
