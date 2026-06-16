# Daily SEO blog automation — agent instructions

Run once per scheduled trigger on repo **liyakhar/onie**.

## Goal

Write **one** new Onie SEO blog post from the keyword queue, verify build, open a **PR** for human review. Do **not** merge or deploy.

## Steps

1. Read `.agents/skills/onie-blog/SKILL.md` — follow it completely.
2. Run `pnpm blog:next` — that is the primary keyword for this run (respects `references/publish-queue.md`).
3. If the keyword is already in `references/used-keywords.md`, run `pnpm blog:next` logic manually: next `Queued` informational row not in used-keywords.
4. **SERP research** — WebSearch primary; note top 3 organic posts (format, H2 topics, PAA).
5. Write `src/content/blog/<slug>.ts` (`BlogPost` shape from `src/content/blog/types.ts`).
6. Register in `src/lib/blog.ts`; add `relatedSlugs` on 1–2 sibling posts.
7. Update `references/used-keywords.md` and set `keywords.csv` row to `Status=Published`.
8. Run `pnpm run generate-routes && pnpm run build` — must pass with no errors.
9. Create a branch `seo/blog-<slug>`, commit, push, open PR.

## Content rules (claude-code-seo-guide)

- Practitioner voice — not marketing slop
- Title 50–60 chars; meta 150–160 chars
- Primary keyword in first 100 words; direct answer in opener
- 6–8 FAQs from People Also Ask
- 3–5 internal links (`/blog/`, `/app/explore`, `/about`)
- 2–3 external links to official docs
- No exclamation marks, emoji, unlock/leverage/seamless

## PR description

- Primary keyword + volume/KD
- URL: `/blog/<slug>`
- Files changed
- Build status
- Note: requires review before merge/deploy

## Do not

- Reuse a primary from `used-keywords.md`
- Merge the PR
- Skip FAQ or build verification
- Write about off-niche keywords (`Status=Skip` in CSV)
