# Wollie (Weavel)

**Wollie** is a calm budgeting app for seeing bank accounts, recent spending, budgets, recurring payments, and useful money signals in one clean place.

Production target: Cloudflare Pages.

## Stack

- [TanStack Start](https://tanstack.com/start) (React, SSR)
- [Prisma](https://www.prisma.io/) + PostgreSQL on [Railway](https://railway.com/)
- [Better Auth](https://www.better-auth.com/) (email/password, Google OAuth)
- [shadcn/ui](https://ui.shadcn.com/) + Tailwind

## Features (MVP)

- Sign up / sign in
- Budget dashboard
- Accounts / bank-sync status
- Transactions with search and filters
- Budget envelopes
- Recurring payments
- Money insights
- Demo data fallback when live bank sync is not configured
- SimpleFIN-shaped live sync boundary

## Local development

```bash
cp .env.example .env.local
# Edit DATABASE_URL, BETTER_AUTH_SECRET, and optionally Google OAuth / SimpleFIN vars

# Start Postgres (example with Docker)
docker run --name weavel-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=weavel -p 5432:5432 -d postgres:16

npm run db:generate
npm run db:push
npm run dev
```

Open http://localhost:3000

### Bank sync

Wollie can run safely with demo data. To test live SimpleFIN sync, set:

```bash
ENABLE_LIVE_BANK_SYNC="true"
SIMPLEFIN_ACCESS_URL="https://user:password@bridge.simplefin.org/simplefin/..."
SIMPLEFIN_LOOKBACK_DAYS="90"
```

The access URL is read only on the server. Do not expose it with `VITE_` or put it in client code.
If `SIMPLEFIN_ACCESS_URL` is present but `ENABLE_LIVE_BANK_SYNC` is not `true`, Wollie will show live sync as disabled instead of silently using real bank data.

### Google sign-in (optional)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth client (Web application)
2. **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google` (use your `BETTER_AUTH_URL` + `/api/auth/callback/google`)
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`
4. Restart the dev server — the login page shows **Continue with Google**

### Legacy seed data

The old Onie demo seed is disabled by default and refuses to run in production.
For local/staging backfill only:

```bash
SEED_LEGACY_ONIE_CONTENT=true pnpm db:seed
```

## Deploy

See [docs/prod-launch-checklist.md](docs/prod-launch-checklist.md) for the full production checklist.

1. Configure the production database.
2. Set environment variables:
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET` — long random string (`openssl rand -base64 48`)
   - `BETTER_AUTH_URL` — production URL
   - `SITE_URL` — production URL
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional; redirect URI must be `https://<your-domain>/api/auth/callback/google`
   - `ENABLE_LIVE_BANK_SYNC` — `true` only when live bank credentials are ready
   - `SIMPLEFIN_ACCESS_URL` — required when `ENABLE_LIVE_BANK_SYNC=true`
   - `NODE_ENV` — `production`
3. Run `pnpm preflight:prod` with production env loaded.
4. Build with `pnpm run build:cf`.
5. Deploy the generated `dist` directory to Cloudflare Pages.

Helpful commands:

```bash
pnpm preflight:prod   # checks production env shape
pnpm deploy:check     # preflight + Cloudflare build
pnpm deploy           # build + deploy to the existing onie.pages.dev project
```

Do not run `prisma db push` automatically at app start. Apply schema changes as an explicit deployment step after reviewing the Prisma diff.

## Project structure

```
src/
  routes/          # Pages (landing, auth, finance app)
  server/          # Server functions (finance, bank sync, auth-backed data)
  components/      # UI components
  lib/             # Auth, categories, utils
prisma/
  schema.prisma    # Data models
```
