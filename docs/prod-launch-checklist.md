# Wollie production launch checklist

This is the short version: build the app, prepare the database, add secrets, then deploy. Do not let the app change the production database automatically on startup.

## 1. Production environment

Required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `SITE_URL`
- `NODE_ENV=production`

Payments and transactional email:

- Use a Stripe live secret key, live webhook secret, and live monthly/yearly Price IDs.
- Decide whether Stripe automatic tax is enabled and set `STRIPE_AUTOMATIC_TAX=true` or `false` explicitly.
- Configure `RESEND_API_KEY` and a verified `EMAIL_FROM` sender. Test password reset and account-deletion verification end to end.
- Configure the Stripe webhook endpoint and subscribe it to the events handled in `src/routes/api/stripe/webhook.ts`.

Public identity and launch decisions:

- Complete every `LEGAL_*` value in `.env.example`, including the business identity, registration details, email, telephone, publication director, host, and competent Belgian consumer-dispute entity.
- Complete the ordered founder checklist in `docs/paid-customer-launch-steps.md`.
- Confirm that the actual public domain belongs to this product, then set `PUBLIC_DOMAIN_VERIFIED=true`.
- Review `docs/legal/compliance-workbook.md` and set `LEGAL_LAUNCH_FACTS_CONFIRMED=true` only when its factual fields are complete.
- Review `docs/accounting/paid-launch-workbook.md` and set `TAX_LAUNCH_POSITION_CONFIRMED=true` only after choosing and documenting the applicable VAT/tax treatment.

Live bank sync:

- Keep `ENABLE_LIVE_BANK_SYNC=false` until the production encryption secret is installed.
- Set `BANK_SYNC_ENCRYPTION_KEY` to a unique random secret of at least 32 characters.
- Set `ENABLE_LIVE_BANK_SYNC=true` only after Enable Banking has activated the application for the intended scope.
- Set `ENABLE_BANKING_APPLICATION_ID`, `ENABLE_BANKING_PRIVATE_KEY`, and the exact registered `ENABLE_BANKING_REDIRECT_URL`.
- Restricted production mode may access only the founder's whitelisted accounts. Do not expose bank connection to other users until a contract and KYB are complete.
- Set `ENABLE_BANKING_ENVIRONMENT=production` and `ENABLE_BANKING_PUBLIC_ACCESS_APPROVED=true` only after Enable Banking confirms unrestricted production access for customer accounts.
- Do not set `SIMPLEFIN_ACCESS_URL` in production; shared bank credentials are rejected.
- Never expose bank-sync secrets with a `VITE_` prefix.

## 2. Database

Before deploying code that uses the finance tables, review the Prisma schema change and apply it intentionally.

The repo includes an initial migration:

```text
prisma/migrations/20260713193000_wollie_finance_app/migration.sql
```

For a new empty production database, apply the checked-in migration:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm exec prisma migrate deploy
```

Or with the package script:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm db:migrate:deploy
```

For an existing production database that may already have old Onie tables, do not blindly apply the initial migration. First diff from the live database:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

Or with the package script:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm db:migrate:diff:prod
```

If the live database is empty, the diff should match the checked-in initial migration. If the live database already has tables, review the diff and create a targeted migration instead.

To regenerate the initial SQL for review only:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db" pnpm exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script
```

Only after reviewing the SQL, apply the schema change with the deployment method you trust for that database. Avoid automatic `prisma db push` in the production start command.

## 3. Checks

Run these before deploy:

```bash
pnpm preflight:prod
pnpm test
pnpm generate-routes
pnpm run build:cf
```

`preflight:prod` should pass. Warnings are allowed only when they match the launch mode you intentionally chose, for example demo/no-live-bank mode before bank sync credentials are ready.

Before taking the first payment:

- Deploy the legal notice, terms, and privacy notice with the final factual values.
- Complete a real low-value purchase, verify the receipt/invoice and tax evidence, cancel renewal, request an account export, and complete account deletion.
- Confirm that deletion revokes the bank connection and that Stripe will not renew a deleted account.
- Record the first transaction using the bookkeeping workflow in `docs/accounting/paid-launch-workbook.md`.

## 4. Deploy

The current Cloudflare Pages project should be `wollie`.

```bash
pnpm deploy
```

After deploy, smoke test:

- Landing page loads.
- Sign up / sign in works.
- `/app` dashboard loads.
- `/app/accounts` shows either demo mode or live sync mode clearly.
- No old Onie demo login buttons are visible in production.
- Security headers are present on public pages and authenticated pages are `Cache-Control: private, no-store`.
- Password reset email arrives and its link works once.
- Account export downloads and account deletion requires email verification.
