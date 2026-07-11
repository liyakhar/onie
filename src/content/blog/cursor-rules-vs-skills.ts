import type { BlogPost } from '#/content/blog/types'

export const cursorRulesVsSkillsPost: BlogPost = {
  slug: 'cursor-rules-vs-skills',
  title: 'Cursor rules vs skills: when to use each (with examples)',
  description:
    'Cursor rules vs skills explained with a decision table, loading behavior, migration tips, and when to keep .mdc rules instead of SKILL.md playbooks.',
  publishedAt: '2026-06-16',
  readingMinutes: 11,
  primaryKeyword: 'cursor rules vs skills',
  keywordCluster: [
    'cursor rules vs skills',
    'when to use skills vs rules',
    'cursor agent skills',
    'migrate rules to skills',
    'cursor .mdc vs SKILL.md',
  ],
  author: {
    name: 'Maya Chen',
    role: 'UX researcher · Claude Code practitioner',
    bio: 'Runs research synthesis and design QA loops with Claude Code. Publishes the setups she ships on Onie.',
  },
  tldr:
    'Cursor rules are always-on (or glob-scoped) policy in .mdc files — coding standards, safety rails, and repo conventions. Skills are on-demand playbooks in SKILL.md that load only when the task matches the description. Use rules for what must apply every time; use skills for multi-step workflows you run occasionally. They complement each other; neither replaces the other.',
  relatedSlugs: [
    'claude-code-skills-vs-rules',
    'how-to-write-claude-code-skills',
    'claude-code-workflow-examples',
    'document-ai-agent-workflows',
  ],
  body: `
## The short answer

**Cursor rules** tell the agent who to be in this workspace: style, stack, boundaries. They load at the start of a thread (or when file globs match) and stay in context.

**Cursor skills** tell the agent how to run a specific workflow when that workflow is relevant: deploy checklists, migration runbooks, research synthesis templates. They load on demand when the description matches what you are doing.

If you need something enforced even when the task looks unrelated — keep a rule. If you need a long, procedural playbook that would waste context on every chat — use a skill.

This matches how [Cursor documents the split](https://cursor.com/docs): rules are declarative guardrails; skills are dynamic, procedural packages aligned with the [Agent Skills open format](https://agentskills.io).

## How rules and skills actually load

Understanding load behavior is the whole comparison. Everything else follows from it.

### Rules (.mdc in \`.cursor/rules/\`)

Rules can be configured roughly as:

| Mode | When it loads | Typical use |
| --- | --- | --- |
| Always apply | Every agent turn | Non-negotiable standards (security, formatting) |
| Apply to globs | When matching files are in context | Language- or folder-specific conventions |
| Apply intelligently | Agent decides from rule description | Softer guidance that should not run on unrelated tasks |

Testing reported on [DEV](https://dev.to/nedcodes/cursor-rules-vs-agent-skills-i-tested-both-heres-when-each-one-actually-works-1ld) shows **alwaysApply: true** rules inject even when the task has nothing to do with them. That is by design — predictable enforcement costs context.

### Skills (SKILL.md in \`.cursor/skills/\` or \`.agents/skills/\`)

Skills ship as folders with YAML frontmatter (\`name\`, \`description\`) plus markdown instructions, optional \`scripts/\`, and \`references/\`.

The agent reads the **description** to decide relevance. If your task does not match, the skill stays unloaded — which keeps the context window free for code.

Skills can also be invoked explicitly (\`@\` mention or slash-style commands where supported). Rules do not need a trigger phrase; they are already there.

## Decision table: rules vs skills

| Question | Choose **rules** | Choose **skills** |
| --- | --- | --- |
| Must this apply on every edit? | Yes | No |
| Is it under ~30 lines of policy? | Usually yes | Often no |
| Is it a multi-step procedure? | No | Yes |
| Does it include scripts or templates? | Rarely | Common |
| Should unrelated tasks ignore it? | No (use globs or intelligent apply) | Yes |
| Will you share it across repos / tools? | Sometimes | Often (portable SKILL.md) |

**Examples that belong in rules**

- "Use TypeScript strict mode; no \`any\` in \`src/\`."
- "Never commit secrets; env vars only in \`.env.local\`."
- "React components: props interface named \`FooProps\`."

**Examples that belong in skills**

- "Run our UX synthesis pipeline: ingest transcripts → affinity map → draft report."
- "Cut a release: bump version, changelog, tag, deploy staging, smoke test."
- "Migrate legacy class components to hooks using our checklist."

## Side-by-side format

| | Rules | Skills |
| --- | --- | --- |
| File | \`.mdc\` with frontmatter | \`SKILL.md\` in a named folder |
| Scope | Workspace / user | Task-matched |
| Length | Short, high signal | Can be long with linked references |
| Scripts | Unusual | Supported in \`scripts/\` |
| Cross-tool | Cursor-specific | Same SKILL.md works in Claude Code, compatible CLIs |

For SKILL.md structure and trigger writing, see [how to write Claude Code skills](/blog/how-to-write-claude-code-skills). The same description discipline applies in Cursor.

## Rules vs skills vs commands vs hooks

Cursor also has **commands** (explicit invocations) and **hooks** (scripts after agent actions). A useful mental model from the [Cursor forum](https://forum.cursor.com/t/rules-vs-skills-vs-commands-vs-hooks/151829):

- **Rules** — policy (what good code looks like)
- **Skills** — procedures (how to execute a workflow)
- **Commands** — you trigger them on purpose
- **Hooks** — deterministic automation the model cannot skip (format, tests, block dangerous ops)

Hooks are the only layer that **guarantees** behavior. A rule that says "never delete \`migrations/\`" can still be ignored; a hook that rejects the shell command cannot.

## Migrating rules to skills (without breaking policy)

Cursor ships a **\`/migrate-to-skills\`** command (agent chat) to convert eligible rules. Treat it as a **draft**, not a one-click replacement.

**Good migration candidates**

- Long "how we deploy" rules that were alwaysApply but only relevant sometimes
- Legacy command docs pasted into rules
- Intelligent-apply rules that are really runbooks

**Keep as rules**

- Security and compliance one-liners
- Formatting and naming that must apply during refactors
- Anything you want in context even when the task seems off-topic

After migration, run the same tasks you ran before migration. If a skill fails to load, tighten the \`description\` with literal user phrases — the same fix as in [skills troubleshooting](/blog/how-to-write-claude-code-skills#common-mistakes-and-fixes).

## A practical split for a team repo

This is a pattern we see in practitioner repos on [Onie Explore](/app/explore):

\`\`\`
.cursor/rules/
  typescript-standards.mdc      # alwaysApply: stack policy
  no-secrets.mdc                # alwaysApply: security

.agents/skills/
  release-checklist/
    SKILL.md                    # on-demand deploy procedure
  ux-synthesis/
    SKILL.md                    # on-demand research workflow
\`\`\`

**Rules** stay small enough that token cost is negligible (~1–2k tokens combined is normal per forum reports). **Skills** hold the 500-line checklists and linked references.

Document the split in your README or [agent workflow doc](/blog/document-ai-agent-workflows) so new contributors know where to add policy vs procedure.

## Common mistakes

**Moving everything to skills because "rules are deprecated."** They are not. [Cursor positions skills as complementary](https://cursor.com/docs) to rules — dynamic playbooks vs always-on context.

**Putting coding style in a skill.** Style should apply during unrelated refactors. That is a rule (or glob-scoped rule), not a skill.

**Mega-rules that are really runbooks.** If a rule file has numbered deploy steps and shell commands, migrate the procedure to a skill and leave a one-line rule that points to it.

**Vague skill descriptions.** "Helps with code review" will not load reliably. Use "Reviews PRs for security and API breaks. Use when the user asks to review a diff or audit a change."

**Duplicating the same text in rules and skills.** Single source of truth: rule for the one-liner policy, skill for the expanded procedure.

## When to use neither

Skip both for:

- One-off experiments you will throw away
- Personal preferences that change weekly
- Early brainstorming where output shape is undefined

Promote to a **skill** when you have run the same workflow three times and can describe "done." Promote to a **rule** when the whole team must follow a constraint on every change.

## Claude Code vs Cursor (same SKILL.md, different harness)

If your team uses **Claude Code** and **Cursor**, skills are the portable layer. Rules remain editor-specific (\`.mdc\` vs \`AGENTS.md\` / project instructions).

Many teams mirror: Cursor rules for IDE guardrails, shared \`.agents/skills/\` for workflows that also run in Claude Code. See [Claude Code workflow examples](/blog/claude-code-workflow-examples) for orchestration patterns that sit above both.

## Publish what your team agreed on

Comparisons only matter if the workflow ships. After you settle rules-vs-skills boundaries, publish the playbook on [Onie](/app/explore) so others can fork the folder layout — not just the theory.

Browse [About](/about) for how Onie treats public practitioner workflows as the source of truth for agent-era teams.
`.trim(),
  faqs: [
    {
      question: 'Are Cursor skills a replacement for Cursor rules?',
      answer:
        'No. Rules provide always-on or glob-scoped policy. Skills provide on-demand procedural playbooks. Cursor documents them as complementary. Keep short, mandatory standards in rules; put long multi-step workflows in skills.',
    },
    {
      question: 'When should I use Cursor rules instead of skills?',
      answer:
        'Use rules when the instruction must apply even if the task seems unrelated — coding style, security constraints, framework conventions. Use skills when the content is long, procedural, and only relevant for specific tasks.',
    },
    {
      question: 'Can I use both rules and skills together?',
      answer:
        'Yes, and most teams should. Rules set the baseline behavior for the workspace; skills add specialized workflows the agent loads when the task matches. Avoid duplicating the same text in both.',
    },
    {
      question: 'What is the /migrate-to-skills command?',
      answer:
        'A Cursor agent command that converts eligible rules into SKILL.md packages. Review the output manually — keep always-on policy as rules and migrate only procedural runbooks that benefit from on-demand loading.',
    },
    {
      question: 'Where do Cursor skills live on disk?',
      answer:
        'Typically under .cursor/skills/ in the project or a shared .agents/skills/ directory. Each skill is a folder containing SKILL.md with name and description frontmatter. The folder name should match the name field.',
    },
    {
      question: 'Do skills use more tokens than rules?',
      answer:
        'Per task, skills often use fewer tokens because they load only when relevant. Always-on rules consume context on every turn. Many short rules are still cheap (on the order of 1–2k tokens total); the problem is long runbooks pasted into alwaysApply rules.',
    },
    {
      question: 'What is the difference between skills and hooks in Cursor?',
      answer:
        'Skills are instructions the agent may follow when relevant. Hooks are scripts that run after agent actions and can enforce behavior deterministically — for example auto-format, tests, or blocking forbidden shell commands.',
    },
    {
      question: 'How does this relate to Claude Code skills?',
      answer:
        'SKILL.md format is shared across tools that adopted Agent Skills. Cursor skills and Claude Code skills use the same core structure. Cursor rules and Claude project instructions remain editor-specific guardrails.',
    },
  ],
}
