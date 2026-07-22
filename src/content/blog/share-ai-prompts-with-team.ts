import type { BlogPost } from '#/content/blog/types'

export const shareAiPromptsWithTeamPost: BlogPost = {
  slug: 'share-ai-prompts-with-team',
  title: 'How to share AI prompts with your team',
  description:
    'Three methods to share prompts: git-tracked files, native platform features like Claude Console sharing, or dedicated prompt management apps. Governance patterns that scale.',
  publishedAt: '2026-07-22',
  readingMinutes: 10,
  primaryKeyword: 'share ai prompts with team',
  keywordCluster: [
    'share ai prompts with team',
    'share prompts claude',
    'team prompt management',
    'prompt sharing workflow',
    'shared prompt library',
    'how to organize team prompts',
  ],
  author: {
    name: 'Jordan Walsh',
    role: 'Product engineer · Workflow infrastructure',
    bio: 'Builds systems for teams to share AI workflows at scale. Helps engineering teams version prompts like code and deploy them safely.',
  },
  tldr:
    'Share prompts using git (version control, team review), native platform features (Claude Console sharing, Workspace access), or lightweight prompt apps (Prompt Wallet, TeamPrompt). Start with git for small teams; add governance layers (ownership, approval, versioning) as you scale. The best method depends on team size, tool choice, and how prompts flow into your workflow.',
  relatedSlugs: [
    'shared-prompt-library-for-teams',
    'share-claude-code-skills-with-team',
    'document-ai-agent-workflows',
  ],
  body: `
## The prompt scatter problem

Every developer has rediscovered the same prompt independently. Your backend lead wrote a prompt for code review that catches off-by-one errors. Your frontend lead wrote a nearly identical one. Neither team knows the other exists.

In three months, you have 47 prompts scattered across chat histories, email drafts, and personal markdown files. When someone leaves, their prompts leave with them. When a customer complaint arrives, you cannot find the support tone guide anyone used last month.

Sharing AI prompts is not optional at scale. It is infrastructure.

## Three methods to share prompts

### Method 1: Git (version control)

The simplest approach is to treat prompts like code.

Create a directory at the root of your repo:

\`\`\`
team-prompts/
  prompts/
    code-review/
      performance.md
      security.md
    support/
      customer-tone.md
      escalation-rules.md
    data/
      sql-optimization.md
      schema-review.md
  REGISTRY.md
  .github/workflows/validate-prompts.yml
\`\`\`

Each file is a prompt with frontmatter:

\`\`\`markdown
---
name: Code Review - Performance
owner: backend-team
version: 2.1
live: true
models: claude-3.5-sonnet, claude-opus
last-updated: 2026-07-20
tags: performance, code-review, foundational
---

You are a performance-focused code reviewer...
\`\`\`

Commit to main. Every developer who clones the repo has all prompts. When you improve a prompt, bump the version, open a PR, get approval from the owner, merge, and tag the commit. Rollback is one command away.

Benefits:
- **No new tools** — use GitHub workflow you already have
- **Explicit ownership** — CODEOWNERS file assigns approval to team leads
- **Versioning built-in** — track what changed, compare iterations
- **Integrates with CI/CD** — lint prompts (check frontmatter, validate syntax) on every PR

This works for teams up to 100 people. For larger organizations or teams that do not use git, use a different method.

### Method 2: Native platform features

If your team uses Claude through the Workspace or Claude Console, you can share prompts natively without leaving the platform.

**In Claude Console (web interface):**

1. Create a prompt in the Workbench
2. Click the prompt title and select "Share"
3. Change access from "Private" to "Shared"
4. Copy the link or share with workspace members

Anyone with the link can view and edit the prompt. Edits are tracked in version history with attribution. This works well for small teams or cross-functional collaboration where people are already in Claude.

The advantage: no tool overhead. The disadvantage: prompts live in the Claude app, not in your version control, so they are harder to audit, backup, or integrate into CI/CD pipelines.

**In Claude Desktop or API integrations:**

If you use Cursor or Claude Code for development, prompts live in your project workspace. Share access to the workspace, and teammates inherit prompts automatically. This is closest to git-based sharing (version control, team access) but works inside the Claude ecosystem.

### Method 3: Dedicated prompt management platforms

If your team prefers a UI and centralized search, use a lightweight platform like Prompt Wallet, TeamPrompt, or SpacePrompts.

These tools offer:
- **Searchable library** — find prompts by tag, keyword, use case (no digging through folders)
- **One-click insertion** — copy or inject prompts directly into ChatGPT, Claude, Gemini
- **Role-based access** — owner, editor, viewer roles; granular permissions
- **Version history** — compare old and new, rollback instantly
- **Shared and private workspaces** — personal vault + team library

Setup takes 10 minutes. You paste a prompt, AI suggests tags and a title, and you save. Export teams can be added with a secure link. Most free plans cover up to 50 prompts and 5 team members.

Benefits:
- **Low friction** — non-engineers on the team can browse and use prompts
- **Fast search** — find the right prompt in 2 seconds, not 2 minutes
- **No code required** — works for product, marketing, support teams who do not use git

Trade-off: prompts live in a third-party app, not your infrastructure. You depend on the vendor for uptime, export options, and data retention.

## Which method for your team?

**Use git if:**
- Your team already writes code or uses version control
- You want auditable, versioned changes
- You plan to integrate prompts into CI/CD or automation
- You need ownership and approval workflows built on GitHub

Start here: create a \`team-prompts/\` folder, write a REGISTRY.md documenting the structure, and add a GitHub Actions lint workflow. This is the Onie approach.

**Use Claude Console sharing if:**
- Your team uses Claude Web frequently but not code
- You want zero setup overhead
- Prompts are exploratory or personal-to-team, not production workflows

Setup: share from Workbench, send the link, collaborate directly. Works for 5–10 people.

**Use a dedicated platform if:**
- Your team has non-technical members who need prompt access
- You want fast, UI-based search without learning folder structure
- You plan to use prompts across multiple AI tools (ChatGPT, Claude, Gemini)

Pick one tool, add your team, spend 15 minutes tagging a few prompts, and you are live.

## Governance patterns that stick

Regardless of method, use these patterns to prevent chaos:

**Ownership and approval.** Assign each cluster of prompts to an owner (support-lead, ml-lead). Before a new prompt goes live or an existing one changes, the owner approves. This scales from 5 to 500 people.

**Semantic versioning.** When you change a prompt, increment the version number (2.0 → 2.1 for small tweaks, 2.0 → 3.0 for rewrites). Mark which version is "live" or "production." This prevents accidental rollouts.

**Metadata that tells a story.** Include the owner, use case, which model it targets, performance notes ("works best on Claude 3.5 for summaries over 10k tokens"), and approval status. Future you will thank past you.

**Archive, never delete.** When a prompt is no longer used, move it to an archive folder or mark as deprecated. Keep history. Rollback or revival is one move away.

## Measuring success

You are doing it right if:

- New team members find the prompt they need without asking
- You catch inconsistencies fast (because everyone uses the same prompt, tone and output drift disappears)
- Nobody rewrites a prompt that already works
- Deployments are safer (approval catches edge cases)

You might need a different method if:

- Prompts are harder to find than to rewrite (upgrade to a tool with better search)
- Approval is a bottleneck (split low-risk and high-risk; fast-track routine changes)
- Your team is scattered across multiple AI tools (move to a platform-agnostic manager)

## Start now

The cost of not sharing is already baked in: wasted time, lost knowledge, inconsistent output, duplicated work. Start by creating one shared folder or workspace, committing three prompts, and inviting your team to use them for one week.

Document what works. Iterate. Scale the method that fits.

Most teams find that git + a simple REGISTRY.md is enough to start. As you grow, add approval workflows, or migrate to a dedicated platform. The framework stays the same.

The prompts your team discovers are too valuable to lose. Make them findable, versionable, and shareable. Start today.
`.trim(),
  faqs: [
    {
      question: 'What is the difference between sharing and storing prompts?',
      answer:
        'Storing is putting a prompt in a file. Sharing is making it discoverable, versionable, and editable by teammates. Storage is a prerequisite; sharing adds governance. A prompt in a random doc is stored but not shared.',
    },
    {
      question: 'Should we use git or a prompt app for sharing?',
      answer:
        'Start with git if your team uses code and CI/CD. It gives you versioning, approval workflows, and no new infrastructure. Move to a prompt app (Prompt Wallet, TeamPrompt) if your team includes non-engineers or if speed of search matters more than audit trails.',
    },
    {
      question: 'How do we prevent prompts from getting lost when someone leaves?',
      answer:
        'Store them in version control or a centralized platform, not in individual chat histories or personal docs. Assign clear ownership in metadata. When someone leaves, transfer ownership to another team member or mark the prompt as community-owned.',
    },
    {
      question: 'How many versions of a prompt should we keep?',
      answer:
        'Keep all versions in history (git commits, platform version history), but mark only one as "live" or "production." Old versions stay accessible for rollback or reference. Delete only when a prompt is truly deprecated.',
    },
    {
      question: 'Can we share prompts across teams?',
      answer:
        'Yes. Create a shared folder or workspace that multiple teams access. Use tagging or clustering (support, marketing, engineering) so teams find relevant prompts without sifting through unrelated ones. Add role-based access if some prompts should be team-private.',
    },
    {
      question: 'What governance do we need before sharing prompts at scale?',
      answer:
        'Ownership (who maintains each prompt), approval gates (customer-facing prompts require review), versioning discipline (increment versions, never overwrite), and metadata (owner, use case, live version). Start simple and add layers as team size grows.',
    },
    {
      question: 'How do we measure if prompt sharing is working?',
      answer:
        'Track whether new team members can find and use a prompt without asking for help, whether tone and output become more consistent, whether people reuse prompts instead of rewriting them, and whether approval catches bugs before production.',
    },
    {
      question: 'Can we use prompts from a shared library in Claude Code or Cursor?',
      answer:
        'Yes. If you store prompts in git, import them as a module or load them into a skill. Claude Code skills can reference a git-backed prompt library. This ties sharing to your automation and deployment workflows.',
    },
  ],
}
