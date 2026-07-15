import { createFileRoute } from '@tanstack/react-router'
import { constructStripeEvent, handleStripeEvent } from '#/server/billing.server'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const event = await constructStripeEvent(request)
          await handleStripeEvent(event)
          return new Response('ok')
        } catch (error) {
          console.error('[wollie] Stripe webhook rejected:', error)
          return new Response('Invalid webhook.', { status: 400 })
        }
      },
    },
  },
})
