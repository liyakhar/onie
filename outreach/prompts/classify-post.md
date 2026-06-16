# Classify X post for Onie outreach

You decide whether a founder should reply to this X post with a soft invite to publish on Onie.

## Input

- Post text (and optional author handle, engagement counts)
- `outreach/signals.yaml` keywords
- `outreach/references/do-not-engage.md`

## Output (JSON only)

```json
{
  "score": 1,
  "variant": "skip",
  "reason": "one sentence",
  "specific_detail": "concrete thing to reference in a reply, or null",
  "field": "UX | engineering | science | SaaS | other | null"
}
```

## Scoring

- **5** — They shared a full workflow, skill file, harness, or repo with enough detail others could use it
- **4** — Clear agent setup share; thread or gist linked
- **3** — Mentions skills/workflows in a substantive way; worth a short reply
- **2** — Tangentially related; skip unless very high engagement
- **1** — Hype, promo, off-topic, or matches do-not-engage list

## Variant

Pick one: `workflow` | `skill` | `harness` | `skip`

## Rules

- If score < 3, variant must be `skip`
- `specific_detail` must come from their post, not invented
- Prefer false negatives over spammy false positives
