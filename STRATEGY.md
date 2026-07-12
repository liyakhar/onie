---
name: Onie
last_updated: 2026-06-17
---

# Onie Strategy

## Target problem

Practitioners are building agent workflows that actually work — prompts, skills, file layouts, tool chains — but those setups rarely leave private repos, DMs, or one-off blog posts. When someone in UX, science, or SaaS wants a workflow for their discipline, they get generic prompt dumps with no context on who runs it, which tools it needs, or whether it survives real work.

## Our approach

Win as a **public practitioner feed**, not a package registry: workflows published with full context (field, tools, author, markdown body) and discovered through people you follow and Explore — so trust comes from who shared it, not install counts alone.

## Who it's for

**Primary:** Practitioners already running agents in their day job — UX researchers, PMs, scientists, engineers — who want to find and copy workflows from peers in their field, not from anonymous prompt libraries.

## Key metrics

- **Weekly active publishers** — distinct users who publish or meaningfully update a workflow per week; measured in Postgres (`Post` + `User`)
- **Workflow saves / forks** — signal that a post was useful enough to adopt; measured via fork count and future save/bookmark events
- **7-day return rate** — signed-in users who return within 7 days; measured via session/auth analytics
- **Follow graph density** — median follows per active user; measured in `Follow` table
- **Explore-to-profile CTR** — search/browse sessions that land on a practitioner profile or post; measured via analytics on `/app/explore`

## Tracks

### Supply — get real workflows published

Seed and recruit practitioners who post the setups they actually run, tagged by field and tool.

_Why it serves the approach:_ Without practitioner-authored context, Onie is just another prompt dump.

### Discovery — make field + tool search work

Explore, categories, trending, and search that surfaces the right workflow for a discipline and stack.

_Why it serves the approach:_ The feed only wins if people can find workflows for *their* practice, not scroll a generic list.

### Social graph — follow peers, not packages

Following feed, profiles with pinned workflows, and lightweight engagement (likes, comments).

_Why it serves the approach:_ Trust comes from people; the social layer is the moat registries lack.

### Distribution — meet practitioners where they already share

X outreach, SEO for workflow topics, and one-click sharing from posts.

_Why it serves the approach:_ Workflows are discovered in conversation today; Onie needs to intercept that flow without feeling like self-promotion spam.

## Not working on

- Competing with skills.sh on install counts or CLI package management
- Enterprise team workspaces and MCP registries (Sharebench's lane)
- Building a generic AI prompt editor or agent runtime
- Monetization before repeatable weekly publishing exists

## Marketing

**One-liner:** Agent workflows from people doing the work.

**Key message:** Onie is where practitioners publish the prompts, skills, and setups they run — tagged by field and tool, browsable in Explore, and collected in a feed from people you follow. Not playbooks from nowhere. Workflows from them.
