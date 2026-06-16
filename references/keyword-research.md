# Onie keyword research

**Date:** 2026-06-16  
**Status:** SERP-informed backlog — **Volume/KD must be validated** in SEMrush, Ahrefs, or DataForSEO before treating numbers as gospel.

## Why this doc exists

Placeholder volumes in the first `keywords.csv` were invented for workflow testing. This pass replaces them with:

1. **Topic clusters** aligned to Onie (practitioner agent workflows, not generic AI hype)
2. **SERP reality** — who ranks, what format wins, what People Also Ask surfaces
3. **A prioritized publish queue** for the next 10 posts
4. **A validation path** when you plug in paid tools

Onie wins on **informational + practitioner** queries where the answer is “here’s how someone in the field actually runs this,” not tool docs alone.

---

## Content pillars (SEO silos)

| Pillar | Onie angle | Example primaries |
|--------|------------|-------------------|
| **Skills & instructions** | SKILL.md, auto-activation, team sharing | cursor rules vs skills, claude code skills |
| **MCP & integrations** | Workflows that call real tools | MCP server setup, connect MCP to Cursor |
| **Workflow documentation** | Public feed as source of truth | document agent workflows, workflow template |
| **Team prompt libraries** | Share + fork workflows | shared prompt library, share AI prompts team |
| **Field-specific workflows** | Science / SaaS / UX examples on Onie | UX research agent workflow, literature review AI |

---

## SERP snapshot (June 2026)

### Cluster A — Cursor rules vs skills
**Primary:** `cursor rules vs skills`

| Ranker type | Examples |
|-------------|----------|
| Official | cursor.com/docs (Skills help, agent best practices) |
| Community | DEV.to comparison posts, Cursor forum threads |
| Gap | Few posts show **side-by-side tests** or **migration** (/migrate-to-skills) |

**Format that wins:** Decision table + when-to-use + copy-paste examples + FAQ.  
**Onie angle:** End with “publish the workflow your team agreed on” → link to Onie explore.

**PAA-style questions to answer:**
- When should I use Cursor rules instead of skills?
- Can I use both rules and skills together?
- How do I migrate rules to skills?

---

### Cluster B — MCP server setup
**Primary:** `how to build an mcp server`

| Ranker type | Examples |
|-------------|----------|
| Official | modelcontextprotocol.io, Anthropic announcement, Skilljar course |
| Tutorial | YouTube walkthroughs, LinkedIn “6 steps” posts |
| Gap | **Cursor + Claude Code config in one post** (mcp.json vs claude mcp add) |

**Format that wins:** Prerequisites → minimal server → client config → verify tool call → deploy checklist.  
**Onie angle:** “Document the MCP workflow you ship” — post the prompts + server layout on Onie.

**Related primaries:** `mcp server cursor setup`, `claude code mcp add`, `model context protocol tutorial`

---

### Cluster C — Claude Code skills
**Primary:** `claude code skills` (head term; long-tail easier)

| Ranker type | Examples |
|-------------|----------|
| Editorial | Substack 101, Medium, KDnuggets Anthropic guide |
| Repo SEO | github.com/anthropics/skills, community skill packs |
| Gap | **Skills for teams** (git-shared `.claude/skills`, review process) |

**Published on Onie:** `how-to-write-claude-code-skills`, `claude-code-workflow-examples`

**Next in cluster:** `claude code skills vs rules`, `claude code hooks tutorial`, `share claude code skills with team`

---

### Cluster D — Team prompt / workflow libraries
**Primary:** `shared prompt library for teams`

| Ranker type | Examples |
|-------------|----------|
| SaaS blogs | Glean, NovaKit, Prompt Wallet |
| Gap | **Agent-era** libraries (skills + MCP + prompts), not ChatGPT-only |

**Format that wins:** Governance model (draft → review → published), metadata schema, anti-patterns.  
**Onie angle:** This is the product thesis — public practitioner workflows beat a Notion graveyard.

**Related:** `share ai prompts with team`, `prompt library governance`, `agent workflow template`

---

### Cluster E — Workflow documentation
**Primary:** `how to document ai agent workflows`

**Published on Onie:** `/blog/document-ai-agent-workflows`

