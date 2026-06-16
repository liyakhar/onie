# Onie (Weavel)

**Onie** is a public feed of agent workflows from practitioners in the field — prompts, skills, file layouts, and setups tagged by discipline and stack.

Production: deploy via Railway (see below).

## Stack

- [TanStack Start](https://tanstack.com/start) (React, SSR)
- [Prisma](https://www.prisma.io/) + PostgreSQL on [Railway](https://railway.com/)
- [Better Auth](https://www.better-auth.com/) (email/password, Google OAuth)
- [shadcn/ui](https://ui.shadcn.com/) + Tailwind

## Features (MVP)

- Sign up / sign in
- User profiles with field, bio, pinned workflow
- Publish workflows (markdown body, tools, category)
- Follow users and see a **Following** feed
- **Explore** with search + category filter
- Like workflows and comment on posts
- **Top workflows this week** ranking on the feed
- Markdown rendering for workflow bodies
- Claude Code–inspired warm minimal UI

## Local development

```bash
cp .env.example .env.local
# Edit DATABASE_URL, BETTER_AUTH_SECRET, and optionally Google OAuth vars

# Start Postgres (example with Docker)
docker run --name weavel-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=weavel -p 5432:5432 -d postgres:16

npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Google sign-in (optional)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create OAuth client (Web application)
2. **Authorized redirect URI:** `http://localhost:3000/api/auth/callback/google` (use your `BETTER_AUTH_URL` + `/api/auth/callback/google`)
3. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`
4. Restart the dev server — the login page shows **Continue with Google**

**Demo accounts** (after seed):

| Email | Password |
|-------|----------|
| maya@weavel.demo | demo12345 |
| alex@weavel.demo | demo12345 |
| sam@weavel.demo | demo12345 |

## Deploy to Railway

1. Create a Railway project and add **PostgreSQL**
2. Add a service from [github.com/liyakhar/onie](https://github.com/liyakhar/onie) (or `railway up`)
3. Set environment variables on the web service:
   - `DATABASE_URL` — `${{Postgres.DATABASE_URL}}`
   - `BETTER_AUTH_SECRET` — long random string (`openssl rand -base64 48`)
   - `BETTER_AUTH_URL` — your public Railway URL (e.g. `https://onie-web-production.up.railway.app`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional; redirect URI must be `https://<your-domain>/api/auth/callback/google`
   - `NODE_ENV` — `production`
4. Generate a public domain: `railway domain -s <service-name>`
5. Deploy — `nixpacks.toml` runs `prisma generate`, `db push`, and `pnpm build`

**Production:** https://onie-web-production.up.railway.app

After first deploy, seed demo data once (from a machine that can reach the DB):

```bash
railway run -s onie-web -- pnpm exec prisma db seed
```

Or use `DATABASE_PUBLIC_URL` from the Postgres service variables locally.

## Project structure

```
src/
  routes/          # Pages (feed, explore, profile, post, auth)
  server/          # Server functions (posts, profiles, follows)
  components/      # UI components
  lib/             # Auth, categories, utils
prisma/
  schema.prisma    # Data models
```
