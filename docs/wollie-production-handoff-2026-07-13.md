# Wollie production handoff — July 13, 2026

This document is the honest state of the Wollie pivot after the production push work. It is meant to be the place we can return to without re-discovering everything.

## Short version

Wollie is deployed to production at:

- https://onie.pages.dev/

The app is now a budgeting MVP called **Wollie**, not the old Onie workflow-sharing product.

The public pages and core app pages load in production. The production database has the new finance schema applied. The old demo-user login UI is gone from production. Browser smoke QA passed for the main pages.

But this is **not launch-ready yet** because:

- real SimpleFIN bank credentials are not connected;
- live bank onboarding is not finished;
- production auth is still flaky on Cloudflare Workers for email/password API calls;
- old Onie internal code still exists under the hood and should be cleaned gradually.

## What was done

### Product direction

- Pivoted the project from Onie, a workflow/content platform, into Wollie, a simple budgeting app.
- Reworked the main product narrative around synced accounts, reviewed spending, budgets, recurring bills, and insights.
- Renamed visible product copy and metadata to Wollie.
- Kept the Cloudflare project name as `onie` for now, so the live URL is still `onie.pages.dev`.

### Frontend / product UI

- Rebuilt the experience around a clean budgeting dashboard.
- Added main app sections:
  - dashboard;
  - accounts / bank sync;
  - transactions / activity;
  - budgets;
  - recurring bills;
  - insights;
  - settings.
- Removed old production demo-account buttons from the login page.
- Kept the UI intentionally minimal and simple for MVP evaluation.

### Finance foundation

- Added finance data models for:
  - budget workspaces;
  - bank connections;
  - financial accounts;
  - transactions;
  - monthly budgets;
  - category rules;
  - recurring payments.
- Added a SimpleFIN service foundation.
- Added demo finance data so the app can show a coherent budgeting product before live bank sync is connected.
- Added route loaders that use the shared demo finance data on Cloudflare. This avoids the previous production error:
  - `Server function info not found`

### Production database

- Production database migration was applied.
- Railway initially failed on `prisma migrate deploy` because the production database was not empty.
- We generated a targeted Prisma diff inside Railway, applied the missing finance tables, and marked the migration as applied.
- After that, production drift check returned an empty migration:
  - `-- This is an empty migration.`
- Railway deployment was verified successful after the migration fix.

### Production env vars

Cloudflare production secrets were confirmed for the core app:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- `SITE_URL`

Railway also has the core auth/database variables needed by the backend service.

SimpleFIN/live-bank-sync secrets are **not** configured yet.

### Deployment

- Branch pushed:
  - `liya/bank-sync-budgeting-app`
- Main production site deployed to Cloudflare Pages:
  - https://onie.pages.dev/
- The latest successful production deploy checked during this work was:
  - `https://37e737e7.onie.pages.dev`

### Verification done

Local checks passed:

```bash
pnpm generate-routes
pnpm test
pnpm run build:cf
```

Notes:

- `pnpm test` passes, but Vitest prints a noisy React/module shutdown warning. It exits successfully.
- `pnpm run build:cf` passes, but still prints Prisma/WASM build warnings. The Cloudflare build completes.

Production HTTP smoke checks passed:

- `/`
- `/login`
- `/app`
- `/app/accounts`

Production browser QA passed with:

```bash
node scripts/browser-qa-prod.mjs https://onie.pages.dev
```

The QA script checks:

- homepage;
- login;
- app dashboard;
- accounts;
- transactions;
- budgets;
- recurring bills;
- insights;
- settings.

It also checks that the rendered pages do not contain:

- old demo account names;
- `Demo accounts`;
- `Server function info not found`;
- generic application error strings.

## What is not done yet

### 1. Real bank sync is not connected

Current state:

- The app has SimpleFIN/service foundation.
- Production displays demo/sample finance data.
- No real `SIMPLEFIN_ACCESS_URL` is configured.
- No live user bank connection flow is ready.

Needed next:

- Choose and configure the real bank-sync provider credentials.
- Add the production secret:
  - `SIMPLEFIN_ACCESS_URL`
- Only then enable:
  - `ENABLE_LIVE_BANK_SYNC=true`
