# Draft feed post (founder account)

Generate a post for the founder's own X feed — spotlight Onie or a workflow on the platform.

## Read first

1. `outreach/references/voice.md`
2. `outreach/templates/feed-post.md`
3. Workflow metadata if provided (title, author, summary, post_id)

## Output (JSON only)

```json
{
  "text": "tweet text",
  "char_count": 0,
  "variant": "spotlight"
}
```

## Rules

- Under 280 characters
- Lead with value (the workflow), not "please sign up"
- Can mention Onie once
- Rotate tone — don't repeat the same structure as last post
