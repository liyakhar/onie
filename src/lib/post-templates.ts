import type { PostKind } from '#/generated/prisma/client'

const TEMPLATES: Partial<Record<PostKind, string>> = {
  SKILL: `## Context

When to use this skill and what problem it solves.

## Files

- \`.cursor/skills/your-skill/SKILL.md\`

## Steps

1. Install or enable the skill
2. Run the workflow
3. Review output

## Notes

Tips, edge cases, or model-specific behavior.
`,
  PROMPT: `## Context

What this prompt is for.

## Prompt

\`\`\`
Your prompt here…
\`\`\`

## Variables

- \`{topic}\` — what to fill in

## Example output

What good output looks like.
`,
  HARNESS: `## Context

What agent behavior this harness shapes.

## Configuration

\`\`\`
Rules, hooks, or harness settings…
\`\`\`

## How to run

1. Step one
2. Step two

## Gotchas

Common failures and fixes.
`,
  WORKFLOW: `## Context

The job this workflow handles end-to-end.

## Setup

- Tools required
- Files or folders involved

## Steps

1. First step
2. Second step
3. Ship

## Output

What you should have when done.
`,
  SETUP: `## Context

Environment or project wiring.

## Prerequisites

- Tool versions
- Access or credentials

## Install

\`\`\`bash
# commands
\`\`\`

## Verify

How to confirm the setup works.
`,
}

export function templateForKind(kind: PostKind): string {
  return TEMPLATES[kind] ?? `## Context\n\nWhat this is for.\n\n## Steps\n\n1. …\n`
}
