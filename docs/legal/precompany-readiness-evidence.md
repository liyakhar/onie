# Pre-company readiness evidence

Status: in progress. This records technical evidence for private staging; it is not legal approval for public customers.

## Automated evidence

| Area | Evidence | Result |
| --- | --- | --- |
| Staging privacy | Basic-auth gate, no-store/noindex response, signed Stripe webhook exception | Automated tests pass |
| Stripe webhook | Valid test signature accepted; forged signature rejected | Automated tests pass |
| Stripe entitlement | Active, cancel-at-period-end, and canceled subscription events persist the expected state | Automated tests pass |
| Refund behavior | Refund event alone does not cancel recurring billing; operating procedure must refund and cancel | Automated test passes |
| Enable Banking | RS256 provider JWT, transaction normalization, merchant cleanup | Automated tests pass |
| Enable Banking deployment gate | Sandbox requires private staging; production access requires explicit provider approval | Automated tests pass |
| Data export | Personal ownership share and CSV escaping; ownership export | Automated tests pass |
| Account deletion | Active renewal blocks deletion; after cancellation, provider revocation precedes local bank-data deletion | Automated tests pass |

## Provider checks

| Date | Check | Result |
| --- | --- | --- |
| 2026-07-16 | Existing Enable Banking sandbox credentials; Belgian AIS institution list | Passed: BBVA and Mock ASPSP returned |
| 2026-07-16 | Built app loaded Belgian institutions and reached Mock ASPSP consent | Passed until provider control-panel sign-in; founder must finish consent |
| Pending | Stripe hosted test payment/subscription/refund/cancellation | Requires founders to add free Stripe test keys and test Price IDs |
| 2026-07-16 | Account-deletion confirmation request from built app | Local request path passed; remote staging correctly disables the action until transactional email is configured |
| Pending | Password-reset and verified deletion-email delivery | Requires verified Resend staging sender and a founder-controlled test inbox |

## Deployment isolation

- Production's hard-coded Hyperdrive ID was removed from the build configuration.
- A deployment must now select `CLOUDFLARE_PAGES_PROJECT` and `CLOUDFLARE_HYPERDRIVE_ID` explicitly.
- Staging preflight rejects the production Pages project, known production Hyperdrive binding, live Stripe keys, Enable Banking production mode, public-access approval, confirmed legal launch, and confirmed tax launch.
- A safe `pnpm deploy:staging` command runs staging preflight before building or deploying.
- Railway now has a separate `staging` environment with a new empty `Postgres-zd7L` database and a separate `wollie-staging-web` service. No production data was copied.
- The private staging URL is `https://wollie-staging-web-staging.up.railway.app`.
- Unauthenticated remote access returns `401` with `noindex`, `noarchive`, and `no-store`; authenticated access returns `200` with CSP, HSTS, frame denial, MIME protection, referrer policy, and restrictive permissions policy.
- All six migrations applied successfully to the fresh staging database.
- During provisioning, Railway CLI context briefly created a separate empty `Postgres-nrX0` service in production. Its only deployment was immediately stopped and its fresh volume was deleted; it never contained Wollie schema or customer data. The inactive service shell can be removed from the Railway dashboard.

## Simulated customer journey, 2026-07-16

1. Built Node server started behind the staging Basic-auth gate: passed.
2. Disposable user created after checking Terms and Privacy consent: passed.
3. No-card 14-day trial and empty dashboard displayed: passed.
4. Enable Banking loaded the Belgian sandbox list: passed (`BBVA`, `Mock ASPSP`).
5. Mock ASPSP authorization reached Enable Banking consent: passed; final provider control-panel sign-in is manual.
6. Full JSON backup downloaded and parsed as `wollie-finance-backup-v2`: passed.
7. Deletion confirmation request generated: passed; emailed-link completion is manual.
8. Browser identified blocked Google Fonts and external bank-logo calls under the strict CSP: fixed by removing those third-party requests.
9. Full automated tests, TypeScript check, Node build and Cloudflare build: passed.

## Remote Railway journey, 2026-07-16

1. Private access gate and security headers: passed.
2. Disposable account signup with current Terms and Privacy consent: passed.
3. Empty-database onboarding and 14-day no-card trial: passed.
4. Data export download and success confirmation: passed.
5. Enable Banking unavailable state: passed safely; the page clearly requests sandbox application credentials.
6. Stripe unavailable state: passed safely; plan selection reports that the test Price is not configured.
7. Account deletion readiness: corrected after the first run exposed a false success message when email was absent. The deployed UI now disables deletion and explains that secure confirmation email must be configured.
8. Full suite after the correction: 59 tests across 14 files, TypeScript check, and Node production build passed.

## Manual operating rule for a withdrawal/refund

1. Verify the signed-in customer and Stripe invoice.
2. Cancel the subscription immediately or at the legally agreed time.
3. Issue the appropriate Stripe refund.
4. Confirm both Stripe events reached Wollie and access state is correct.
5. Record the request, decision, amount, dates, and accounting treatment without copying card data.
