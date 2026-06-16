---
date: 2026-06-16
topic: x-outreach-automation
---

# X Outreach Automation for Onie

## What We're Building

A **local, human-supervised outreach system** that helps you grow Onie by engaging on X (Twitter) where practitioners already share agent workflows — skills, harnesses, Cursor rules, Claude Code setups, etc.

Two complementary motions:

1. **Reactive outreach** — Find posts where someone shared a workflow/skill/harness. Reply (or DM) inviting them to publish on Onie so others can find it. Tone: helpful, not salesy.
2. **Proactive presence** — Post on your own X feed about Onie, curated workflows, or field-specific examples. Mention Onie naturally when relevant.

The system runs **from your machine** (scripts + agent skill), not as a cloud bot. It should feel like *you* showing up in the right conversations — not spam.

---

## Why This Approach

Three directions were considered:

### Approach A: Fully automated bot (rejected for v1)

Script monitors keywords, auto-replies within minutes, no human review.

**Pros:** Hands-off, scales  
**Cons:** Reads as spam; X TOS risk; generic replies hurt brand; hard to recover from a bad message  
**Best when:** You have a dedicated brand account and strict template-only replies at high volume (still risky)

### Approach B: Human-in-the-loop queue (recommended)

Script **discovers** candidates → **drafts** personalized replies from templates + LLM → you **approve/edit/send** in a daily batch.

**Pros:** Authentic voice; safe; learn what works; fits "from your machine"  
**Cons:** Requires ~10–15 min/day review  
**Best when:** Early growth, founder-led outreach, building trust

### Approach C: Manual-only playbook (too slow)

No automation — just a Notion doc with templates and you search X by hand.

**Pros:** Zero engineering  
**Cons:** Doesn't scale; easy to skip; no learning loop  
**Best when:** Testing message fit before building anything

**Recommendation:** Start with **B**. Add light automation for discovery and drafting; keep send behind approval until reply quality is proven.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary channel | X (Twitter) | User-specified; where workflow sharing happens |
| Send model | Approve-before-send (v1) | Protect brand; avoid spam perception |
| Discovery | Keyword + hashtag monitoring | Match how people actually post skills/workflows |
| Personalization | Template base + LLM fill-in | Consistent Onie mention, tailored to their post |
| Storage | Files in repo (not DB) | Same pattern as `onie-blog` skill; versioned, reviewable |
| Credentials | Local `.env` only | Never commit tokens; same as OAuth setup elsewhere |

---

## What People Share (Target Signals)

Posts worth engaging when they include **shareable practitioner knowledge**:

| Signal type | Examples |
|-------------|----------|
| Skills / rules | "Here's my Cursor skill for…", `.cursorrules`, `SKILL.md` |
| Harnesses / agents | "My Claude Code harness", agent loop, subagent setup |
| Workflows | Step-by-step prompt chains, file layouts, MCP configs |
| Tooling stacks | "How I use X + Y for Z in my field" |
| Open shares | GitHub gists, repo links, thread breakdowns |

**Skip:** Pure hype, product launches unrelated to workflows, engagement bait, already-promotional posts for competing directories.

---

## Message Strategy

### Public reply (default)

Short, specific, adds value. Structure:

1. Acknowledge what they shared (one concrete detail from their post)
2. Why it matters to the community
3. Soft Onie invite — *optional publish*, not a demand

**Example tone (not final copy):**

> Love this harness breakdown — especially the [specific part]. We built Onie for exactly this: practitioners publishing workflows so others in [field] can find them. Happy to help you cross-post if you want it discoverable beyond the thread. onie.app

### DM (secondary, higher intent)

Use when: they asked for feedback, shared a repo, or replied positively. Warmer, can include direct link to `/new`.

### Own feed posts

Rotate: workflow spotlight, "workflow of the week" from Onie, field-specific tips, behind-the-scenes. Link to onie.app or specific `/p/` posts.

---

## Proposed File Structure

Mirror the `onie-blog` skill pattern — a skill + reference data + local queue.

