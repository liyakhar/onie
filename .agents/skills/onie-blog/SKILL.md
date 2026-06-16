---
name: onie-blog
description: >-
  Generates a production-ready, SEO-optimized Onie blog post from keywords.csv
  using the Claude Code SEO guide patterns: keyword cluster, SERP-informed outline,
  on-page checklist, FAQ schema, and sitemap registration. Use when the user types
  /blog, asks for a new SEO blog post, or wants programmatic blog content for Onie.
version: 1.0.0
---

# `/blog` — Onie blog post generator

Creates an SEO blog post end-to-end for the Onie TanStack Start app. Output: a content file, route registration, keyword tracking updates, and a green `pnpm run build`.

---

## Before you start

Read these files:

1. `keywords.csv` — candidate primaries (informational intent only for blog)
2. `references/used-keywords.md` — primaries already published (never reuse)
3. `/tmp/claude-code-seo-guide/on-page-seo.md` or the SEO guide repo — on-page checklist
4. `src/content/blog/types.ts` — `BlogPost` shape
5. `src/routes/blog/$slug.tsx` — post template (head, JSON-LD, layout)
6. One existing post in `src/content/blog/` — voice and length reference

---

## Inputs

- **No args** → pick the highest-value unused primary from `keywords.csv`:
  - Skip rows marked Published in Notes or listed in `used-keywords.md`
  - Skip `Commercial` intent rows
  - Rank by `Volume / (KD + 1)` descending
  - Announce: `Picking "<keyword>" (vol X, KD Y).`
- **User-supplied keyword** → verify unused, then proceed

---

## Workflow checklist

```
- [ ] 1. Pick primary + build 4–5 keyword cluster
- [ ] 2. WebSearch primary → fetch top 3 organic posts → note format, length, H2 topics, PAA questions
- [ ] 3. Add 1–2 topics top-3 missed
- [ ] 4. Write src/content/blog/<slug>.ts (BlogPost)
- [ ] 5. Register in src/lib/blog.ts
- [ ] 6. Cross-link relatedSlugs on sibling posts
- [ ] 7. Update references/used-keywords.md + keywords.csv Notes
- [ ] 8. pnpm run generate-routes && pnpm run build
```

---

## Content file shape

Create `src/content/blog/<slug>.ts`:

```ts
import type { BlogPost } from '#/content/blog/types'

export const <camelCase>Post: BlogPost = {
  slug: '<kebab-slug>',
  title: '<50–60 chars, primary near start>',
  description: '<150–160 chars, keyword + benefit>',
  publishedAt: 'YYYY-MM-DD',
  readingMinutes: <number>,
  primaryKeyword: '<primary>',
  keywordCluster: ['<primary>', ...],
  author: {
    name: '<practitioner name>',
    role: '<field · stack>',
    bio: '<1–2 sentences, credible>',
  },
  tldr: '<direct answer, 2–4 sentences>',
  relatedSlugs: ['<sibling-slug>'],
  body: `...markdown...`.trim(),
  faqs: [ { question: '...', answer: '...' }, ... ], // 6–8 from PAA
}
```

### Body rules (on-page SEO)

- Primary keyword in first 100 words
- Direct answer in opening paragraph (TL;DR mirrors this)
- Exactly one H1 (rendered from `title` in route — do not duplicate in body)
- Logical `##` / `###` hierarchy only
- Length within ~20% of median top-3 word count (most guides: 1,500–2,500 words)
- **3–5 internal links**: `/blog/...`, `/app/explore`, `/about`
- **2–3 external links**: official docs (platform.claude.com, code.claude.com, aws.amazon.com), `rel="noopener"` via BlogMarkdown
- Short paragraphs, tables/lists where SERP uses them
- No invented stats — cite real docs or omit numbers

### Onie voice

- Practitioner tone — builders sharing what ships, not marketing copy
- No exclamation marks, no emoji, no "unlock/leverage/seamless/game-changer"
- Name tools explicitly (Claude Code, Cursor, MCP)
- End with CTA to Explore or publish on Onie

---

## Register the post

1. Import in `src/lib/blog.ts` and add to `posts` array
2. Set `relatedSlugs` on 1–2 sibling posts for cross-links
3. Sitemap auto-includes via `getAllBlogPosts()` — no manual sitemap edit
4. Append to `references/used-keywords.md`
5. Set `keywords.csv` Notes column to `Published /blog/<slug>`

---

## SEO already wired (do not duplicate)

The route `src/routes/blog/$slug.tsx` handles:

- `buildPageMeta` (title, description, canonical, OG, Twitter)
- `articleJsonLd`, `breadcrumbJsonLd`, `faqPageJsonLd`
- TOC from `extractToc(body)`
- Author card, FAQ section, related guides, Explore CTA

You only supply `BlogPost` content.

---

## Verify

```bash
pnpm run generate-routes
pnpm run build
```

Confirm:

- `/blog` lists the new post
- `/blog/<slug>` renders H1, TOC anchors, FAQ, JSON-LD in page source
- Internal links resolve

---

## Anti-patterns

- Do not reuse a primary from `used-keywords.md`
- Do not add DB migrations — blog is static TypeScript content
- Do not create a separate Next.js page — use `src/routes/blog/$slug.tsx`
- Do not skip FAQ section (6+ entries) or author bio
- Do not ship without green build

---

## Output summary (report to user)

- Primary keyword + volume/KD
- Cluster list
- Top-3 SERP references + format matched
- URL: `/blog/<slug>`
- Files changed
- Build status
