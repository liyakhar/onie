import type { BlogPost } from '#/content/blog/types'

export const cursorAgentSkillsMigratePost: BlogPost = {
  slug: 'cursor-agent-skills-migrate',
  title: 'Migrate Cursor rules to agent skills with /migrate-to-skills',
  description:
    'Convert your Cursor dynamic rules and slash commands to agent skills in seconds. How to use /migrate-to-skills, what gets migrated, and the mental model for when to use skills instead of rules.',
  publishedAt: '2026-08-01',
  readingMinutes: 8,
  primaryKeyword: 'cursor agent skills migrate',
  keywordCluster: [
    'cursor agent skills migrate',
    'migrate cursor rules to skills',
    'cursor skills vs rules',
    'cursor /migrate-to-skills command',
    'how to use cursor skills',
    'cursor skill structure',
    'cursor skill best practices',
  ],
  author: {
    name: 'Jordan Blake',
    role: 'Developer · Agent workflows',
    bio: 'Works with teams moving from static rules to dynamic agent skills. Helps developers ship agent-powered codebases faster.',
  },
  tldr:
    'Cursor 2.4+ includes a built-in `/migrate-to-skills` command that converts eligible dynamic rules and slash commands into agent skills automatically. The migrated skills work across Cursor, Claude Code, and other agent tools. Rules with `alwaysApply: true` or file-specific `globs` stay as rules, since they have explicit triggering conditions that differ from skill behavior.',
  relatedSlugs: ['when-to-use-skills-vs-rules', 'agent-skills-best-practices', 'how-to-write-claude-code-skills'],
  body: `
## The mental model: Rules vs skills

Before you migrate, understand what you are moving.

A **rule** is always-on context. You write it down once, and Cursor applies it to everything you type. Rules with \`alwaysApply: true\` are guardrails: "Never commit secrets." "Always use TypeScript strict mode." "Check this before deployment." They are environmental constraints, and they fire without being asked.

A **skill** is a sometimes-relevant workflow. You trigger it by asking ("How do I set up this feature?") or Cursor surfaces it when the context fits. Skills are portable. The same \`SKILL.md\` file works in Cursor, Claude Code, Anthropic's native agent, and any tool that reads the Agent Skills standard. Rules are Cursor-only.

The best architecture uses both:

- **Rules** handle always-on constraints (security, style, deployment gates)
- **Skills** handle repeatable workflows you might invoke (code review, release checklist, documentation template)

Cursor 2.4 added `/migrate-to-skills` to help you move things from the rule pile into the skill pile. This guide walks you through what happens, what stays, and how the process works.

## What the /migrate-to-skills command does

Open Cursor's Agent chat and type:

\`\`\`
/migrate-to-skills
\`\`\`

Cursor scans your \`.cursor/rules/\` directory for eligible rules and any slash commands you have set up, then shows you a migration plan.

The command converts:

- **Dynamic rules** with \`alwaysApply: false\` (or undefined) and no \`globs\` patterns
- **Slash commands** at both user and workspace level

Each converted rule becomes a \`SKILL.md\` file in \`.cursor/skills/\`.

## What gets migrated vs what stays

This is the key part. Not everything moves.

### What gets migrated

**Dynamic rules.** If your rule looks like this:

\`\`\`yaml
---
name: code-review-checklist
description: Run through code review steps before pushing
---
\`\`\`

It has no \`alwaysApply: true\` and no \`globs\` patterns. It is dynamic—applied when relevant, not always. This gets converted to a skill.

**Slash commands.** If you have set up a slash command like \`/release\` or \`/new-feature\`, it becomes a skill with \`disable-model-invocation: true\`. That means you still invoke it with the slash, but now it works across Cursor and other agent tools.

### What does not get migrated

**Always-apply rules.** Rules with \`alwaysApply: true\` are guardrails. They stay as rules because they have explicit triggering conditions.

\`\`\`yaml
---
name: security-check
alwaysApply: true
---
\`\`\`

These protect your codebase always. Migration would break that guarantee. They stay in \`.cursor/rules/\`.

**File-specific rules.** Rules with \`globs\` patterns are scoped to specific file types. They have explicit conditions and stay as rules.

\`\`\`yaml
---
name: typescript-style
globs: '**/*.ts'
---
\`\`\`

These apply to all TypeScript files automatically. Moving them to skills would lose that scope. They stay.

**User-level rules.** User rules (rules you set up at the OS level, not in your repo) are not migrated because they are not stored on the file system. You would need to recreate them manually or share them as a skill.

## Step-by-step: How to migrate

### Step 1: Review your rules directory

Open \`.cursor/rules/\` and scan what you have:

\`\`\`
.cursor/
└── rules/
    ├── code-review.mdc           (alwaysApply: false, no globs) ← Migrates
    ├── security-checklist.mdc    (alwaysApply: true) ← Stays
    ├── typescript.mdc            (globs: **/*.ts) ← Stays
    └── deployment.mdc            (alwaysApply: false, no globs) ← Migrates
\`\`\`

Rules without \`alwaysApply\` or \`globs\` are candidates.

### Step 2: Run /migrate-to-skills in Agent chat

Type the command. Cursor identifies eligible rules and shows you what it will convert.

The output shows something like:

\`\`\`
Found 3 eligible rules:
  • code-review.mdc → code-review/ (standard skill)
  • deployment.mdc → deployment/ (standard skill)
  • release-command → release/ (slash command skill)

2 rules will stay in .cursor/rules/:
  • security-checklist.mdc (alwaysApply: true)
  • typescript.mdc (globs: **/*.ts)
\`\`\`

### Step 3: Review the generated skills

After migration, open \`.cursor/skills/\` and review each converted skill:

\`\`\`
.cursor/
├── rules/
│   ├── security-checklist.mdc
│   └── typescript.mdc
└── skills/
    ├── code-review/
    │   └── SKILL.md
    ├── deployment/
    │   └── SKILL.md
    └── release/
        └── SKILL.md
\`\`\`

The \`SKILL.md\` files follow the open Agent Skills standard. Open one and check:

- Does the description match your intent?
- Are the instructions clear?
- Is the scope right (should this skill apply everywhere or just this project)?

### Step 4: Test your skills

Invoke a migrated skill by name:

\`\`\`
/code-review
\`\`\`

Or let Cursor surface it automatically when context matches. If a slash command was migrated, it still works the same way—type the slash and the command name.

### Step 5: Commit and share

Skills are just files. Commit them to Git and push. Your team gets the skills on the next pull.

\`\`\`bash
git add .cursor/skills/
git commit -m "Migrate rules to agent skills"
git push
\`\`\`

If your team uses mixed tools (some in Cursor, some in Claude Code), move skills to \`.agents/skills/\` instead of \`.cursor/skills/\`. That makes them available everywhere.

## Common migration patterns

### Pattern 1: Convert a code review checklist

Before:

\`\`\`yaml
---
name: code-review
description: Run through code review steps before pushing
alwaysApply: false
---
\`\`\`

After migration, the checklist becomes an invokable skill. Type \`/code-review\` and Cursor walks you through each step. No more copying the checklist every time.

### Pattern 2: Convert slash commands to portable skills

If you had:

\`\`\`yaml
/new-feature
/release
/docs-update
\`\`\`

They migrate to skills with \`disable-model-invocation: true\`. They still work as slash commands, but now they also work in Claude Code or other compatible tools. Your team can use them everywhere.

### Pattern 3: Keep always-apply rules, expose their logic as a skill

Some things must stay as rules (security gates, linters, deployment checks). But you might also want a skill that explains the process:

\`\`\`
Rule (stays): security-checklist.mdc (alwaysApply: true)
Skill (new): security-audit/ (SKILL.md) — explains the rule
\`\`\`

The rule enforces it. The skill teaches it. They work together.

## What does not migrate (and what to do instead)

### User-level rules

User rules live in \`~/.cursor/rules/\` and are not stored in your repo, so migration skips them.

If you want to share a user rule with your team, convert it to a skill and put it in \`.cursor/skills/\` or \`.agents/skills/\`. Then everyone gets it on the next pull.

### Workspace-specific rules with globs

Rules scoped to specific file types (TypeScript, React, Python) have explicit triggers and stay as rules. That is correct. Do not migrate these.

If you want a skill that teaches the pattern, create a new \`SKILL.md\` that explains the rule. Keep the rule as the guard, add the skill as the guide.

## When to publish your migration workflow on Onie

Once your team has migrated rules to skills, share the pattern:

- Your migration checklist (what you moved, what stayed)
- The skill templates you use most often
- How you scope skills (project-level vs team-level)
- Which slash commands you converted and why

Post it on Onie and help other builders understand the rules-vs-skills decision.

## FAQ

**Q: Do I have to migrate everything?**
A: No. Migrate when it makes sense. Always-apply rules stay as rules. File-scoped rules stay as rules. Migrate dynamic rules and slash commands if you want them portable and invokable.

**Q: Will my slash commands still work after migration?**
A: Yes. Migrated slash commands become skills with \`disable-model-invocation: true\`, which means they stay as slash commands. You can still type \`/release\` or \`/code-review\` and they work the same way.

**Q: Can I migrate to .agents/skills instead of .cursor/skills?**
A: Yes. \`/migrate-to-skills\` writes to \`.cursor/skills/\` by default, but you can move the generated skills to \`.agents/skills/\` afterward. That makes them available in Claude Code and other compatible tools.

**Q: What if a rule has partial conditions I want to keep?**
A: Review the generated \`SKILL.md\` and edit it. Skills support the same conditions and scoping as rules. You can add \`paths\` to scope to specific files or add \`disable-model-invocation: true\` to preserve manual-only behavior.

**Q: Do migrated skills work on my team?**
A: Yes. Commit them to Git. On the next pull, everyone gets the skills. If you put them in \`.agents/skills/\`, they work in Cursor, Claude Code, Anthropic Agent, and any compatible tool.

**Q: What happens if I migrate, then decide to change something?**
A: Skills are just files. Edit the \`SKILL.md\`, commit, push. Everyone gets the update. You can also revert the migration and go back to rules if needed.

**Q: Can I have both a rule and a skill for the same workflow?**
A: Yes. A rule can enforce it (always-on guardrail), and a skill can teach it (invokable guide). They complement each other.
`.trim(),
  faqs: [
    {
      question: 'Do I have to migrate all my rules?',
      answer:
        'No. Migrate only eligible dynamic rules and slash commands. Rules with `alwaysApply: true` or specific `globs` patterns stay as rules because they have explicit triggering conditions. Not everything should be a skill.',
    },
    {
      question: 'Will my slash commands still work after migration?',
      answer:
        'Yes. Migrated slash commands become skills with `disable-model-invocation: true`, which preserves their manual invocation behavior. Type `/command-name` and it works the same way.',
    },
    {
      question: 'Can I migrate skills to .agents/skills instead of .cursor/skills?',
      answer:
        'Yes. `/migrate-to-skills` writes to `.cursor/skills/` by default, but you can move them to `.agents/skills/` afterward. That makes them available in Claude Code and other compatible tools.',
    },
    {
      question: 'What if I have user-level rules?',
      answer:
        'User rules (in `~/.cursor/rules/`) are not stored in your repo, so they are not migrated. To share them, convert them to skills and put them in `.agents/skills/` or `.cursor/skills/` in your project.',
    },
    {
      question: 'Can I have both a rule and a skill for the same workflow?',
      answer:
        'Yes. Use rules for always-on guardrails (security, deployment gates) and skills for invokable workflows (checklists, templates). They work together and do not conflict.',
    },
    {
      question: 'How do I revert a migration if I change my mind?',
      answer:
        'Skills are just files. Delete the `.cursor/skills/` folder or move skills back to rules. Or keep both and edit them to suit your needs. Git lets you revert if needed.',
    },
    {
      question: 'Do my team members get the migrated skills?',
      answer:
        'Yes. Commit the skills to Git and push. On the next pull, everyone gets them. Skills in `.agents/skills/` work in Cursor, Claude Code, and other compatible tools.',
    },
    {
      question: 'What is the difference between rules with globs and scoped skills?',
      answer:
        'Rules with `globs` fire automatically on matching files. Skills with `paths` need to be invoked. Globs are always-on triggers, `paths` are optional scoping. Rules stay as rules if they have globs; skills become optional when scoped.',
    },
  ],
}
