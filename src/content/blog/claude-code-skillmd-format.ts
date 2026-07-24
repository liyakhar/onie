import type { BlogPost } from '#/content/blog/types'

export const claudeCodeSkillmdFormatPost: BlogPost = {
  slug: 'claude-code-skillmd-format',
  title: 'Claude Code SKILL.md format: frontmatter and structure',
  description:
    'Master SKILL.md frontmatter fields, triggering logic, and folder structure. Write skills that fire reliably with name, description, arguments, and optional metadata.',
  publishedAt: '2026-07-24',
  readingMinutes: 10,
  primaryKeyword: 'claude code SKILL.md format',
  keywordCluster: [
    'claude code SKILL.md format',
    'SKILL.md frontmatter',
    'how to structure SKILL.md',
    'claude code skill directory',
    'SKILL.md triggering',
    'skill metadata fields',
    'claude skill template',
    'SKILL.md examples',
  ],
  author: {
    name: 'Liam Chen',
    role: 'Developer · Claude Code ecosystem',
    bio: 'Ships Claude Code skills and documents patterns that survive production use. Focuses on practical skill architecture and reliable triggering behavior.',
  },
  tldr:
    'A SKILL.md file has two parts: YAML frontmatter (name, description, optional metadata) and markdown instructions. The description tells Claude when to activate the skill; the directory name must match the name field. Place helper files in references/, assets/, or scripts/ subdirectories and reference them by relative path. Test triggering with real requests to ensure your description matches how users actually ask for help.',
  relatedSlugs: [
    'agent-skills-best-practices',
    'how-to-write-claude-code-skills',
    'claude-code-skills-vs-rules',
  ],
  body: `
## The SKILL.md anatomy: two parts

Every Claude Code skill lives in a directory with a required \`SKILL.md\` file. That file has exactly two parts:

1. **YAML frontmatter** (between three hyphens) — metadata Claude reads to decide when to activate the skill
2. **Markdown body** — instructions Claude follows when the skill runs

The directory name must match the \`name\` field in the frontmatter. If they do not match, Claude cannot load the skill.

\`\`\`
my-skill/
  SKILL.md                    # Required: frontmatter + instructions
  references/
    setup.md
  assets/
    template.md
  scripts/
    validate.sh
\`\`\`

## Required frontmatter fields

Only two fields are truly required: \`name\` and \`description\`. Everything else is optional.

### name

The command name users type or Claude invokes programmatically. Lowercase letters, numbers, hyphens only. Maximum 64 characters.

\`\`\`yaml
---
name: code-reviewer
---
\`\`\`

If you omit \`name\`, Claude uses the directory name. Most skills omit it for this reason.

### description

The single most important field. Claude reads this to decide whether to load your skill in response to a user request. It is not marketing copy — it is a trigger condition.

A strong description tells Claude:
- What the skill does (one sentence)
- When to activate it (explicit trigger phrases)

**Weak description (vague):**
\`\`\`yaml
description: Helps with code reviews
\`\`\`

**Strong description (literal triggers):**
\`\`\`yaml
description: Reviews pull requests for security vulnerabilities, API contract breaks, and performance regressions. Use when the user asks to review a PR, audit a diff, or check code for bugs.
\`\`\`

Claude matches the user's request against your description. Vague language means the skill stays dormant. Literal phrases mean it fires reliably.

**Length:** Claude.ai enforces 200 characters; the Agent Skills specification allows up to 1024. Keep it concise but specific.

## Recommended frontmatter fields

### tags

An array of labels for categorization. Helps Claude and users understand skill grouping.

\`\`\`yaml
tags: [security, review, code-quality]
\`\`\`

### model

Specify the Claude model required for this skill. Defaults to the user's selected model.

\`\`\`yaml
model: claude-opus-4.7
\`\`\`

Use this if your skill relies on features only available in newer models or if you want to enforce a specific capability level.

### allowed-tools

Pre-approve which tools the skill can use without asking permission. Pass as a space- or comma-separated string, or a YAML list.

\`\`\`yaml
allowed-tools: [Read, Grep, Shell]
\`\`\`

or

\`\`\`yaml
allowed-tools: "Read Grep Shell"
\`\`\`

This speeds up execution for read-only helpers or deterministic operations.

### arguments

Define named positional arguments for templating. Useful when your skill accepts parameters.

\`\`\`yaml
arguments: [repository, branch, pr-number]
\`\`\`

Then reference them in the markdown body as \`$repository\`, \`$branch\`, \`$pr-number\`, or use \`$ARGUMENTS\` to access all of them.

### user-invokable

Boolean. Set to \`false\` if the skill should only run when explicitly invoked with a slash command (\`/my-skill\`), never automatically.

\`\`\`yaml
user-invokable: false
\`\`\`

Defaults to \`true\`.

### disable-model-invocation

Set to \`true\` to prevent Claude from automatically loading this skill. Useful for workflows with side effects (deploys, commits, publishing) that you want to trigger manually, not via automatic matching.

\`\`\`yaml
disable-model-invocation: true
\`\`\`

This is stronger than \`user-invokable: false\` because it completely disables automatic discovery.

### metadata.version

Track skill versioning for teams or published registries.

\`\`\`yaml
metadata:
  version: "1.0.0"
\`\`\`

### homepage and repository

URLs for documentation and source code. Useful when skills are published or shared.

\`\`\`yaml
homepage: https://mycompany.com/skills/docs
repository: https://github.com/mycompany/skills
\`\`\`

## Optional fields you might not need immediately

### when_to_use

Explicit trigger guidance (separate from \`description\`). Some teams use this to extend the description with edge cases or examples.

\`\`\`yaml
description: Deploys code to production
when_to_use: "Use when you are ready to release a new version. Do not use for testing or staging."
\`\`\`

### dependencies

Declare runtime dependencies (Python, Node packages, system tools). Claude can install them when loading the skill.

\`\`\`yaml
dependencies: python>=3.8, pandas>=1.5.0, matplotlib
\`\`\`

### context

Advanced option to control context window behavior. Usually not needed.

\`\`\`yaml
context: fork
\`\`\`

## Markdown body: instructions

After the frontmatter block, write markdown instructions for Claude.

Keep it under 500 lines. Use:
- Numbered steps or clear section headings
- Code examples showing input and output
- Edge cases from real-world use
- Links to supporting files (references/, assets/, scripts/)

Example structure:

\`\`\`markdown
## What this skill does

Briefly explain the workflow.

## Prerequisites

What must be set up before using this skill.

## Steps

1. Read the user's request
2. Validate inputs
3. Perform the main task
4. Report results

## Example

**Input:** A pull request URL
**Output:** A review with security issues, performance notes, and suggestions

## Edge cases

See \`references/edge-cases.md\` for how to handle...
\`\`\`

## The frontmatter syntax: strict YAML rules

The frontmatter block is delimited by three hyphens on a line by themselves. This is standard YAML for inline document headers and it is strict.

**Correct:**
\`\`\`yaml
---
name: my-skill
description: Does something useful
---
\`\`\`

**Incorrect (extra hyphens, missing closing block):**
\`\`\`yaml
----
name: my-skill
description: Does something useful
\`\`\`

**Incorrect (wrong delimiter):**
\`\`\`yaml
===
name: my-skill
description: Does something useful
===
\`\`\`

Always use exactly three hyphens, on their own lines, at the start and end of the block.

## Multiline strings in frontmatter

If a field value spans multiple lines, use YAML multiline syntax:

\`\`\`yaml
---
name: my-skill
description: |
  Does X, Y, and Z.
  Use when you need to review code,
  check for security issues,
  or validate a pull request.
---
\`\`\`

Use \`|\` for literal strings (preserves line breaks) or \`>\` for folded strings (joins lines).

## Supporting files: structure and paths

Keep the main SKILL.md under 500 lines. Move detailed content to subdirectories and reference them by relative path.

### references/

Documentation, schemas, checklists, error codes — anything Claude reads only when needed.

\`\`\`
references/
  setup.md
  error-codes.md
  security-checklist.md
\`\`\`

**Reference from SKILL.md:**
\`\`\`markdown
## Error codes

See \`references/error-codes.md\` for a complete list of API responses.
\`\`\`

### assets/

Templates, output formats, lookup tables. Useful when the skill needs to generate structured output.

\`\`\`
assets/
  report-template.md
  approval-checklist.md
\`\`\`

### scripts/

Executable code (Python, Node.js, Bash). Claude calls them without reading the full code; you only pay for the output.

\`\`\`
scripts/
  validate.sh
  lint.py
\`\`\`

**Invoke from SKILL.md:**
\`\`\`markdown
## Validation

Run \`bash scripts/validate.sh\` to check prerequisites.
\`\`\`

**Keep subdirectories flat.** Avoid nested paths like \`references/db/v1/schema.md\`. Use instead \`references/db-schema-v1.md\`. Flat structure is easier to navigate and requires less agent context.

## Test triggering: the real feedback loop

The strongest way to validate your SKILL.md is to ask Claude to do the work without naming the skill.

**Test flow:**
1. Write your skill with a specific description
2. Start a new Claude Code conversation
3. Ask a request that should trigger it — without saying the skill name
4. Watch the agent traces:
   - Did Claude load the skill?
   - Did it read the description?
   - Did it follow the steps?

If the skill did not load, rewrite the description with more literal trigger phrases. Test again. Most published skills go through 2–3 iterations of this feedback loop before they reliably fire.

## Anti-patterns: what breaks triggering

### Description is too narrow

\`\`\`yaml
description: Handles the Q3 marketing review
\`\`\`

This is so specific that the skill only loads if the user types exactly that phrase. Add broader trigger aliases.

### Description is too vague

\`\`\`yaml
description: Helps with work
\`\`\`

Claude cannot tell what to match. Rewrite with explicit "Use when" clauses and concrete phrases users say.

### YAML syntax is broken

Missing hyphens, extra spaces, wrong indentation — all cause parsing failures. Validate YAML syntax before testing.

### name does not match directory

\`\`\`
my-skill/
  SKILL.md
  ---
  name: different-name
\`\`\`

Claude looks for the directory \`different-name/\`. This will not load. Always match them.

### Frontmatter is 2,000 words

Frontmatter costs context on every load. If you are listing features and edge cases in the description, move them to \`references/\` and link from the markdown body.

## Practical checklist

Before publishing a SKILL.md:

- [ ] \`name\` and directory name match
- [ ] \`description\` includes literal "Use when…" phrases
- [ ] Markdown body is under 500 lines
- [ ] Supporting files are in flat subdirectories (references/, scripts/, assets/)
- [ ] Each file name is descriptive (not \`data.md\`, use \`error-codes.md\`)
- [ ] Examples show input and output
- [ ] Optional: \`disable-model-invocation\` is set for side-effect skills
- [ ] Optional: \`allowed-tools\` pre-approves needed tools
- [ ] Tested by asking without naming the skill

## Next: integrate with Cursor and Claude Code

Once your SKILL.md is ready, place it in:
- **Cursor:** \`~/.cursor/skills/\`
- **Claude Code:** \`~/.claude/skills/\`

From there, Claude discovers and loads it automatically. Share with teammates by committing to a shared git folder and pointing each to the same path.

To explore published skills and share your own, visit [Onie Explore](/app/explore).
`.trim(),
  faqs: [
    {
      question: 'What fields in SKILL.md frontmatter are actually required?',
      answer:
        'Technically, only name and description are needed. But in practice, you likely want only description, since the directory name defaults to the name field. Without description, Claude has no trigger signal and the skill becomes manual-only (/my-skill). Other fields like model, tags, allowed-tools, and arguments are optional and add control as your skills grow.',
    },
    {
      question: 'How does Claude decide whether to load my skill?',
      answer:
        'Claude reads the description field and matches it against the user\'s request. If the description says "Use when the user asks to review a PR" and the user says "check this pull request for bugs", Claude sees the match and loads the skill. Test this by asking Claude to do the work without naming the skill. If it loads, your description is working.',
    },
    {
      question: 'My SKILL.md is 1,500 lines and Claude keeps stopping mid-execution. Why?',
      answer:
        'Context cost. Every time Claude loads your skill, it reads all 1,500 lines. Identify major sections (workflows, schemas, edge cases) and move them to separate files in references/ or assets/. Update SKILL.md to link and instruct Claude when to read each file. Target under 500 lines for the main body.',
    },
    {
      question: 'Do I need to specify the model in frontmatter?',
      answer:
        'Only if your skill requires a specific Claude model or version. If you omit it, Claude uses the user\'s selected model. Use the model field only when your skill relies on features in newer models (like extended thinking) or when you want to enforce a minimum capability level.',
    },
    {
      question: 'What is the difference between disable-model-invocation and user-invokable?',
      answer:
        'disable-model-invocation prevents Claude from ever automatically discovering and loading the skill. user-invokable controls whether the skill is callable via slash commands. For a skill that should never auto-load (like a destructive deploy), use disable-model-invocation. For a reference skill that can auto-load but you also want to invoke explicitly, use user-invokable.',
    },
    {
      question: 'Should I put long lists of arguments in the frontmatter description?',
      answer:
        'No. If your skill accepts arguments, declare them in the arguments field: arguments: [file, format, level]. Reference them in the body as $file, $format, $level. This keeps the description concise and the arguments self-documenting. The description should explain what the skill does and when to use it, not enumerate parameters.',
    },
    {
      question: 'Can I use nested folders like references/db/v1/schema.md?',
      answer:
        'Avoid nesting. Use flat, one-level-deep structure: references/db-schema-v1.md instead. Deeply nested paths make it harder for Claude to track locations and increase context overhead. If you have many files, group by topic name (db, api, auth) rather than by hierarchy.',
    },
    {
      question: 'Where do I put executable scripts in a skill?',
      answer:
        'Create a scripts/ folder next to SKILL.md. Put Python, Node.js, or Bash scripts there. Reference them from SKILL.md with relative paths: "Run bash scripts/validate.sh to check prerequisites." Claude invokes scripts without reading the code, so you only pay for the output, not the full script content.',
    },
  ],
}