**Next:** `agent observability for developers`, `agent harness documentation`, `workflow versioning ai agents`

---

## Prioritized publish queue (next 10)

Ranked by **product fit × SERP gap × cluster momentum**. Validate volume/KD before committing.

| # | Primary keyword | Priority | Cluster | Rationale |
|---|-----------------|----------|---------|-----------|
| 1 | cursor rules vs skills | P1 | Skills | High intent; Cursor docs rank but comparisons are thin |
| 2 | how to build an mcp server | P1 | MCP | Evergreen; tutorial SERP beatable with practitioner angle |
| 3 | shared prompt library for teams | P1 | Team libs | Direct Onie positioning |
| 4 | claude code skills vs rules | P1 | Skills | Extends published skills post; captures comparison intent |
| 5 | mcp server cursor setup | P2 | MCP | Long-tail; strong IDE audience overlap |
| 6 | agent skills best practices | P2 | Skills | Head term; use checklist + examples format |
| 7 | claude code hooks tutorial | P2 | Skills | Emerging topic; fewer definitive guides |
| 8 | share claude code skills with team | P2 | Team libs | Git + review workflow; Onie CTA natural |
| 9 | agent workflow template | P2 | Documentation | Template download + Onie examples |
| 10 | model context protocol tutorial | P3 | MCP | Broader; use as hub linking to MCP setup post |

---

## Competitors (content, not product)

Sites consistently appearing for our clusters:

- **Official:** Anthropic, Cursor, modelcontextprotocol.io
- **Editorial:** DEV.to, Medium, Substack, KDnuggets
- **Repos:** anthropics/skills, large community skill packs (GitHub)

**Do not try to outrank** official docs for head terms (`what is mcp`). **Do** rank for practitioner comparisons, team workflows, and “how we run this in production.”

---

## Validating with SEMrush / Ahrefs / DataForSEO

### Option A — SEMrush or Ahrefs (manual)
1. Enter seed: `claude code skills`, `mcp server`, `cursor agent skills`
2. Filter: **Informational** intent, **KD &lt; 40** (adjust after you see your domain authority)
3. Export keywords → paste into `keywords.csv` with `Source=semrush` or `Source=ahrefs`
4. Re-score: `Priority score = Volume / (KD + 1)` for informational only

### Option B — DataForSEO script (~$0.02–0.15 per run)

1. Add `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` to `.env.local` ([API access](https://app.dataforseo.com/api-access))
2. Run:

```bash
pnpm seo:keywords
```

Uses guide filters: **informational**, volume ≥ 100, KD ≤ 30. Updates `keywords.csv` and writes `references/keyword-research-last-run.json`.

Optional: `pnpm seo:keywords -- --dry-run` to preview without writing.

MCP for ad-hoc Claude queries: see `.agents/skills/onie-keyword-research/SKILL.md`.

### Option C — Google Search Console (after deploy)
After 2–4 weeks indexed:
- Performance → filter by `/blog/`
- Sort by impressions; double down on queries already showing
- Add new rows to `keywords.csv` with `Source=gsc`

---

## Metrics hygiene

| Label in CSV | Meaning |
|--------------|---------|
| `estimated` | Old placeholder — **replace** |
| `serp-2026-06` | Topic validated via SERP analysis; volume/KD pending |
| `semrush` / `ahrefs` / `dataforseo` | Tool-validated |
| `gsc` | Live site data |

**Rule:** Do not publish `Volume` in `used-keywords.md` until `Source` is a paid tool or GSC.

---

## Maintenance cadence

| When | Action |
|------|--------|
| Before each `/blog` run | Pick top `Queued` row by Priority; skip if primary in `used-keywords.md` |
| Monthly | Refresh 5 seeds in SEMrush/Ahrefs; update Volume/KD |
| After GSC live | Add “quick wins” tab — queries pos 5–20 |
| Quarterly | Prune clusters with no traction; add field-specific posts (Science, SaaS, UX) |

---

## Field-specific expansion (later)

Once core clusters have 2+ posts each:

- `ai workflow for ux research synthesis`
- `literature review ai agent workflow`
- `saas mvp agent workflow claude code`

These map to existing Onie demo posts — use `/p/` pages as internal links.
