# Onie (Weavel)

**Onie** is a public feed of agent workflows from practitioners in the field — prompts, skills, file layouts, and setups tagged by discipline and stack.

Production: deploy via Railway (see below).

## Stack

- [TanStack Start](https://tanstack.com/start) (React, SSR)
- [Prisma](https://www.prisma.io/) + PostgreSQL on [Railway](https://railway.com/)
- [Better Auth](https://www.better-auth.com/) (email/password)
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
# Edit DATABASE_URL and BETTER_AUTH_SECRET

# Start Postgres (example with Docker)
docker run --name weavel-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=weavel -p 5432:5432 -d postgres:16

npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open http://localhost:3000

**Demo accounts** (after seed):

| Email | Password |
|-------|----------|
| maya@weavel.demo | demo12345 |
| alex@weavel.demo | demo12345 |
| sam@weavel.demo | demo12345 |

## Deploy to Railway

1. Create a new Railway project
2. Add **PostgreSQL** plugin
3. Add a **service** from this repo (GitHub deploy or `railway up`)
4. Set environment variables:
   - `DATABASE_URL` — from Postgres plugin
   - `BETTER_AUTH_SECRET` — long random string
   - `BETTER_AUTH_URL` — your public URL (e.g. `https://weavel.up.railway.app`)
5. Deploy — `nixpacks.toml` runs `prisma generate`, `db push`, and build

After first deploy, run seed once:

```bash
railway run npm run db:seed
```

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
