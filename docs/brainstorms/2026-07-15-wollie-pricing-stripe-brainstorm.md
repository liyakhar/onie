---
date: 2026-07-15
topic: wollie-pricing-stripe
---

# Wollie Pricing and Stripe

## What We're Building

Wollie will be a paid-only personal-finance product with one complete plan. New accounts receive a 14-day free trial without entering a card. After the trial, users choose either €7.99 monthly or €59 yearly, with the annual option presented as the best value.

Stripe Checkout will collect payment details and start the subscription. Stripe's hosted Customer Portal will handle invoices, cancellation, and switching billing intervals. Stripe webhooks will be the source of truth for subscription status; Wollie will never store card details.

## Why This Approach

A single plan keeps the product and its promise easy to understand. The price sits below established personal-finance subscriptions while the annual option creates a meaningful commitment incentive. An app-managed no-card trial removes payment friction, and hosted Stripe surfaces reduce billing risk and maintenance.

## Key Decisions

- One plan with all Wollie features.
- €7.99 per month or €59 per year.
- 14-day trial starts when an account is created; no card is required.
- Full product paywall when the trial ends without an active subscription.
- Pricing, billing settings, account settings, and sign-out remain available after expiry.
- Public `/pricing` page linked from the homepage, login, settings, and paywall.
- Checkout and the customer portal are Stripe-hosted.
- Subscription state is synchronized from signed Stripe webhooks.

## Open Questions Before Live Charges

- Confirm the legal business details and statement descriptor in the Stripe account.
- Confirm VAT/tax collection and registrations before enabling live-mode prices.
- Complete the live webhook and secret configuration after test-mode acceptance.

## Next Steps

Implement the data model, entitlement checks, Stripe endpoints, pricing page, expired-trial paywall, billing settings, test-mode configuration, and end-to-end verification.
