---
status: ready
priority: p1
issue_id: "001"
tags: [launch, privacy, stripe, enable-banking, security, staging]
dependencies: []
---

# Complete Wollie pre-company staging readiness

Prepare and verify every reversible, non-live-money part of Wollie's paid customer journey before the founders register the Belgian operator.

## Problem Statement

Wollie has billing, bank-sync, privacy, deletion, and production-gate foundations, but the founders need evidence that the product can work safely before paying to form a business. Live Stripe verification, real payments, final legal identity, and unrestricted Enable Banking approval must remain blocked until the operator exists.

## Findings

- The current branch is `liya/bank-sync-budgeting-app` and contains active uncommitted household-finance and launch-readiness work that must be preserved.
- Stripe billing and Enable Banking integrations already exist.
- `.env.local` selects the Enable Banking sandbox.
- The full test suite and Cloudflare build passed on 2026-07-15 before this execution phase.
- Belgian draft legal pages and a beginner/founder launch checklist exist, but the first signed AIPD evidence package is not complete.

## Proposed Solutions

### Option 1: Pre-company private staging

**Approach:** Complete privacy evidence, test-mode billing, sandbox bank sync, deletion/export, security hardening, a separate private staging deployment, and a simulated journey. Keep all live/public gates false.

**Pros:** Validates product and operations before formation cost; preserves legal/provider boundaries.

**Cons:** Cannot prove real payouts, unrestricted bank access, or final legal identity.

**Effort:** Multi-step implementation and verification.

**Risk:** Medium, mainly from external staging configuration and sensitive test credentials.

### Option 2: Wait until the operator exists

**Approach:** Defer all remaining configuration and testing until the business is formed.

**Pros:** Final identity can be configured once.

**Cons:** Formation money is spent before discovering technical blockers.

**Effort:** Lower now, higher launch risk later.

**Risk:** Medium.

## Recommended Action

Execute Option 1 on the current feature branch. Use only Stripe test mode and Enable Banking sandbox/founder-restricted access. Deploy to a separate staging target, never the production `wollie` project, and record every external/manual blocker.

## Technical Details

**Affected areas:**
- `docs/legal/` and launch evidence documents
- Stripe billing routes/server code and integration tests
- Enable Banking sandbox configuration/tests
- account export/deletion flows
- production/staging configuration and security gates
- Cloudflare staging deployment

**Database changes:** No new database change is planned specifically for this readiness work. Existing household migrations belong to concurrent project work and must not be rewritten.

## Acceptance Criteria

- [x] Current behavior/configuration is audited without exposing secrets.
- [x] First Belgian AIPD/privacy evidence package is complete as a reviewable founder draft.
- [x] Stripe test-mode subscription, cancellation, refund-event, and entitlement behavior are verified.
- [x] Enable Banking sandbox configuration and safe founder-account limitations are verified.
- [ ] Export, bank disconnect, account deletion, and renewal cancellation are verified.
- [x] Production/staging security gates and secret handling are improved and tested.
- [x] A separate private staging deployment is created without copying production.
- [x] The complete simulated customer journey is executed and recorded.
- [x] Full tests and Cloudflare build pass.
- [x] Remaining company/provider/manual blockers are documented clearly.

## Work Log

### 2026-07-16 - Execution approved

**By:** Codex

**Actions:**
- User approved completing all pre-company readiness tasks.
- Confirmed work will continue on the current feature branch.
- Confirmed live money and unrestricted public bank access remain out of scope until the operator exists.

**Learnings:**
- Existing branch contains substantial concurrent household-finance work, so edits and tests must preserve it.

### 2026-07-16 - Privacy, security, and simulated journey

**By:** Codex

**Actions:**
- Added the first AIPD, retention/deletion schedule, provider register, and readiness evidence package.
- Added password-protected staging middleware and an isolation preflight that rejects production/cloud/live settings.
- Removed the hard-coded production Hyperdrive binding from generic builds.
- Added Stripe signature/subscription/cancellation/refund-event tests and a real Stripe test-mode verification script.
- Verified the existing Enable Banking credentials against the Belgian sandbox and added runtime deployment gates.
- Added export and deletion-sequence tests.
- Ran the built customer journey through signup/consent, trial, sandbox bank selection, export, and deletion request.
- Removed third-party font and bank-logo requests that were blocked by the strict CSP.
- Passed 57 tests across 13 files, TypeScript checking, the Node build, and the Cloudflare build.

**Remaining:**
- Stripe test keys and test Price IDs are required for the real hosted payment/refund run.
- A founder must sign into Enable Banking to finish Mock ASPSP consent.
- A verified sender/test inbox is required to confirm email delivery and click the deletion link.

### 2026-07-16 - Empty Railway staging deployed

**By:** Codex

**Actions:**
- Created a separate empty Railway `staging` environment, fresh `Postgres-zd7L` database, and independent `wollie-staging-web` service without copying production data.
- Applied all six migrations and deployed the app behind Basic authentication at `https://wollie-staging-web-staging.up.railway.app`.
- Verified public rejection, authenticated access, security headers, signup/legal consent, empty onboarding, export, bank configuration fallback, and Stripe configuration fallback.
- Found that Better Auth could report deletion-email success while its background email task failed. Added a server-side email-readiness check so deletion is disabled with an honest explanation until Resend is configured.
- Passed 59 tests across 14 files, TypeScript checking, and the Node production build after the correction.
- Stopped and removed the fresh volume from an accidentally created empty `Postgres-nrX0` production service; no Wollie schema or customer data was created there. Its inactive service shell remains removable in the Railway dashboard.

**Remaining:**
- Add Stripe test keys, webhook secret, and monthly/yearly test Price IDs for a real hosted payment/refund run.
- Add existing Enable Banking sandbox application ID/private key and allow the Railway staging redirect URL.
- Add a verified Resend sender and founder-controlled inbox, then verify password reset and the emailed deletion link.

## Notes

- Never print or commit provider secrets.
- Do not set live/public launch confirmation flags merely to make preflight pass.
- Do not deploy over the production Cloudflare Pages project.
