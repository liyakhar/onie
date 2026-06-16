# Draft outreach reply

Personalize a reply template for one X post. The sender is the **founder** (first person "I"), not a brand account.

## Read first

1. `outreach/references/voice.md`
2. `outreach/references/onie-pitch.md`
3. Template for variant: `outreach/templates/reply-{workflow|skill|harness}.md`
4. Classify output (score, variant, specific_detail, field)

## Input

- Original post text and URL
- Classify JSON
- `site_url` from `outreach/config.yaml`

## Output (JSON only)

```json
{
  "text": "final reply text",
  "char_count": 0,
  "template_used": "reply-skill",
  "notes": "optional internal note"
}
```

## Rules

- Under 280 characters unless template allows more (DM only)
- One specific detail from their post in the first sentence
- Mention Onie once; include site URL
- Match voice.md — no marketing speak
- Do not promise features Onie doesn't have
- If you can't personalize well, set text to empty and explain in notes
