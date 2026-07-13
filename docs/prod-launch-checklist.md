# Wollie production launch checklist

This is the short version: build the app, prepare the database, add secrets, then deploy. Do not let the app change the production database automatically on startup.

## 1. Production environment

Required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `SITE_URL`
- `NODE_ENV=production`

Live bank sync:

- Keep `ENABLE_LIVE_BANK_SYNC=false` until real credentials are ready.
- Set `ENABLE_LIVE_BANK_SYNC=true` only with a valid server-side `SIMPLEFIN_ACCESS_URL`.
- Never expose `SIMPLEFIN_ACCESS_URL` with a `VITE_` prefix.

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

## 4. Deploy

The current Cloudflare Pages project is still named `onie`, so the deploy command keeps that project name until the Cloudflare project is renamed on purpose.

```bash
pnpm deploy
```

After deploy, smoke test:

- Landing page loads.
- Sign up / sign in works.
- `/app` dashboard loads.
- `/app/accounts` shows either demo mode or live sync mode clearly.
- No old Onie demo login buttons are visible in production.
