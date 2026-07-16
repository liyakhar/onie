#!/usr/bin/env node

import process from 'node:process'
import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY?.trim()
const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID?.trim()
const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID?.trim()
if (!key?.startsWith('sk_test_')) throw new Error('STRIPE_SECRET_KEY must be a Stripe test-mode key.')
if (!monthlyPriceId?.startsWith('price_') || !yearlyPriceId?.startsWith('price_')) {
  throw new Error('Set both Stripe test Price IDs before running this journey.')
}

const stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
const expected = [
  { id: monthlyPriceId, amount: 799, interval: 'month', label: 'monthly' },
  { id: yearlyPriceId, amount: 5_900, interval: 'year', label: 'yearly' },
]

for (const item of expected) {
  const price = await stripe.prices.retrieve(item.id)
  if (!price.active || price.currency !== 'eur' || price.unit_amount !== item.amount) {
    throw new Error(`${item.label} Price must be active, EUR, and ${item.amount} cents.`)
  }
  if (price.type !== 'recurring' || price.recurring?.interval !== item.interval) {
    throw new Error(`${item.label} Price must recur every ${item.interval}.`)
  }
}

let customerId
let subscriptionId
try {
  const customer = await stripe.customers.create({
    email: `wollie-readiness+${Date.now()}@example.com`,
    payment_method: 'pm_card_visa',
    invoice_settings: { default_payment_method: 'pm_card_visa' },
    metadata: { purpose: 'automated_precompany_readiness_test' },
  })
  customerId = customer.id

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: monthlyPriceId }],
    default_payment_method: 'pm_card_visa',
    expand: ['latest_invoice'],
    metadata: { wollieUserId: 'automated-readiness-test' },
  })
  subscriptionId = subscription.id
  if (!['active', 'trialing'].includes(subscription.status)) {
    throw new Error(`Test subscription did not activate; Stripe returned ${subscription.status}.`)
  }

  const scheduled = await stripe.subscriptions.update(subscription.id, { cancel_at_period_end: true })
  if (!scheduled.cancel_at_period_end) throw new Error('Stripe did not schedule cancellation.')

  const invoiceId = typeof subscription.latest_invoice === 'string'
    ? subscription.latest_invoice
    : subscription.latest_invoice?.id
  if (!invoiceId) throw new Error('Stripe did not create a test invoice.')
  const invoice = await stripe.invoices.retrieve(invoiceId, { expand: ['payments'] })
  const payment = invoice.payments?.data.find((item) => item.status === 'paid')
  const paymentIntentId = payment?.payment?.type === 'payment_intent'
    ? payment.payment.payment_intent
    : undefined
  if (!paymentIntentId) throw new Error('Could not find the successful test payment intent.')
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ['latest_charge'] })
  const chargeId = typeof paymentIntent.latest_charge === 'string'
    ? paymentIntent.latest_charge
    : paymentIntent.latest_charge?.id
  if (!chargeId) throw new Error('Could not find the successful test charge.')
  const refund = await stripe.refunds.create({ charge: chargeId, reason: 'requested_by_customer' })
  if (!['pending', 'succeeded'].includes(refund.status || '')) {
    throw new Error(`Test refund returned unexpected status ${refund.status}.`)
  }

  const canceled = await stripe.subscriptions.cancel(subscription.id)
  subscriptionId = undefined
  if (canceled.status !== 'canceled') throw new Error('Stripe did not cancel the test subscription.')

  console.log('Stripe test journey passed: prices, payment, subscription, scheduled cancellation, refund, and final cancellation.')
} finally {
  if (subscriptionId) await stripe.subscriptions.cancel(subscriptionId).catch(() => undefined)
  if (customerId) await stripe.customers.del(customerId).catch(() => undefined)
}
