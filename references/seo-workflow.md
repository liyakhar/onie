# Onie SEO workflow (from claude-code-seo-guide)

Mapped from [liyakhar/claude-code-seo-guide](https://github.com/liyakhar/claude-code-seo-guide) (Jono Catliff blueprint) to this TanStack Start app.

**Guide pillars:** Keywords → On-page → Technical → Off-page  
**Onie focus:** Informational blog posts only (no local service × city pages).

---

## Step-by-step checklist

Copy and track. Run commands from repo root.

### Phase 1 — Setup

- [x] Editor + agent skills (`.agents/skills/onie-blog`, `onie-keyword-research`)
- [x] Project rules (`AGENTS.md`, brand docs in `docs/brand/`)
- [ ] Optional: copy `on-page-seo.md` from guide repo into `references/on-page-seo.md`

### Phase 2 — Site scaffold (guide v1)

- [x] Public marketing shell: `/`, `/about`, `/blog`, `/app/explore`
- [x] Blog index + post template (`src/routes/blog/`)
- [x] Practitioner profiles (`/p/$slug`)

**Skipped for Onie:** `/services` + city landing pages (`Service-keywords.csv`) — local plumbing demo, not SaaS.

### Phase 3 — Crawlable HTML (guide SSG)

Guide uses Next.js `output: 'export'`. Onie uses **TanStack Start SSR** with per-route `head()` — Google receives full HTML on first response.

- [x] No client-only SEO pages for blog/marketing routes
- [x] `pnpm run build` passes

### Phase 4 — Keyword research (guide SEMrush → DataForSEO)

- [x] `keywords.csv` with clusters, priority, status
- [x] `references/keyword-research.md` — SERP notes + publish queue
- [x] `pnpm seo:keywords` (DataForSEO Labs)
- [x] `pnpm seo:keywords:clean` — drop off-niche API noise
- [ ] Monthly refresh + GSC queries after indexation

**Filters (same as guide):** informational, volume ≥ 100, KD ≤ 30, rank by `Volume / (KD + 1)`.

### Phase 5 — Blog workflow (guide v2 → v6)

For each post, use `.agents/skills/onie-blog/SKILL.md`:

| Guide step | Onie equivalent | Status |
|------------|-----------------|--------|
| v2 Draft from CSV | Pick `Queued` primary | Per post |
| v3 Voice + SERP top-3 | Practitioner voice + WebSearch | Per post |
| v5 On-page checklist | Title, meta, H2, FAQ, internal links | Per post |
| v6 Technical | Route head + JSON-LD (auto in `$slug.tsx`) | Per post |

**Published:**

1. `/blog/document-ai-agent-workflows`
2. `/blog/how-to-write-claude-code-skills`
3. `/blog/claude-code-workflow-examples`
4. `/blog/cursor-rules-vs-skills` ← current

**Next queue (from `keyword-research.md`):**

1. `how to build an mcp server`
2. `shared prompt library for teams`
3. `claude code skills vs rules`

**Cadence:** 1 post/week minimum (guide Phase 10).

### Phase 6 — Service pages

**Skipped** — not applicable to Onie.

### Phase 7 — On-page SEO

Per post checklist (abbreviated from guide):

- Title 50–60 chars, primary near start
- Meta description 150–160 chars
- Primary in first 100 words; direct answer in opener
- 6–8 FAQs (People Also Ask)
- 3–5 internal links, 2–3 authoritative external links
- Author bio + related posts

### Phase 8 — Technical SEO

- [x] `src/routes/sitemap.xml.ts` — dynamic sitemap
- [x] `src/routes/robots.txt.ts`
- [x] Canonical + OG + Twitter on all routes (`src/lib/seo.ts`)
- [x] JSON-LD: Organization, WebSite, Article, FAQ, Breadcrumb
- [x] OG images (`public/og/`, `pnpm seo:og-images`)
- [x] `pnpm seo:verify` — static asset + env checks
- [x] `pnpm seo:lighthouse` — target 100/100/100/100

### Phase 9 — Deploy + Search Console

- [x] Deployed (Railway — set `SITE_URL` + `BETTER_AUTH_URL` in production)
- [ ] `GOOGLE_SITE_VERIFICATION` in `.env.local` → `pnpm seo:gsc`
- [ ] Submit `https://<production-domain>/sitemap.xml` in Search Console
- [ ] Wait 2–4 weeks → add GSC queries to `keywords.csv`

### Phase 10 — Off-page (guide)

- [ ] Backlinks / citations (manual)
- [ ] Not applicable: Google Business Profile (local-only in guide)

---

## Commands

```bash
pnpm seo:keywords              # DataForSEO → keywords.csv
pnpm seo:keywords:clean        # Mark off-niche rows as Skip
pnpm seo:verify                # Pre-deploy SEO gate
pnpm seo:verify -- --production
pnpm seo:lighthouse            # Lighthouse on key routes
pnpm seo:gsc                   # GSC verification files
pnpm seo:og-images             # Regenerate OG PNGs
pnpm run build                 # Must pass before ship
```

---

## Anti-patterns (from guide)

- Do not guess keywords — use `keywords.csv` + tool validation
- Do not reuse primaries in `references/used-keywords.md`
- Do not ship blog posts without green `pnpm run build`
- Do not chase junk keywords (game codes, homework answers) — run `seo:keywords:clean`

---

## References

| File | Purpose |
|------|---------|
| `keywords.csv` | Backlog + metrics |
| `references/used-keywords.md` | Published primaries |
| `references/keyword-research.md` | Clusters + SERP + queue |
| `.agents/skills/onie-blog/SKILL.md` | Post generator |
| `/tmp/claude-code-seo-guide/on-page-seo.md` | Full 80+ item checklist |
