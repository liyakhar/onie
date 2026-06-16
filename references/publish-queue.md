# Blog publish queue

**Source of truth for metrics:** `keywords.csv` (repo root)  
**Published primaries (never reuse):** `references/used-keywords.md`  
**Pick next keyword:** `pnpm blog:next`

One **primary keyword = one blog post**. Run the [onie-blog skill](.agents/skills/onie-blog/SKILL.md) (or ask: *"write the next blog post"*).

---

## Published (4)

| # | Primary | URL |
|---|---------|-----|
| 1 | how to document ai agent workflows | `/blog/document-ai-agent-workflows` |
| 2 | how to write claude code skills | `/blog/how-to-write-claude-code-skills` |
| 3 | claude code workflow examples | `/blog/claude-code-workflow-examples` |
| 4 | cursor rules vs skills | `/blog/cursor-rules-vs-skills` |

---

## Up next (recommended order)

Edit **Target** when you schedule; leave blank for flexible pacing.

| Order | Primary | Vol | KD | P | Target | Notes |
|-------|---------|-----|----|---|--------|-------|
| 1 | how to build an mcp server | 480 | 2 | P1 | | Best technical fit; MCP cluster |
| 2 | shared prompt library for teams | — | — | P1 | | Onie positioning post |
| 3 | mcp server cursor setup | — | — | P1 | | Long-tail after MCP server post |
| 4 | claude code skills vs rules | — | — | P1 | | Link from skills + rules posts |
| 5 | install claude code | 22200 | 11 | P1 | | High volume; broad install guide |
| 6 | agent skills best practices | — | — | P1 | | Checklist format |
| 7 | claude code hooks tutorial | — | — | P2 | | Emerging topic |
| 8 | share claude code skills with team | — | — | P2 | | Team / Onie CTA |
| 9 | agent workflow template | — | — | P2 | | Template + /p/ examples |
| 10 | claude code mcp add | 110 | 17 | P1 | | Navigational; pair with MCP posts |

**Later (P2–P3):** prompt library governance, SKILL.md format, subagents, field silos (UX / science / SaaS), migrate-to-skills, public workflow feed.

**Skip or merge (overlap):** `when to use skills vs rules` → cover inside existing comparison posts, not a standalone unless SERP demands it.

---

## Daily / batch workflow

### Option A — Manual (simplest)

Each day in Cursor chat:

```text
Write the next SEO blog post for Onie. Use onie-blog skill and pnpm blog:next.
```

Or specify a keyword:

```text
/blog how to build an mcp server
```

After each post:

1. `pnpm run build`
2. Deploy when ready
3. `pnpm blog:next` confirms what’s next

### Option B — Cursor Automation (scheduled)

1. Cursor → **Automations** → New
2. **Trigger:** Schedule (e.g. every weekday 9am)
3. **Repo:** `weavel`, branch `main`
4. **Prompt:**

```text
Read .agents/skills/onie-blog/SKILL.md and references/publish-queue.md.
Run: pnpm blog:next
Write that blog post end-to-end. pnpm run build must pass.
Open a PR with the changes; do not merge without review.
```

5. Review the PR each day before merge/deploy.

### Option C — Recurring chat loop (local)

In Agents chat:

```text
/loop 1d Write the next Onie SEO blog post using onie-blog skill and pnpm blog:next. Build must pass.
```

Runs once per day while Cursor is open. Stop when the queue is empty.

---

## Cadence (guide default)

- **Minimum:** 1 post / week for SEO momentum  
- **Aggressive:** 1 post / day → ~23 queued posts ≈ 4–5 weeks  
- **Batch:** 2–3 posts in one session, deploy once — fine if quality stays high

---

## After each post (checklist)

- [ ] `references/used-keywords.md` updated
- [ ] `keywords.csv` row → `Status=Published`
- [ ] `pnpm run build` green
- [ ] Deploy production
- [ ] (Optional) `pnpm seo:keywords` monthly to refresh Volume/KD
