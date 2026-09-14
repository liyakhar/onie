# Stripe test setup

Checked: September 13, 2026

## Created in Stripe test mode

- Product: `prod_VFijkb0SC8gxJ5` — Wollie Household
- Monthly price: `price_1UFDIY7WNCv08xDgrzIhv5TR` — EUR 7.99 / month, tax-inclusive
- Yearly price: `price_1UFDIY7WNCv08xDgmsx2A6yG` — EUR 59.00 / year, tax-inclusive
- Customer Portal config: `bpc_1UFDJv7WNCv08xDgIo33QakA`
- Test webhook endpoint: `we_1UFDJT7WNCv08xDgqbwGDu3c`
- Webhook URL: `https://wollie.pages.dev/api/stripe/webhook`
- Webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## Still required

- Add a Stripe test restricted key or secret key to local/staging secrets as `STRIPE_SECRET_KEY`.
- Add the webhook signing secret to local/staging secrets as `STRIPE_WEBHOOK_SECRET`.
- Keep `STRIPE_AUTOMATIC_TAX=false` until the accountant confirms the tax position and Stripe Tax registrations exist.
- Keep production live payments disabled until the legal operator, tax facts, and live Stripe account are complete.

Do not commit or print Stripe secret keys or webhook signing secrets.
