---
date: 2026-07-15
topic: paid-launch-hardening
---

# Paid Launch Hardening

## What We're Building

Prepare Wollie for a France/EU paid beta without inventing the founder's legal or tax facts. The repository should enforce technical launch gates, collect subscription consent through Stripe, provide practical privacy controls, and contain review-ready legal, privacy, accounting, and incident-response drafts.

## Why This Approach

The app can implement most controls itself. A lawyer and accountant are most valuable as validators of the founder's identity, consumer-law wording, VAT position, and provider contracts—not as the first authors of blank documents. Unknown facts therefore remain in one explicit launch-facts checklist and must block production preflight.

## Key Decisions

- France/EU B2C is the working jurisdiction until the operator confirms otherwise.
- Enable Banking remains non-public until unrestricted production activation, contract, and KYB are evidenced.
- Stripe Checkout collects Terms consent; tax automation is explicitly configured rather than implied.
- Production readiness fails closed when legal identity, Stripe, email recovery, domain, or bank-provider facts are absent.
- Essential-cookie-only operation does not add a consent banner; adding analytics or advertising later requires a new cookie review.
- Account export can be self-service. Account deletion must also stop future subscription renewal and revoke bank access before local deletion.

## Open Questions

- Final legal entity, registration number, address, VAT regime, and consumer mediator.
- Final owned domain and transactional email sender.
- Refund treatment for voluntary account deletion during a paid period.
- Whether the first launch is France-only or available across the EU.

## Next Steps

Implement the controls and create a short founder completion checklist for the remaining facts and external accounts.
