---
name: onie-keyword-research
description: >-
  Run and refresh Onie blog keyword research using SERP analysis plus SEMrush,
  Ahrefs, or DataForSEO (MCP). Updates keywords.csv with validated volume/KD,
  clusters, and priority. Use when the user asks for keyword research, SEMrush,
  Ahrefs, content calendar, or expanding keywords.csv.
version: 1.0.0
---

# Onie keyword research

Produces an updated, honest `keywords.csv` and notes in `references/keyword-research.md`.

---

## Before you start

Read:

1. `references/keyword-research.md` — pillars, clusters, queue
2. `keywords.csv` — current backlog
3. `references/used-keywords.md` — never duplicate primaries
4. `docs/brand/onie-name-and-meaning.md` — voice / positioning

---

## Research modes

### Mode 1 — SERP-only (no API keys)

Use when SEMrush/Ahrefs/DataForSEO unavailable.

1. WebSearch each seed from the five pillars in `keyword-research.md`
2. For top 3 organic results per seed, record:
   - Content format (tutorial, comparison, listicle, docs)
   - Approx word count / H2 topics
   - Gap Onie can fill (practitioner, team, public feed)
3. Add 3–5 long-tail variants per cluster to `keywords.csv`
4. Set `Volume` and `KD` to empty; `Source=serp-YYYY-MM-DD`; set `Priority` P1–P3 manually

### Mode 2 — DataForSEO API script (recommended)

Pay-as-you-go; typically **~$0.02–0.15** per full run for Onie’s seed list.

**Setup (once):**

1. Create account at [dataforseo.com](https://dataforseo.com) and add **$50** deposit
2. Copy API login + password from [app.dataforseo.com/api-access](https://app.dataforseo.com/api-access)
3. Add to `.env.local`:

```bash
DATAFORSEO_LOGIN=your_api_login
DATAFORSEO_PASSWORD=your_api_password
```

**Run (matches SEO guide filters: informational, vol ≥ 100, KD ≤ 30):**

```bash
pnpm seo:keywords
pnpm seo:keywords -- --dry-run   # preview only
```

This calls `scripts/fetch-keywords-dataforseo.mjs`, merges into `keywords.csv`, and writes `references/keyword-research-last-run.json`.

**Optional MCP** (interactive Claude sessions): `npx -y dataforseo-mcp-server` — see [DataForSEO MCP guide](https://dataforseo.com/help-center/setting-up-the-official-dataforseo-mcp-server-simple-guide).

### Mode 3 — SEMrush or Ahrefs (manual export)

1. Keyword Magic Tool → seed → informational filter
2. Export CSV
3. Map columns → `keywords.csv` format
4. Set `Source=semrush` or `Source=ahrefs`

### Mode 4 — GSC refresh (site live)

1. Search Console → Performance → Pages `/blog/*` + Queries
2. Add queries with impressions > 50 and position > 5 as `Status=Queued`, `Source=gsc`
3. These often become fast wins (update existing post vs new post)

---

## keywords.csv schema

```csv
Keyword,Volume,KD,Intent,Status,Priority,Cluster,Source,SERP_Notes,Onie_Angle
```

| Column | Values |
|--------|--------|
| Status | `Published`, `Queued`, `Skip` |
| Priority | `P1` (next), `P2`, `P3` |
| Source | `serp-2026-06`, `dataforseo`, `semrush`, `ahrefs`, `gsc`, `estimated` |
| Volume/KD | Empty until validated; never invent |

**Ranking for next post:** `P1` first, then highest `Volume / (KD + 1)` among `Queued` informational rows.

---

## Output checklist

```
- [ ] 25+ queued keywords across 5 pillars
- [ ] No duplicate primaries vs used-keywords.md
- [ ] Published rows unchanged except Source correction
- [ ] keyword-research.md queue table updated
- [ ] No Volume/KD without real tool source (remove `estimated`)
```

---

## Onie-specific filters

**Include when:**
- Practitioner / team / workflow / skills / MCP / Cursor / Claude Code
- Informational intent
- Answerable with examples from real field work

**Skip when:**
- Generic "best AI tool 2026" listicles
- Pure commercial SaaS comparison (unless Onie adds unique practitioner data)
- Keywords already owned by Anthropic/Cursor docs with no gap
