import type { BlogPost } from '#/content/blog/types'

export const claudeCodeSkillsVsRulesPost: BlogPost = {
  slug: 'claude-code-skills-vs-rules',
  title: 'Claude Code skills vs rules: when to use each',
  description:
    'Understand how Claude Code rules always-load while skills load on-demand. Decision table, context cost, loading mechanics, and practical split patterns.',
  publishedAt: '2026-07-11',
  readingMinutes: 10,
  primaryKeyword: 'claude code skills vs rules',
  keywordCluster: [
    'claude code skills vs rules',
    'skills vs rules comparison',
    'when to use skills vs rules',
    'claude code skill structure',
    'claude code loading behavior',
  ],
  author: {
    name: 'Jeff Reese',
    role: 'Software engineer · Claude Code practitioner',
    bio: 'Builds workflows with Claude Code and publishes setups on Onie. Focuses on practical agent configuration that scales without bloat.',
  },
  tldr:
    'Claude Code rules are always-on (or glob-scoped) policy loaded at session start. Skills are on-demand playbooks that load only when the description matches the current task. Use rules for what must apply every time; use skills for multi-step workflows. The difference matters because context is paid for on every turn.',
  relatedSlugs: [
    'how-to-write-claude-code-skills',
    'cursor-rules-vs-skills',
    'claude-code-workflow-examples',
    'claude-code-hooks-tutorial',
  ],
  body: `
## The short answer

**Claude Code rules** (\`CLAUDE.md\` and files under \`.claude/rules/\`) load automatically into context at every session start — full content, costing tokens on every turn. They apply to every action, including tasks that have nothing to do with their topic.

**Claude Code skills** (folders under \`.claude/skills/\`) load on demand: at session start, only the name and description sit in context (a few tokens). The full body loads only when you invoke the skill — either by typing a slash command (\`/deploy\`) or when Claude detects the description matches what you are doing.

The decision rule is simple: **what must always apply becomes a rule; what runs on command becomes a skill.**

## Why the difference matters

Every token in context competes for the model's attention. A rule that loads into every session — even sessions that have nothing to do with it — costs you:

1. **Context window space** — fewer tokens left for the actual task
2. **Model attention** — a fuller context means weaker adherence to each instruction
3. **Relevance** — instructions about database migrations distract when you are writing frontend code

Skills solve this by paying the token cost only when relevant. The trade-off: the agent can only use a skill if it has loaded.

## How rules load

Rules can operate in three modes:

| Mode | When loaded | Typical use |
| --- | --- | --- |
| Always apply | Every session start | Non-negotiable standards (security, formatting, stack) |
| Path-scoped (globs) | Only when touching matching files | Language- or folder-specific conventions |
| Snapshot at session start | Full content cached, not re-read | Facts that change mid-session may be stale |

The key mechanics: rules are a **snapshot from session start**. If you edit a rule file during a session, the running session still uses the old version. Start a new session to pick up the change — this is by design, not a bug.

### Path scoping with globs

A rule with \`paths: ["db/**"]\` in its frontmatter loads only when Claude touches a file matching that pattern — anything under the \`db/\` directory, however deep. This is the middle ground: you get the enforcement without the session-wide context cost.

Common patterns:

- \`paths: ["src/api/**"]\` — API-specific rules
- \`paths: ["*.sql"]\` — All SQL files
- \`paths: ["{lib,utils}/**"]\` — Multiple directories

## How skills load

A skill is a folder under \`.claude/skills/\` containing a \`SKILL.md\` file:

\`\`\`
my-skill/
  SKILL.md          # Frontmatter + instructions
  references/       # Linked docs (load on demand)
  scripts/          # Executables (optional)
\`\`\`

The \`SKILL.md\` file has YAML frontmatter and a markdown body:

\`\`\`yaml
---
name: deploy
description: >
  Rolls out an environment to staging or production.
  Use when the user says "deploy", "release", or "promote".
---

# Deploy workflow

## Steps
1. Run tests...
\`\`\`

At session start, only the \`name\` and \`description\` sit in context — negligible token cost. The agent reads the description to decide relevance. If the description matches what you are doing, the full body loads into context. If not, the skill stays on disk.

### The description is the trigger

The description is not just documentation — it is how Claude decides whether to load the skill. A sharp description gets matched reliably; a vague one does not.

**Weak descriptions:**
- "Helps with deployment"
- "General code review"
- "Works with databases"

**Strong descriptions:**
- "Rolls out an environment to staging or production. Use when the user says deploy, release, or promote."
- "Reviews pull requests for security, regressions, and API breaks. Use when the user asks to review a diff or says check this PR."
- "Runs database schema migrations. Use when the user wants to apply pending migrations or test rollbacks."

Test your description: ask Claude a realistic request without naming the skill. If it loads, the description is sharp enough. If not, tighten it with literal trigger phrases.

## Decision table: rules vs skills

| Question | Choose **rules** | Choose **skills** |
| --- | --- | --- |
| Must this apply on every action? | Yes | No |
| Is it under ~30 lines of policy? | Usually yes | Often no |
| Is it a multi-step procedure with steps and examples? | No | Yes |
| Does it include scripts or templates? | Rarely | Common |
| Should unrelated tasks ignore it? | No | Yes |
| Will you share it across teams or repos? | Sometimes | Often (portable SKILL.md) |

**Examples that belong in rules:**

- "Always use strict mode in TypeScript; no \`any\` in \`src/\`."
- "Never commit secrets; use \`.env.local\` for local overrides."
- "React components: props interface named \`ComponentProps\`."
- "Validate all user input with Zod before database operations."

**Examples that belong in skills:**

- "Ingest user interviews → affinity map → synthesis report" (multi-step UX research workflow)
- "Cut a release: bump version, update CHANGELOG, create git tag, deploy staging, smoke test" (deploy checklist)
- "Migrate class components to hooks using this checklist" (refactor procedure)
- "File a bug: reproduce locally → capture logs → open issue with template" (bug-reporting workflow)

## A practical split for a team repo

Here is a pattern that scales:

\`\`\`
.claude/
  CLAUDE.md                # Project frame: what it is, where things live
  rules/
    typescript.md          # Stack policy: strict mode, naming conventions
    security.md            # Never commit secrets; validate input; rate limits
    api-standards.md       # API responses always include error codes
  skills/
    release/
      SKILL.md             # Versioning, tagging, deploy flow
    ux-synthesis/
      SKILL.md             # Research workflow: ingest → cluster → report
      references/
        affinity-template.md
    code-review/
      SKILL.md             # PR review checklist
\`\`\`

**Rules** stay small and high-signal (~1–3k tokens combined is typical). **Skills** hold the long checklists and reference materials.

Document the split in your README or a separate agent workflow doc so new contributors know where to add policy (rules) vs procedure (skills).

## Loading cost at a glance

| Artifact | Load time | Token cost | Why |
| --- | --- | --- | --- |
| \`CLAUDE.md\` | Session start | High — every session | Always in context |
| Rule without globs | Session start | High — every session | Always in context |
| Rule with \`paths: ["db/**"]\` | When matching file touched | Low — only on match | Conditional trigger |
| Skill (default) | Session start + invocation | Low — few tokens until invoked | Only name + description at start |
| Skill, invoked | On \`/name\` or auto-match | Medium — full body loads | Body subject to shared budget |

The insight: if a 50-line rule is only relevant 10% of the time, move the procedural part to a skill and leave a one-liner rule that points to it.

## When to split a big rule

If a rule file has both a "when to apply" section (3–5 lines) and a "how to do it" section (30+ lines of procedural steps), it is doing two things: recognition and procedure. Split it:

1. **Keep in rule:** The trigger. "API handlers must validate input before querying the database."
2. **Move to skill:** The procedure. "Run the Zod validation workflow: schema → parse → coerce → error handling" with full examples.

Same behavior, half the context cost.

## Skill descriptions in practice

Compare these:

| Weak | Strong |
| --- | --- |
| "Help with security" | "Audits code for security issues: injection vectors, exposed secrets, unvalidated input. Use when the user asks to review for security, check for vulnerabilities, or audit a change." |
| "Database tool" | "Generates database migrations from a diff or schema change. Use when the user provides a before/after schema or asks to migrate the database." |

The strong version:
- States what it does in one sentence
- Lists what it checks for (concrete, not vague)
- Adds trigger phrases: "Use when the user…"

## Common mistakes

**Putting a 40-line checklist in a rule.** Checklists are procedures — move them to a skill and reference it from a one-liner rule.

**Vague skill descriptions.** "Helps with testing" will not load reliably. Use "Runs unit and integration tests. Use when the user says run tests, check coverage, or CI failed."

**Duplicating text in rules and skills.** Pick one source of truth. If a rule mentions a convention, do not repeat it in the skill — reference the rule instead.

**Mega-rules that never change.** If you wrote 100 lines once and have not touched it in months, it might belong in a skill with the trigger split into a tiny rule.

**Ignoring context cost.** The instinct is to put everything in rules "so it always applies." That is the tax you do not see. Keep rules lean; let skills handle the long procedures.

## The loading mechanics matter

A rule's snapshot behavior means:

- **Fact files change mid-session:** If a rule imports or loads a file with deployment targets, endpoints, or credentials, re-read it at execution time instead of relying on the context copy from session start.
- **Skills re-read too:** Skills can include "Read \`.claude/rules/stack.md\`" to get fresh facts, even though rules loaded at the beginning of the session.

This is why documentation often includes "read this file" instructions — not because the file does not load at all, but because a session-old copy might be stale.

## When to use neither

Skip both for:

- One-off experiments you will throw away
- Personal preferences that change weekly
- Early brainstorming where output shape is undefined

These do not need to be in configuration. Use a prompt, run it once, and move on.

Promote to a **skill** when you have run the same workflow three times and can describe "done" — procedures belong in skills.

Promote to a **rule** when the whole team must follow a constraint on every change — policy belongs in rules.

## Onie: publish what your team agreed on

The setups that survive contact with real work are worth sharing. After you settle rules-vs-skills boundaries and the split works, publish the \`.claude/\` folder structure on [Onie](/app/explore) so others can fork your layout — not just the theory.
`.trim(),
  faqs: [
    {
      question: 'What is the main difference between Claude Code rules and skills?',
      answer:
        'Rules load automatically at session start and stay in context for every action. Skills load only when invoked — either by slash command or when Claude detects the description matches the current task. Use rules for always-on policy; use skills for on-demand procedures.',
    },
    {
      question: 'When should I use rules instead of skills?',
      answer:
        'Use rules when the instruction must apply even if the task seems unrelated — coding style, security constraints, framework conventions, naming standards. Use skills when the content is long, procedural, and only relevant for specific tasks.',
    },
    {
      question: 'Do skills cost tokens even if I never use them?',
      answer:
        'Very little. At session start, only the name and description sit in context — a few tokens per skill. The full body stays on disk until invoked. Skills are much cheaper than rules unless you explicitly need the always-on behavior.',
    },
    {
      question: 'How do I know if my skill description is good enough?',
      answer:
        'Test it: ask Claude a realistic request without naming the skill. If it loads automatically, the description is sharp enough. If not, add more specific trigger phrases like "Use when the user says X, Y, or Z" with domain keywords someone would actually type.',
    },
    {
      question: 'What is path scoping in rules?',
      answer:
        'Path scoping lets you narrow when a rule loads. A rule with paths: ["db/**"] only loads when Claude touches a file under the db/ directory. This is the middle ground between always-loading and on-demand, useful for language- or folder-specific conventions.',
    },
    {
      question: 'Can I have both rules and skills for the same topic?',
      answer:
        'Yes. A common pattern: keep a short rule (3–5 lines) that states the policy and points to the skill, then put the detailed procedure in the skill. The rule handles recognition; the skill handles steps.',
    },
    {
      question: 'What does "snapshot at session start" mean for rules?',
      answer:
        'Rules are read once at the beginning of the session. If you edit a rule file during a session, the running session keeps the old version. Start a new session to pick up changes. This applies to rule files, not to skills.',
    },
    {
      question: 'How big should a rule file be?',
      answer:
        'Keep rules under ~30 lines of policy. If a rule file grows beyond that with procedural steps, split it: leave the trigger in the rule and move the steps to a skill. This keeps context lean while preserving the recognition behavior.',
    },
  ],
}
