import type { BlogPost } from '#/content/blog/types'

export const sharedPromptLibraryPost: BlogPost = {
  slug: 'shared-prompt-library-for-teams',
  title: 'Building a shared prompt library for teams',
  description:
    'How to organize, version, and share AI prompts across teams with governance, search, and approval workflows that scale from 5 to 500 people.',
  publishedAt: '2026-06-24',
  readingMinutes: 9,
  primaryKeyword: 'shared prompt library for teams',
  keywordCluster: [
    'shared prompt library for teams',
    'team prompt management',
    'prompt governance',
    'prompt versioning',
    'prompt approval workflow',
    'ai prompt organization',
  ],
  author: {
    name: 'Alex Rivera',
    role: 'Backend engineer · AI infrastructure',
    bio: 'Builds prompt ops infrastructure for teams moving from Notion docs to centralized libraries. Runs the infrastructure setup workshops on Onie.',
  },
  tldr:
    'A shared prompt library is central version control for your team\'s best AI workflows. Store prompts with metadata (cluster, model, version), tag them by use case, add approval gates before deploy, and track which versions work. Start with a shared folder or a simple registry in git; grow into a governance layer once teams cross 20+ people. The ROI is fastest in customer-facing workflows (support, marketing copy) where inconsistency is visible.',
  relatedSlugs: ['prompt-library-governance', 'share-claude-code-skills-with-team', 'document-ai-agent-workflows'],
  body: `
## Why shared prompts matter more than tools

Teams often skip building a prompt library because it sounds like tooling overhead. The real cost is already there — it\'s just invisible.

Your marketing team writes a prompt for customer tone. Your support team writes the same thing again. Three weeks later, your product team writes a slightly different version for onboarding emails. Each produces slightly different output. Customers notice the tone shift.

A shared prompt library is not about which tool you use. It\'s about stopping that waste. It lets one person figure out what works, then lets everyone else ship that immediately instead of starting from zero.

## What lives in the library

Think of a shared prompt library like a monorepo for AI workflows. Each entry includes:

**The prompt text** — the actual instructions (usually 50–200 words, sometimes longer for complex tasks).

**Metadata** — who wrote it, when, what model it targets (Claude 3.5, GPT-4, etc.), and which version is live. Git handles versioning; the library tracks which commit is in production.

**Cluster tags** — use case labels like "support", "marketing-copy", "code-review", "data-synthesis". Tag each prompt so teammates can browse by workflow instead of scrolling a flat list.

**Owner and approval state** — who can edit it, who approved the current version, which team owns maintenance. This prevents orphaned prompts when people leave.

**Performance notes** — not required, but invaluable: "This works best on Claude 3.5 for summaries over 5k tokens; GPT-4 for structured JSON." Document the tradeoffs you learned so the next person does not re-learn them.

That is it. A spreadsheet, a git folder with markdown files, or a lightweight app like Prompt Wallet or TeamPrompt can store this. Start with git.

## Basic setup: git + markdown

The simplest shared library is a git-tracked folder:

\`\`\`
team-prompts/
  prompts/
    customer-support/
      tone-guide.md
      escalation-classifier.md
    marketing/
      email-subject-lines.md
      blog-outline-generator.md
    engineering/
      code-review.md
      architecture-writeup.md
  REGISTRY.md
  .github/workflows/lint-prompts.yml
\`\`\`

Each folder under \`prompts/\` is a cluster. Each markdown file is a prompt with frontmatter:

\`\`\`markdown
---
name: Customer Tone Guide
owner: support-team
version: 2.1
approved: 2026-06-20
models: claude-3.5-sonnet, claude-opus
tags: customer-service, tone, foundational
---

You are a support specialist for a SaaS product...
\`\`\`

Tag one as "foundational" (the live one). When you improve it, bump the version, create a new file or update the markdown, commit with a clear message, and tag the commit. No database, no API keys, no new tool to manage.

## Adding approval gates

As teams grow, you want approval before new prompts go live. Simple workflow:

1. Contributor branches, writes a new prompt.
2. Commits to a \`prompts/\` folder (or updates an existing one).
3. Opens a PR with description: what the prompt does, what use cases it covers, sample input/output.
4. Code owner (often the cluster owner, e.g., support-team lead) reviews, tests if needed.
5. Approves and merges; CI updates the registry.

GitHub Actions can lint:

- Frontmatter present and valid
- No hardcoded secrets (use variables)
- Version bumped if text changed
- Cluster folder exists in REGISTRY.md

For teams using Claude Code or Cursor, add a \`.agents/skills/\` directory that documents how to load prompts from the registry into your workflow — so the agent can link to live versions.

## Scaling to 100+ prompts

Once you cross 50 prompts, flat files get unwieldy. Move to a lightweight app or a small registry service:

**Option 1: Spreadsheet (Google Sheets)** — add columns for cluster, owner, approval status, model tags, live version link. Sync to git weekly. Good for teams under 50 prompts who want zero setup.

**Option 2: Simple registry in code** — a TypeScript or Python index file that imports all prompts and exposes them as objects:

\`\`\`typescript
export const prompts = {
  supportTone: {
    text: "You are a support specialist...",
    models: ["claude-3.5-sonnet"],
    version: "2.1",
    cluster: "customer-service",
  },
  emailSubject: {
    text: "Generate email subject lines...",
    models: ["claude-opus"],
    version: "1.0",
    cluster: "marketing",
  },
}
\`\`\`

This is what Onie does. Import it in your CLI or web app, search it, version it with git. Beats spreadsheets for teams that ship code.

**Option 3: Dedicated prompt tool** — Prompt Wallet, TeamPrompt, or SpacePrompts handle search, versioning, one-click insertion into ChatGPT or Claude. These add UI overhead but save time for teams that do not write code. Pick one if your team uses Claude Web or ChatGPT more than the API.

## Governance patterns that work

**Ownership.** Assign each cluster to a team or person. Support team owns support prompts. Marketing owns marketing copy generators. When the owner changes, update the metadata. Prevents orphaned prompts.

**Versioning discipline.** When you change a prompt, it is a new version. Do not overwrite silently. Tag which version is live (e.g., "version": "2.1", "status": "live"). If version 2.1 breaks something, you can roll back to 2.0 without archaeology.

**Approval before deploy.** For customer-facing prompts (support, marketing), require review before new versions go live. For internal or experimental prompts (research, brainstorming), skip approval and mark them as draft.

**Archive old versions.** Do not delete versions; move them to an \`archive/\` folder or mark them as deprecated. Keeps history, makes rollbacks fast.

## Connecting Onie

If you are building a shared prompt library and want to share your governance patterns, publish your workflow as a public agent skill on [Onie](/app/explore). Document:

- Folder structure and frontmatter format
- Approval workflow (GitHub checks, code owners file)
- How your team searches and inserts prompts
- Sample prompts in each cluster
- Deployment strategy (which versions go to prod)

Other teams can fork your setup, adapt the folder names and cluster labels, and start immediately. This is why Onie collects practitioner workflows — shared prompt governance is too useful to invent solo.

## Common mistakes and fixes

**Storing prompts only in Slack or email.** They get lost in threads. Commit to git once. Slack is for discussion; the library is for truth.

**Treating every version as equally live.** Mark which version is in production explicitly. Avoid confusion: "Did we deploy the new one or the old tone guide?" Answer: check the metadata.

**Approving without testing.** For customer-facing prompts, test the new version against a few real examples before approval. If it produces inconsistent tone or different output structure, reject and ask for revision.

**Forgetting the cluster tags.** After 30 prompts, browse-by-folder is useless. Flat list is worse. Invest five minutes tagging each prompt so teammates can search "which prompts handle refunds?" and find them instantly.

**Letting prompts drift from their use case.** A prompt for "support tone" should not become a "general writing helper." Rename it, version it, move it to a new cluster, or split it into two. Keeps the library coherent.

## Measuring success

You are doing it right if:

- New team members can onboard a workflow in under an hour (find the prompt, understand the metadata, run it).
- You catch tone inconsistencies faster (because everyone uses the same prompt, discrepancies are fewer).
- You avoid repeating prompts (search before you write).
- Deployments are safer (approval workflows catch edge cases).

You might need to scale if:

- Prompts take longer to find than to rewrite (add search or tagging).
- Approval is a bottleneck (split into fast-track and review-track; mark low-risk prompts so approvers skip them).
- Teams request one-click insertion into their AI tool (move to Prompt Wallet or TeamPrompt).

## Next: Prompt versioning as observability

Once you have a shared library, the next frontier is tracking which prompts run in which contexts and how they perform. Log model, version, latency, user satisfaction (thumbs up/down). Use that telemetry to decide which prompts to iterate on.

This is how Onie approaches prompt observability: the library is the starting point. Tracking performance is the output.

Start with a shared git folder. Commit with discipline. Add approval gates when you hit 20 people. Scale to dedicated tooling when you hit 100+ prompts across 3+ teams. The framework stays the same — only the implementation grows.
`.trim(),
  faqs: [
    {
      question: 'What is a shared prompt library?',
      answer:
        'A shared prompt library is a centralized, version-controlled collection of AI prompts that your team uses repeatedly. It stores prompt text, metadata (owner, version, model), and approval status so everyone uses the same instructions and can see what changed over time.',
    },
    {
      question: 'What should I include in each prompt entry?',
      answer:
        'The prompt text itself, metadata (name, owner, version, approved date), cluster tags (use case), target models (Claude, GPT-4, etc.), and notes on when this version works best. Optional: sample inputs and outputs, links to related prompts.',
    },
    {
      question: 'Should we use git or a dedicated tool?',
      answer:
        'Start with git + markdown. It requires no new infrastructure and keeps prompts near code. Move to a tool like Prompt Wallet or TeamPrompt after 100+ prompts or if your team prefers UI-based search and one-click insertion into ChatGPT.',
    },
    {
      question: 'How do we handle approval workflows?',
      answer:
        'Use GitHub PRs with code owners. Assign cluster owners (support-lead, marketing-lead) as reviewers. Require approval before merging new prompts. This scales from 5 people to 500; any tool with role-based access control works.',
    },
    {
      question: 'What happens when a prompt needs to change?',
      answer:
        'Create a new version, bump the version number, and open a PR for review. Mark it "draft" or "under-review" until approved. Once approved, tag it as "live" and keep the old version in a changelog or archive for rollback.',
    },
    {
      question: 'How do we prevent prompts from getting orphaned?',
      answer:
        'Assign an owner to each prompt or cluster. When someone leaves, transfer ownership explicitly. Archive prompts that no longer have an owner or active use case instead of deleting them.',
    },
    {
      question: 'Can we use this for internal vs customer-facing prompts differently?',
      answer:
        'Yes. Customer-facing prompts (support, marketing) require approval before deploy. Internal and experimental prompts (research, drafts) can skip approval and be marked as draft. The same structure works for both.',
    },
    {
      question: 'How do we measure if the library is working?',
      answer:
        'Track time to onboard new workflows, consistency of output tone across teams, how often people reuse vs rewrite prompts, and how many bugs approval caught. If new members onboard workflows in under an hour and tone is consistent, it is working.',
    },
  ],
}
