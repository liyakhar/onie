import type { BlogPost } from '#/content/blog/types'

export const claudeCodeSkillsPost: BlogPost = {
  slug: 'how-to-write-claude-code-skills',
  title: 'How to write Claude Code skills that actually trigger',
  description:
    'Learn how to write Claude Code skills with SKILL.md — frontmatter, trigger descriptions, folder layout, and when skills beat rules or one-off prompts.',
  publishedAt: '2026-06-16',
  readingMinutes: 9,
  primaryKeyword: 'how to write claude code skills',
  keywordCluster: [
    'how to write claude code skills',
    'claude code skills',
    'SKILL.md format',
    'agent skills best practices',
    'when to use skills vs rules',
  ],
  author: {
    name: 'Maya Chen',
    role: 'UX researcher · Claude Code practitioner',
    bio: 'Runs research synthesis and design QA loops with Claude Code. Publishes the setups she ships on Onie.',
  },
  tldr:
    'A Claude Code skill is a folder with a SKILL.md file: YAML frontmatter (name + description) plus markdown instructions. The description is the trigger — write when to use it, not just what it does. Keep SKILL.md under 500 lines and split reference material into linked files.',
  relatedSlugs: ['claude-code-skills-vs-rules', 'cursor-rules-vs-skills', 'document-ai-agent-workflows'],
  body: `
## What a Claude Code skill is (and is not)

A **skill** is a reusable package of instructions, scripts, and reference files that Claude loads when a task matches. It is not a one-off prompt, not a Cursor rule, and not a slash command you memorize.

Skills shine when the same workflow repeats: code review checklists, release notes from diffs, research synthesis templates, scaffold generators. If you explain the steps more than twice a week, it belongs in a skill.

Rules and project instructions set global guardrails. Skills are **on-demand specialists** — loaded only when the description matches what you are doing.

## The SKILL.md file structure

Every skill starts with a directory. The directory name must match the \`name\` field in frontmatter.

\`\`\`yaml
---
name: code-reviewer
description: Reviews code for bugs, security issues, and style violations. Use when the user asks to review code, check a PR, or find issues in a file.
---

# Code reviewer

## When to activate
Only when the user explicitly wants a review — not for drive-by refactors.

## Steps
1. Read the full diff or file before commenting.
2. Flag blocking issues first (security, data loss, broken contracts).
3. Suggest fixes with minimal scope — no unrelated cleanups.
\`\`\`

The [official Claude skills guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) recommends keeping the main SKILL.md body under **500 lines**. Move long references to \`references/\`, templates to \`assets/\`, and repeatable scripts to \`scripts/\`.

## Writing the description field (the trigger)

The \`description\` is the only metadata Claude uses to decide whether to load the skill. Name alone is not enough.

**Do this:**
- State what the skill does in one sentence.
- Add a second sentence with trigger phrases: "Use when…", "Triggers on…".
- Include domain keywords someone would actually type.

**Avoid this:**
- Vague labels: "Helps with code" or "General assistant".
- Marketing adjectives: "world-class", "seamless", "powerful".
- Describing features without use cases.

Compare:

| Weak | Strong |
| --- | --- |
| "Helps review PRs" | "Reviews pull requests for security, regressions, and API contract breaks. Use when the user says review this PR, check my diff, or audit this change." |

Test triggers by asking Claude a realistic request without naming the skill. If it does not load, your description is too narrow or too generic.

## Folder layout that scales

A practical layout for skills you share on [Onie](/app/explore):

\`\`\`
my-skill/
  SKILL.md          # Core workflow + when to use
  references/
    checklist.md    # Loaded only when needed
  scripts/
    verify.sh       # Deterministic checks
  assets/
    template.md     # Output skeleton
\`\`\`

**Progressive disclosure** matters: Claude reads SKILL.md first, then pulls other files only when the task needs them. Do not paste a 2,000-line style guide into SKILL.md — link it.

## Step-by-step: ship your first skill

1. **Pick one repeatable task** — e.g. "turn interview notes into affinity clusters".
2. **Create the folder** under \`.cursor/skills/\` or your team's skills repo.
3. **Draft frontmatter** with a specific \`description\` and matching \`name\`.
4. **Write imperative steps** — numbered, with inputs, outputs, and failure modes.
5. **Add one worked example** — sample input and expected output shape.
6. **Run three real tasks** — note where Claude drifts; tighten instructions.
7. **Publish the workflow** on Onie so others can fork your folder layout.

## Skills vs rules vs project instructions

| Mechanism | Scope | Best for |
| --- | --- | --- |
| Project rules (\`.cursorrules\`, \`AGENTS.md\`) | Whole repo | Conventions, stack, "never do X" |
| Skills | Task-specific | Repeatable multi-step workflows |
| One-off prompts | Single session | Experiments, one-time tasks |

If you find yourself pasting the same block into every chat, promote it to a skill. If it applies to every file in the repo, keep it in rules.

## Common mistakes (and fixes)

**Skill never triggers.** Rewrite \`description\` with literal user phrases. Add "Use when" clauses.

**Skill triggers too often.** Narrow the scope — split one mega-skill into two focused ones.

**Instructions ignored mid-run.** Steps are too long or buried. Put the checklist at the top; move theory to \`references/\`.

**Works on your machine only.** Document required env vars, file paths (forward slashes), and which tools must exist.

## When not to bother with a skill

Skip skills for one-time migrations, personal preferences that change weekly, or tasks where the output format is intentionally undefined (early brainstorming). A skill is a contract — if you cannot describe done, wait until you can.

## Share what works

The setups that survive contact with real work are worth publishing. Browse field-tagged workflows in [Explore](/app/explore) or read [how to document agent workflows](/blog/document-ai-agent-workflows) before you post yours.
`.trim(),
  faqs: [
    {
      question: 'Where do Claude Code skills live on disk?',
      answer:
        'Personal skills typically live under ~/.cursor/skills/ or your project .cursor/skills/ directory. The folder name must match the name field in SKILL.md frontmatter. Team repos often vendor skills under .agents/skills/ and symlink or copy them into Cursor.',
    },
    {
      question: 'What is the difference between a skill and a Cursor rule?',
      answer:
        'Rules apply globally to a workspace — coding style, framework choices, safety constraints. Skills load on demand when a task matches the skill description. Use rules for always-on guardrails; use skills for repeatable workflows with steps and examples.',
    },
    {
      question: 'How long should SKILL.md be?',
      answer:
        'Anthropic recommends keeping the main SKILL.md body under 500 lines for performance. Put detailed reference material in separate files and link to them from SKILL.md so Claude loads extras only when needed.',
    },
    {
      question: 'Can skills include executable scripts?',
      answer:
        'Yes. Place scripts in a scripts/ subdirectory inside the skill folder. Document prerequisites, expected inputs, and exit codes in SKILL.md. Scripts are useful for deterministic checks that should not be left to the model alone.',
    },
    {
      question: 'Why is my skill not activating?',
      answer:
        'Almost always the description. It must include both what the skill does and explicit trigger phrases a user would say. Test by issuing a realistic request without naming the skill. If it fails, add more specific "Use when" language.',
    },
    {
      question: 'Do skills work outside Claude Code?',
      answer:
        'The SKILL.md format is portable across many agent tools that adopted the same convention. Skills with only name, description, and markdown instructions tend to work across Claude.ai, Claude Code, and compatible CLIs. Tool-specific frontmatter may be ignored elsewhere.',
    },
  ],
}