- Build the user-facing connect-bank onboarding flow.
- Add safe states for:
  - connection pending;
  - sync failed;
  - no accounts found;
  - user disconnects bank;
  - provider unavailable.

### 2. Production email/password auth is flaky

Current state:

- Production signup sometimes succeeds.
- Production signin sometimes succeeds.
- But repeated smoke tests also produced Cloudflare 500s.
- Cloudflare log tail captured this production exception:

```text
The Workers runtime canceled this request because it detected that your Worker's code had hung and would never generate a response.
```

Important finding:

- A created smoke-test user had a credential account row.
- The stored password hash verified correctly inside the Railway/Node runtime.
- So the data itself is valid.
- The problem appears to be Cloudflare Workers runtime behavior around the Better Auth password endpoint, likely the password hashing/verification path hanging in Workers intermittently.

Needed next:

- Fix Better Auth password hashing/verification for Cloudflare Workers.
- Possible directions:
  - configure a Workers-safe password implementation;
  - move auth API endpoints to Railway instead of Cloudflare Workers;
  - confirm Better Auth + Prisma + Workers runtime compatibility for this exact version.
- After fixing, rerun multiple signup/signin smoke attempts, not just one.

Safe launch call:

- Do **not** call auth launch-ready until signup and signin pass repeatedly in production.

### 3. SimpleFIN cost/credentials are still a product decision

Current state:

- No real SimpleFIN credentials are connected.
- We have not confirmed exact monthly/runtime cost for live usage.

Needed next:

- Create/configure the real SimpleFIN account.
- Confirm cost structure.
- Decide whether the user pays before connecting a bank, or whether we absorb early tester costs.
- Add billing/usage guardrails before opening it widely.

### 4. Old Onie internals still exist

Current state:

- Public user-facing pages are now Wollie.
- The old demo account UI is gone.
- But old Onie concepts still exist in the repo/database:
  - posts;
  - comments;
  - likes;
  - profiles;
  - follows;
  - workflow/content routes or server files;
  - some asset/chunk names still include `OnieMark`.

Needed next:

- Gradually remove unused Onie routes, models, server functions, and UI components.
- Keep auth/profile pieces only if they are still useful for Wollie.
- Avoid deleting database tables blindly until production data impact is understood.

### 5. Production domain/project naming is still old

Current state:

- Live URL is still:
  - `https://onie.pages.dev/`
- Cloudflare Pages project is still named:
  - `onie`

Needed next:

- Decide whether to rename the Cloudflare project.
- Add a real Wollie domain.
- Update:
  - `SITE_URL`;
  - `BETTER_AUTH_URL`;
  - SEO canonical URLs;
  - social preview URLs;
  - any OAuth callback URLs.

### 6. Launch-level QA is not finished

Current state:

- Browser smoke QA passed for main pages.
- This is not the same as full product QA.

Needed next:

- Manually test signup/login in a real browser after the auth fix.
- Test mobile layouts.
- Test keyboard/focus states.
- Test empty states.
- Test error states.
- Test real bank sync once credentials exist.
- Test production reset-password flow once email delivery is configured.

## Useful commands

### Build and test

```bash
pnpm generate-routes
pnpm test
pnpm run build:cf
```

### Production browser smoke QA

```bash
node scripts/browser-qa-prod.mjs https://onie.pages.dev
```

### Deploy to Cloudflare production

The Cloudflare project is still named `onie`.

```bash
npx wrangler pages deploy dist --project-name=onie --branch=main
```

### Check production secrets

```bash
npx wrangler pages secret list --project-name=onie
```

### Railway migration check

```bash
railway ssh "pnpm db:migrate:diff:prod"
```

Expected healthy output after the migration work:

```text
-- This is an empty migration.
```

## Recommended next work order

1. Fix production auth on Cloudflare Workers.
2. Re-run production signup/signin smoke tests until stable.
3. Decide SimpleFIN credentials/cost path.
4. Build real bank-connect onboarding.
5. Add a proper Wollie domain.
6. Clean old Onie internals.
7. Do full launch QA.

## Current honest launch status

Wollie is deployed and viewable as a budgeting MVP.

It is good enough for internal review and product direction evaluation.

It is **not** ready to invite real users yet because auth and real bank sync are not finished.
