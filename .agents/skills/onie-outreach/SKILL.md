---
name: onie-outreach
description: >-
  Discovers X posts where practitioners share agent skills, workflows, or harnesses;
  classifies and drafts personalized founder replies inviting them to publish on Onie;
  queues drafts for human approval before send. Use for /outreach, X growth, or workflow-share replies.
version: 0.1.0
---

# `/outreach` — X outreach for Onie

Founder-led outreach from your **personal** X account. Discover → classify → draft → **you approve** → send.

---

## Before you start

Read these files:

1. `docs/brainstorms/2026-06-16-x-outreach-automation-brainstorm.md` — strategy
2. `outreach/config.yaml` — limits, approval gate
3. `outreach/signals.yaml` — keywords and filters
4. `outreach/references/voice.md` — tone (personal, not brand bot)
5. `outreach/references/onie-pitch.md` — what Onie is
6. `outreach/references/do-not-engage.md` — skip rules

Ensure `.env.local` has `X_HANDLE` set. X API tokens required only for discover/send scripts.

---

## Inputs

- **No args** → run discovery from `signals.yaml` (or ask user to paste 1–5 post URLs)
- **URL(s)** → skip discovery; classify and draft for each URL
- **`--review`** → open `outreach/queue/pending.jsonl` for approve/edit/skip

---

## Workflow checklist

```
- [ ] 1. Load config + signals + references
- [ ] 2. Discover candidates (API search OR user-pasted URLs)
- [ ] 3. For each candidate: classify (prompts/classify-post.md) → skip if score < min_classify_score
- [ ] 4. Draft reply (prompts/draft-reply.md + matching template)
- [ ] 5. Append to outreach/queue/pending.jsonl with status: pending
- [ ] 6. Present drafts to user — approve / edit / skip
- [ ] 7. On approve: run send (when scripts/outreach/send.mjs exists) OR user copies manually
- [ ] 8. Log sent items to outreach/queue/sent.jsonl
```

---

## pending.jsonl row shape

```json
{
  "id": "uuid",
  "created_at": "ISO8601",
  "status": "pending",
  "post_url": "https://x.com/...",
  "post_text": "...",
  "author_handle": "@...",
  "classify": { "score": 4, "variant": "skill", "specific_detail": "...", "field": "engineering" },
  "draft_text": "...",
  "approved_text": null,
  "sent_at": null
}
```

---

## Paste-URL mode (v1 — no API tier required)

When X API search isn't set up:

1. User pastes URLs of posts they found in their timeline
2. Fetch post text (browser or manual paste)
3. Run classify + draft
4. User reviews and posts reply manually or via send script

---

## Daily limits

Respect `config.yaml` → `daily_limits`. Count rows in `sent.jsonl` for today before sending.

---

## Scripts

| Command | Purpose | API needed? |
|---------|---------|-------------|
| `pnpm outreach:check` | Readiness dashboard | No |
| `pnpm outreach:draft -- --url <url> --text "..."` | Classify + draft one post | No |
| `pnpm outreach:batch -- outreach/examples/candidates.example.jsonl` | Batch draft from file | No |
| `pnpm outreach:discover -- --file <jsonl>` | Discover + draft from pasted posts | No |
| `pnpm outreach:review` | Approve / edit / skip | No |
| `pnpm outreach:copy` | Print approved drafts for manual post | No |
| `pnpm outreach:feed -- --examples` | Draft founder feed posts | No |
| `pnpm outreach:oauth` | Get access + refresh tokens | Client ID/secret |
| `pnpm outreach:fetch -- --url <tweet-url>` | Fetch tweet + draft | Yes |
| `pnpm outreach:discover -- --search` | X API keyword search | Yes (+ Basic tier) |
| `pnpm outreach:send` | Post approved replies | Yes |

Optional: set `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` for LLM-polished drafts (`--no-llm` to disable).

See `docs/plans/2026-06-16-x-outreach-automation-plan.md` for architecture.

---

## Quality bar

- Every reply references something **specific** from their post
- Sounds like a person, not a growth bot
- Invite is optional ("if you want", "no pressure")
- Never send without explicit user approval in v1
