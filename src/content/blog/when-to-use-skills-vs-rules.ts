import type { BlogPost } from '#/content/blog/types'

export const whenToUseSkillsVsRulesPost: BlogPost = {
  slug: 'when-to-use-skills-vs-rules',
  title: 'When to use skills vs rules: a decision framework',
  description:
    'Learn when to use agent skills vs rules in Claude Code and Cursor. Decision table, context cost analysis, failure modes, and practical patterns for your team setup.',
  publishedAt: '2026-07-26',
  readingMinutes: 9,
  primaryKeyword: 'when to use skills vs rules',
  keywordCluster: [
    'when to use skills vs rules',
    'skills vs rules comparison',
    'agent skills vs rules',
    'claude code rules vs skills',
    'when to use agent skills',
  ],
  author: {
    name: 'Alex Rodriguez',
    role: 'Agent engineer · Claude Code contributor',
    bio: 'Builds and scales AI coding workflows. Tests configuration patterns across teams and publishes learnings on Onie.',
  },
  tldr:
    'Rules are always-on policy that apply to every task. Skills are on-demand procedures you invoke when relevant. Use rules for what must apply even on ad-hoc requests (conventions, security, standards); use skills for multi-step workflows that waste context if loaded always. The choice matters because context is limited—every token in rules competes with your code.',
  relatedSlugs: [
    'cursor-agent-skills-migrate',
    'cursor-rules-vs-skills',
    'claude-code-skills-vs-rules',
    'how-to-write-claude-code-skills',
    'agent-skills-best-practices',
  ],
  body: `
## What rules and skills actually do

The core distinction is simple but has deep consequences.

**Rules** (`CLAUDE.md` and files under `.cursor/rules/` or `.claude/rules/`) load into context at the start of every session, before the first prompt. They apply to every action the agent takes, including ad-hoc requests that never trigger a skill.

**Skills** (SKILL.md in a folder under `.cursor/skills/` or `.claude/skills/`) sit dormant at session start. Only their name and description—a few tokens—live in context. When you invoke them explicitly (slash command, \`@mention\`) or when the agent decides the description matches the current task, the full body loads and applies only to that task.

The consequence is immediate: rules cost context on every session; skills cost context only when relevant. This matters because context is a limited resource. A 50-line rule loaded into every conversation competes with your actual code for the model's attention.

## Load behavior and context cost

Think about a project where you have both a security policy (must never apply less) and a deployment checklist (only matters during deployments).

If both live in rules:

- Security loads every session. ✓ Correct, it must always apply.
- Deployment loads every session. ✗ Wrong, it's dead weight 95% of the time.

If security is a rule and deployment is a skill:

- Security loads every session. ✓
- Deployment loads only when you deploy. ✓
- Context stays lean, attention stays focused.

Most projects we see on Onie make the mistake of putting everything in rules for safety. That feels right until you audit how much unused procedural detail sits in context every session. One team found 140 lines of checklist-style instructions loaded into conversations that had nothing to do with deployment. That was 300+ tokens of wasted space on every chat.

## The failure modes tell you which to use

A useful way to think about it: what goes wrong when you use the wrong tool?

**Choose rules if:** You miss the *moment* to recognize that something should happen. The agent needs to see a trigger before it acts—a pattern in the code, a task description, a file change. If the rule is not in context when that moment arrives, the moment passes silently and nothing happens.

Examples: security constraints ("never ship credentials"), naming conventions ("all React components get a Props interface"), stack policy ("always use the project's date library, not native Date").

**Choose skills if:** You miss a *step* in executing a procedure. The agent recognized that a workflow should happen but needs the procedural details—checkpoints, branching logic, what to do if something fails. That's where skills excel.

Examples: "Deploy to production—check that all tests pass, wait for approval, rollback if needed." "Write a PR description—include issue number, summary, breaking changes."

Failure mode in rules: "I did not see that the code path was unsafe, so I left it as is."  
Failure mode in skills: "I recognized that we were cutting a release, but I forgot the final verification step."

Two different problems need two tools.

## Decision table

Use this when you are deciding where to put new configuration:

| Question | Choose **rules** | Choose **skills** |
|----------|------------------|------------------|
| Must this apply even on ad-hoc requests? | Yes | No |
| Is it a pattern the agent must always recognize? | Yes | No |
| Will it usually be under 30 lines? | Yes | Probably not |
| Is it a multi-step procedure with checkpoints? | No | Yes |
| Does it include scripts, templates, or references? | Rarely | Common |
| Should unrelated tasks be able to ignore it? | No | Yes |

**Belongs in rules:**

- "Use TypeScript strict mode; reject \`any\` in \`src/\`."
- "No secrets committed; environment variables in \`.env.local\` only."
- "React: use named \`FooProps\` interfaces, never inline."
- "Unit test coverage minimum: 80%."

**Belongs in skills:**

- "Deploy to staging: run tests, build Docker image, push to registry, deploy to cluster, run smoke tests."
- "Cut a release: update version, generate changelog, tag, create GitHub release, notify team."
- "Document a feature: write a 1-page design doc, link to the issue, share for async review."

## The split pattern

The most common setup mistake is bundling both recognition and procedure into one file. It looks like:

\`\`\`
When to apply:
  - User is writing a database migration
  - Context mentions \`schema\` or \`ALTER TABLE\`

How to do it:
  [30 lines of migration steps, edge cases, rollback instructions]
\`\`\`

The 3-line trigger needs to always be in context. But the 30-line procedure only matters during migrations. If both live in a rule, you are paying for all 33 lines on every session.

The fix is a split:

**Rule** (always loaded, 3 lines):
\`\`\`
When the task involves database schema changes, see the \`/database-migration\` skill for the checklist.
\`\`\`

**Skill** (loads on demand):
\`\`\`
---
name: database-migration
description: Step-by-step guide for schema changes, rollback recovery, and testing.
---

[30 lines of procedure]
\`\`\`

Now recognition (the 3-line trigger) is always available. The procedure loads only when relevant. Same behavior, dramatically less overhead.

## Practical patterns for teams

Here is what a well-balanced team setup looks like (from projects published on Onie):

\`\`\`
.cursor/rules/
  typescript-standards.mdc      # Always apply: types, lint, formatting
  no-secrets.mdc                # Always apply: security floor
  testing.mdc                   # Always apply: test conventions

.agents/skills/
  code-review/SKILL.md          # On-demand: PR review checklist
  deployment/SKILL.md           # On-demand: staging & prod steps
  documentation/SKILL.md        # On-demand: design doc template
  database/SKILL.md             # On-demand: migration procedures
\`\`\`

Rules stay small (100–150 lines total across all files is typical for a mid-size team). Skills hold the long checklists, templates, and linked references.

**The living-document loop:** When something about a result is off, update the rule so the same mistake does not happen twice. A team's rules grow through practice, not planning. Start lean.

## Why this is more than optimization

Context cost feels like micro-optimization until you watch it in action. We have seen:

- A team whose agent stopped following naming conventions consistently because a 100-line deployment checklist had crowded the rules context.
- Another that improved test coverage detection after splitting a 60-line "how to test" skill out of their rules—the recognition rule stayed (3 lines), the procedure loaded only when writing tests.
- A third that reduced their "agent seems confused" support tickets by 40% just by cutting bloated rules in half and moving the procedures to skills.

The model is not smarter when context is fuller. It is smarter when the context it has is exactly what it needs for the current task.

## Sharing across teams and tools

One more reason to respect the distinction: portability.

Skills in the \`SKILL.md\` format work in Cursor, Claude Code (the standalone agent in claude.com), and other tools that read the open Agent Skills standard. Rules in \`.mdc\` are Cursor-specific.

If your team uses mixed tools or you publish workflows on platforms like Onie, write procedures as \`SKILL.md\` (portable) and keep rules for Cursor-only policy.

## Getting started

1. Audit your current configuration. How many lines are in rules? How often does each rule actually apply?
2. Apply the failure-mode test: Is this something the agent must *recognize* or something it must *know how to do*? Recognition → rule. Procedure → skill.
3. Split at the recognition/procedure boundary. Expect to cut rule size by 30–50%.
4. Document the split in your README or [workflow doc](/blog/document-ai-agent-workflows) so new team members know where to add policy vs procedure.

The work pays for itself the first time context waste stops slowing down your agent's reasoning.
`.trim(),
  faqs: [
    {
      question: 'Does a skill cost anything if I never use it?',
      answer:
        'Only a few tokens for the name and description at session start. The full body stays on disk until invoked. You can reduce even that overhead with `disable-model-invocation: true` in the frontmatter if you want the skill to be invisible unless you explicitly invoke it with a slash command.',
    },
    {
      question: 'Can I have both rules and skills about the same thing?',
      answer:
        'Yes, and it is the best pattern. The rule handles recognition (what to watch for), the skill handles procedure (what to do). Example: a rule that says "when deployment is mentioned, use the /deploy skill" is lean and always loaded; the skill holds the full checklist and loads only when relevant.',
    },
    {
      question: 'When should I edit the rule after it changes?',
      answer:
        'Changes take effect in the next session. The context is a snapshot from session start, so the running session keeps the old version until you start a new one. This is why real teams use a living-document loop: "fix the issue and update the rule so this does not happen twice."',
    },
    {
      question: 'What if my rule is more than 30 lines?',
      answer:
        'That is a sign that procedure has crept in. Apply the split pattern: keep the recognition part as a short rule (3–5 lines), move the how-to-do-it part to a skill. The rule can reference the skill for details.',
    },
    {
      question: 'Are rules Cursor-specific?',
      answer:
        'Yes. The `.mdc` format is Cursor-native. Skills in the `SKILL.md` format are an open standard and work across Cursor, Claude Code, and other tools. If portability matters, write procedures as skills and keep rules for Cursor-only policy.',
    },
    {
      question: 'How do I know if my skills are being invoked automatically?',
      answer:
        'Write a sharp description that matches the task. "Deploy to production" works better than "helps with deployments." If a skill never loads when you expect it to, the description is too vague or the task context does not match. Test by writing the exact phrase a user would type, then refine.',
    },
    {
      question: 'Can I disable a skill without deleting it?',
      answer:
        'Yes. Set `disable-model-invocation: true` in the frontmatter. The skill will only load if you invoke it explicitly (slash command or @mention), never automatically. This is useful for archive or deprecated skills you want to keep around.',
    },
    {
      question: 'What is the relationship between rules, skills, and commands?',
      answer:
        'Rules apply to everything. Skills apply when invoked or matched. Commands are explicit invocations you trigger on purpose. Hooks are deterministic automation the model cannot skip (format, tests, security checks). Use the right tool for the job: rules for policy, skills for procedures, hooks for guarantees.',
    },
  ],
}
