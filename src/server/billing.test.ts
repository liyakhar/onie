import type Stripe from 'stripe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const upsert = vi.fn()
const findFirst = vi.fn()
const findUser = vi.fn()

vi.mock('#/server/db-access.server', () => ({
  getDb: vi.fn(async () => ({
    billingSubscription: { findFirst, upsert },
    user: { findUnique: findUser },
  })),
}))

vi.mock('#/server/session.server', () => ({
  getSessionUser: vi.fn(),
}))

import {
  constructStripeEvent,
  handleStripeEvent,
  isFounderEmail,
  loadBillingAccess,
  shouldCollectCheckoutTermsConsent,
} from './billing.server'

function subscription(
  status: Stripe.Subscription.Status,
  cancelAtPeriodEnd = false,
): Stripe.Subscription {
  return {
    id: 'sub_test_wollie',
    customer: 'cus_test_wollie',
    metadata: { wollieUserId: 'user_1' },
    status,
    cancel_at_period_end: cancelAtPeriodEnd,
    items: {
      data: [
        {
          current_period_end: 1_800_000_000,
          price: { id: 'price_test_monthly' },
        },
      ],
    },
  } as unknown as Stripe.Subscription
}

function event(type: string, object: object): Stripe.Event {
  return { type, data: { object } } as unknown as Stripe.Event
}

describe('Stripe test-mode event handling', () => {
  beforeEach(() => {
    upsert.mockReset()
    findFirst.mockReset().mockResolvedValue(null)
    findUser.mockReset().mockResolvedValue({ id: 'user_1' })
  })

  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.FOUNDER_EMAILS
  })

  it('grants subscription state after a successful test subscription event', async () => {
    await handleStripeEvent(event('customer.subscription.created', subscription('active')))

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user_1' },
      create: expect.objectContaining({ status: 'active', cancelAtPeriodEnd: false }),
      update: expect.objectContaining({ status: 'active', cancelAtPeriodEnd: false }),
    }))
  })

  it('records cancellation at period end without prematurely marking it canceled', async () => {
    await handleStripeEvent(
      event('customer.subscription.updated', subscription('active', true)),
    )

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ status: 'active', cancelAtPeriodEnd: true }),
    }))
  })

  it('removes subscribed entitlement after Stripe deletes the subscription', async () => {
    await handleStripeEvent(
      event('customer.subscription.deleted', subscription('canceled', true)),
    )

    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ status: 'canceled', cancelAtPeriodEnd: true }),
    }))
  })

  it('does not change entitlement from a refund event alone', async () => {
    await handleStripeEvent(event('charge.refunded', { id: 'ch_test_refunded' }))
    expect(upsert).not.toHaveBeenCalled()
  })

  it('accepts a valid Stripe test webhook signature and rejects a forged one', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_offline_wollie'
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_offline_wollie'
    const payload = JSON.stringify({ id: 'evt_test', type: 'charge.refunded', data: { object: {} } })
    const { default: StripeClient } = await import('stripe')
    const signature = StripeClient.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET,
    })

    const verified = await constructStripeEvent(new Request('https://staging.test/api/stripe/webhook', {
      method: 'POST',
      body: payload,
      headers: { 'stripe-signature': signature },
    }))
    expect(verified.id).toBe('evt_test')

    await expect(constructStripeEvent(new Request('https://staging.test/api/stripe/webhook', {
      method: 'POST',
      body: payload,
      headers: { 'stripe-signature': 't=1,v1=forged' },
    }))).rejects.toThrow()
  })
})

describe('Founder billing access', () => {
  beforeEach(() => {
    findUser.mockReset()
  })

  afterEach(() => {
    delete process.env.FOUNDER_EMAILS
  })

  it('matches founder emails case-insensitively from comma-separated configuration', () => {
    expect(isFounderEmail('LiyaKharitonova+Wollie@gmail.com', {
      FOUNDER_EMAILS: 'liyakharitonova@gmail.com, liyakharitonova+wollie@gmail.com',
    })).toBe(true)
    expect(isFounderEmail('someone@example.com', {
      FOUNDER_EMAILS: 'liyakharitonova@gmail.com',
    })).toBe(false)
  })

  it('keeps founder access open even when the normal trial has ended', async () => {
    process.env.FOUNDER_EMAILS = 'liyakharitonova@gmail.com,liyakharitonova+wollie@gmail.com'
    findUser.mockResolvedValue({
      email: 'liyakharitonova+wollie@gmail.com',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      billingSubscription: null,
    })

    const billing = await loadBillingAccess('user_founder')

    expect(billing).toEqual(expect.objectContaining({
      hasAccess: true,
      state: 'founder',
      statusLabel: 'Founder access',
    }))
  })
})

describe('Stripe Checkout Terms consent', () => {
  it('is required by default and in production-style configuration', () => {
    expect(shouldCollectCheckoutTermsConsent({})).toBe(true)
    expect(shouldCollectCheckoutTermsConsent({
      STRIPE_CHECKOUT_TERMS_CONSENT: 'true',
    })).toBe(true)
  })

  it('can be disabled explicitly for pre-company private staging', () => {
    expect(shouldCollectCheckoutTermsConsent({
      STRIPE_CHECKOUT_TERMS_CONSENT: 'false',
    })).toBe(false)
  })
})