```
.agents/skills/onie-outreach/
  SKILL.md                 # Agent workflow: discover → draft → queue → send

outreach/
  config.yaml              # Rate limits, account handle, site URL, enabled channels
  signals.yaml             # Keywords, hashtags, accounts to watch, negative filters
  templates/
    reply-workflow.md      # Public reply for skill/workflow shares
    reply-skill.md         # Tuned for Cursor/Claude skills
    reply-harness.md       # Tuned for harness/agent setups
    dm-follow-up.md        # After positive reply
    feed-post.md           # Your own feed posts (variants)
  prompts/
    draft-reply.md         # LLM system prompt: personalize template from post context
    classify-post.md       # Is this worth engaging? score + reason
    feed-idea.md           # Generate feed post from recent Onie workflows
  queue/
    .gitkeep
    pending.jsonl          # Drafts awaiting approval (gitignored)
    sent.jsonl             # Audit log (gitignored)
  references/
    onie-pitch.md          # 2–3 sentence product description (canonical)
    voice.md               # Tone rules: helpful, peer-to-peer, not marketing-speak
    do-not-engage.md       # Accounts/topics to skip

scripts/outreach/
  discover.mjs             # Search X API / export → candidate posts
  draft.mjs                # LLM drafts from templates + post text
  review.mjs               # Terminal UI: approve / edit / skip
  send.mjs                 # Send approved items via X API
  feed.mjs                 # Draft or schedule own-feed posts
```

### `signals.yaml` (sketch)

```yaml
keywords:
  - "claude code skill"
  - "cursor rules"
  - "agent workflow"
  - "SKILL.md"
  - "harness"
hashtags:
  - "#ClaudeCode"
  - "#CursorAI"
  - "#AIAgents"
watch_accounts: []          # Optional: practitioners you follow
negative:
  - "giveaway"
  - "waitlist"
  - "nft"
min_engagement: 3           # Optional floor (likes + replies)
```

### `config.yaml` (sketch)

```yaml
site_url: https://onie-web-production.up.railway.app
x_handle: "${X_HANDLE}"     # Personal founder account (decided)
x_brand_handle: "@onie"     # Optional: feed posts only
daily_limits:
  replies: 10
  dms: 5
  feed_posts: 2
require_approval: true
```

---

## Skill Workflow (`/outreach` or `/x-outreach`)

Checklist for the agent (like `onie-blog`):

```
- [ ] 1. Load signals.yaml + references/onie-pitch.md + voice.md
- [ ] 2. Run discover (API or pasted URLs) → candidate posts
- [ ] 3. Classify each post (classify-post.md) → score 1–5, skip < 3
- [ ] 4. Draft replies (draft-reply.md + best template) → pending.jsonl
- [ ] 5. User runs review.mjs → approve / edit / skip
- [ ] 6. Send approved → sent.jsonl + respect daily_limits
- [ ] 7. Optional: feed.mjs for proactive posts from recent Onie workflows
```

---

## Technical Prerequisites

| Requirement | Notes |
|-------------|-------|
| X API access | Developer account + app with OAuth 2.0 user context. **Basic tier** (~$100/mo) needed for meaningful search + post volume. Free tier is very limited. |
| Scopes | `tweet.read`, `tweet.write`, `users.read`; `dm.read` + `dm.write` if DMs |
| Rate limits | Plan for ~10–50 replies/day max in v1; track in `sent.jsonl` |
| LLM | Local or API for classify + draft steps (same as blog skill) |
| Cron (optional) | `discover` every few hours → you review once daily |

**Important:** X prohibits aggressive unsolicited DMs and automated spam. Human approval + low volume + genuine replies keeps you on the right side of policy and community norms.

---

## Success Criteria (v1)

- [ ] 5–10 quality replies sent per week (not volume for its own sake)
- [ ] At least 1 practitioner publishes on Onie from an X conversation within 30 days
- [ ] Zero spam reports or "who is this bot" replies
- [ ] Reply templates iterated based on what gets positive responses
- [ ] Own feed: 2–3 Onie mentions per week without feeling repetitive

---

## Open Questions

1. ~~**Account:** Reply from `@onie` brand account or your personal founder handle?~~ **Decided: personal founder account** — replies and DMs come from you; `@onie` can still be used for brand feed posts later.
2. **Volume appetite:** How many minutes per day for review? (Sets discover frequency.)
3. **DMs in v1:** Public replies only first, or include DMs for high-intent leads?
4. **Discovery source:** X API search vs. manual paste (URLs from your timeline) vs. both?
5. **Feed content:** Only Onie promos, or also amplify existing Onie users' workflows?

---

## Next Steps

1. **Answer open questions** (especially account + approval workflow)
2. → `/ce:plan` for implementation: API setup, script stubs, skill file, first templates
3. **Week 1 manual test:** 10 hand-written replies using `voice.md` draft — validate tone before automating
4. **Week 2:** Build discover + draft + review loop; no auto-send
5. **Week 3+:** Enable send for approved queue; add feed post rotation

---

## Related Assets in Repo

- `src/lib/site.ts` — canonical name, tagline, `@onie` handle
- `docs/brand/onie-name-and-meaning.md` — voice and positioning
- `.agents/skills/onie-blog/SKILL.md` — pattern to copy for skill structure
- `keywords.csv` — SEO keywords (overlap with X signal keywords possible)
