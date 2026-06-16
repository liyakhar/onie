---
date: 2026-06-16
status: active
topic: x-outreach-automation
brainstorm: docs/brainstorms/2026-06-16-x-outreach-automation-brainstorm.md
implemented: 2026-06-16
---

# X Outreach Automation — Implementation Plan

## Problem

Grow Onie by engaging where practitioners already share agent workflows on X. Replies come from the **founder's personal account** (decided). System must feel human, stay within X policy, and run locally with approve-before-send.

## Scope

**In v1:**
- File-based config, signals, templates, prompts, queue
- Agent skill (`onie-outreach`) for discover → classify → draft → review workflow
- Script stubs for X API integration
- Reference docs for pitch and voice

**Out of v1:**
- Auto-send without approval
- Cloud-hosted bot
- Non-X channels (LinkedIn, etc.)
- CRM / analytics dashboard

## Requirements traceability

| Requirement | Implementation |
|-------------|----------------|
| Find skill/workflow/harness posts | `outreach/signals.yaml` + `scripts/outreach/discover.mjs` |
| Draft personalized replies | `outreach/prompts/` + `outreach/templates/` + `draft.mjs` |
| Mention Onie naturally | `outreach/references/onie-pitch.md` + `voice.md` |
| Approve before send | `review.mjs` + `queue/pending.jsonl` |
| Personal account replies | `outreach/config.yaml` + `X_HANDLE` in `.env` |
| Own feed posts | `templates/feed-post.md` + `feed.mjs` (phase 2) |
| Audit trail | `queue/sent.jsonl` (gitignored) |

## Implementation units

### Unit 1: Reference layer (done in scaffold)

Files:
- `outreach/references/onie-pitch.md`
- `outreach/references/voice.md`
- `outreach/references/do-not-engage.md`

No tests — copy/docs only.

### Unit 2: Config and signals

Files:
- `outreach/config.yaml`
- `outreach/signals.yaml`
- `.env.example` — add `X_API_*` vars
- `.gitignore` — `outreach/queue/*.jsonl`

### Unit 3: Templates and prompts

Files:
- `outreach/templates/reply-workflow.md`
- `outreach/templates/reply-skill.md`
- `outreach/templates/reply-harness.md`
- `outreach/templates/dm-follow-up.md`
- `outreach/templates/feed-post.md`
- `outreach/prompts/classify-post.md`
- `outreach/prompts/draft-reply.md`
- `outreach/prompts/feed-idea.md`

### Unit 4: Agent skill

Files:
- `.agents/skills/onie-outreach/SKILL.md`

Follow `.agents/skills/onie-blog/SKILL.md` structure: checklist, inputs, file reads, workflow phases.

### Unit 5: Scripts (sequential build)

| Script | Purpose | Depends on |
|--------|---------|------------|
| `discover.mjs` | X API search → raw candidates JSON | X API credentials |
| `draft.mjs` | Classify + draft → `pending.jsonl` | LLM (Anthropic/OpenAI env) |
| `review.mjs` | Terminal approve/edit/skip | `pending.jsonl` |
| `send.mjs` | Post approved replies/DMs | OAuth user tokens |
| `feed.mjs` | Draft own-feed posts from Onie DB or static | Phase 2 |

**Pattern to follow:** `scripts/lighthouse-audit.mjs` — standalone Node ESM, reads env, writes JSON output.

### Unit 6: X API setup (manual prerequisite)

1. Create X Developer app at developer.x.com
2. Enable OAuth 2.0 user context
3. Scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
4. Optional v1.1 DMs: `dm.read`, `dm.write`
5. Subscribe to Basic tier if search volume needed
6. Add to `.env.local`:
   ```
   X_CLIENT_ID=
   X_CLIENT_SECRET=
   X_ACCESS_TOKEN=
   X_REFRESH_TOKEN=
   X_HANDLE=your_handle
   ```

## Sequencing

```
Week 1 (manual validation)
  → Use templates by hand on 10 posts
  → Refine voice.md based on responses

Week 2 (discover + draft)
  → Implement discover.mjs (or paste-URL mode first)
  → Implement draft.mjs + classify
  → Skill wires agent through checklist

Week 3 (review + send)
  → review.mjs terminal UI
  → send.mjs with daily_limits from config.yaml
  → Log to sent.jsonl

Week 4 (feed)
  → feed.mjs + feed-idea prompt
```

## Test scenarios

| Unit | Scenario |
|------|----------|
| classify | Skill/workflow post scores ≥ 3; giveaway post scores < 3 |
| draft | Output references one specific detail from source post |
| draft | Includes onie.app link; under 280 chars for replies |
| draft | No "we built" if post is unrelated to agents |
| review | Approve moves item from pending → ready; skip removes |
| send | Respects `daily_limits.replies`; refuses when over limit |
| send | Writes audit row to sent.jsonl with post_id, reply_id, timestamp |

## Risks

| Risk | Mitigation |
|------|------------|
| Spam perception | Personal voice, low volume, human approval |
| X API cost | Start with paste-URL mode before paid search |
| Bad LLM draft | Review gate; voice.md constraints |
| Token leak | `.env` only; queue gitignored |

## Open (defer to implementation)

- Founder's exact `@handle` — set in `.env` as `X_HANDLE`
- Daily review time budget — default 10 replies/day cap
- DMs in v1 — default **public replies only** until templates proven

## Next step

**Done (v1 toolkit):** draft, batch, discover (file mode), review, copy, feed, oauth, fetch, send, classify tests.

**When you have X API:** `pnpm outreach:oauth` → `pnpm outreach:fetch` or `pnpm outreach:discover -- --search` → `pnpm outreach:send`

**Start now without API:** paste posts into `outreach/examples/my-candidates.jsonl` → `pnpm outreach:batch` → `pnpm outreach:review` → `pnpm outreach:copy`
