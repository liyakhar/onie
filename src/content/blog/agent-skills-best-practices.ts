import type { BlogPost } from '#/content/blog/types'

export const agentSkillsBestPracticesPost: BlogPost = {
  slug: 'agent-skills-best-practices',
  title: 'Agent skills best practices: discovery, structure, and testing',
  description:
    'Master agent skills with progressive disclosure patterns: metadata for discovery, SKILL.md under 500 lines, flat reference structure, and testing with agent traces.',
  publishedAt: '2026-07-16',
  readingMinutes: 12,
  primaryKeyword: 'agent skills best practices',
  keywordCluster: [
    'agent skills best practices',
    'SKILL.md structure',
    'skill authoring guide',
    'how to write agent skills',
    'progressive disclosure pattern',
  ],
  author: {
    name: 'Sam Whitmore',
    role: 'Full-stack engineer · Onie practitioner',
    bio: 'Builds cloud agents for internal tools and data workflows. Focuses on patterns that scale across teams and tools.',
  },
  tldr:
    'Effective agent skills follow a progressive disclosure pattern: metadata (name + description) advertise what the skill does; SKILL.md stays under 500 lines with step-by-step procedures; supplementary files live in flat subdirectories (references/, scripts/, assets/) and load only when needed. The description is your control — it decides whether the agent activates the skill at all.',
  relatedSlugs: [
    'how-to-write-claude-code-skills',
    'claude-code-skillmd-format',
    'claude-code-skills-vs-rules',
    'document-ai-agent-workflows',
  ],
  body: `
## The skill discovery problem

When you drop a skill into a project, the agent does not automatically use it. Instead, the agent reads the **description** field from your SKILL.md frontmatter and decides: does this match what the user is asking me to do?

If the description is vague ("Helps with code") or off-topic (listing features instead of trigger phrases), the skill stays dormant. You rewrite. Nothing changes. The problem was never the instructions inside SKILL.md — it was the two lines at the top.

This is why a skill's **discovery phase** matters more than most people realize. You have one chance to tell the agent what you do and when to activate.

## Progressive disclosure: four layers

The best skills follow an architecture that loads context only as needed. Think of it as a contract between you and the model: advertise cheap, deliver on demand.

### Layer 1: Advertise (~100 tokens per skill)

At startup, the agent sees only the skill name and description in the system prompt. These are injected for every run so the agent can decide relevance without reading 500 lines.

**Write your description to answer both questions:**
- What does this skill do? (one sentence)
- When should I activate it? (trigger phrases)

Compare:

| Weak | Strong |
| --- | --- |
| "Helps with code reviews" | "Reviews pull requests for security regressions, API contract breaks, and style violations. Use when the user asks to review a PR, audit a diff, or find issues in a file." |
| "Handles deployments" | "Deploys code to production using our release checklist: bump version, tag, push staging, run smoke tests. Use when the user says cut a release or prepare a deploy." |

The agent needs literal trigger phrases. If you only list features, it guesses — and guesses wrong.

### Layer 2: Load (~5,000 tokens, recommended)

When a task matches the description, the agent calls a \`load_skill\` action to retrieve the full SKILL.md. This is where your procedure lives.

Keep SKILL.md body under 500 lines. Move lengthy reference material to separate files. Structure with:

- **One H1** for the skill title
- **Steps or sections** organized for scanning (use headers, not prose)
- **Examples** showing input and output
- **Edge cases** you have hit in real use

Do not paste your entire playbook inline. Assume the agent is intelligent and already knows your domain.

### Layer 3: Read resources (on demand)

When the agent needs supplementary info — error codes, templates, validation schemas — it loads them explicitly. You control this with just-in-time instructions: "See \`references/error-codes.md\` for API responses."

Keep your reference files **flat and one level deep**. Avoid nested directories (\`references/db/v1/schema.md\` is too deep; \`references/schema-v1.md\` is good).

### Layer 4: Run scripts (on demand)

For deterministic operations — format checking, boilerplate generation, dependency validation — bundle scripts in a \`scripts/\` folder. The agent calls them without reading the code, paying only for the output.

This pattern keeps the agent's context window lean while giving it access to deep knowledge when needed.

## Core principles for writing skills

### Be specific, not general

An agent discovers skills by matching descriptions to requests. Vague language wastes that signal.

**Weak description:**
\`\`\`yaml
name: code-helper
description: Helps with code-related tasks
\`\`\`

**Strong description:**
\`\`\`yaml
name: code-reviewer
description: Reviews pull requests for security vulnerabilities, API contract breaks, and compliance violations. Use when the user asks to review a diff, check a PR, audit code for bugs, or validate a change before merge.
\`\`\`

Specific descriptions load the right skill at the right time. General descriptions load too often or not at all.

### Prefer procedures over knowledge

Skills are **workflows**, not reference docs. A skill should answer "how do I do this?" not "what is this?"

**Reference doc (not a skill):**
- What is OAuth 2.0?
- Why use microservices?
- Explain REST principles.

**Skill (not a reference):**
- How to implement OAuth 2.0 authorization code flow with state and PKCE
- How to migrate a monolith to microservices using strangler fig pattern
- How to design REST endpoints for CRUD operations

If you are writing knowledge without steps, save it as documentation or a reference. Skills drive action.

### Use imperative steps, not narrative

Narrative prose is slow for agents to parse. Numbered steps are fast.

**Narrative (slower):**
\`\`\`markdown
To review code, you should start by looking at the overall structure. 
Then check for bugs, and after that check style. Finally, write comments.
\`\`\`

**Imperative (faster):**
\`\`\`markdown
1. Read the full diff or file before commenting.
2. Flag security and data loss issues first (blocking).
3. Comment on API contract breaks (second pass).
4. Suggest style and readability improvements (third pass).
5. Summarize with links to specific lines.
\`\`\`

Steps are scannable. The agent finds the outline fast and executes without re-reading.

### Test with real work, not assumptions

Most broken skills fail because the description does not match how people actually ask for help.

**What to do:**
1. Draft your skill with a realistic description
2. Ask an agent a real request **without naming the skill** — e.g., "review this PR" not "use my code-reviewer skill"
3. Check the agent traces to see if it loaded
4. If it did not load, rewrite the description with more trigger phrases

The description is your only control knob. Every rewrite based on failed traces pays dividends.

## Skill folder anatomy

A mature skill follows this layout:

\`\`\`
skill-name/
  SKILL.md                 # Procedures, steps, examples (~300–500 lines)
  references/              # Schemas, checklists, edge cases (flat, one level)
    checklist.md
    error-codes.md
  scripts/                 # Executable utilities (no library code)
    validate.sh
  assets/                  # Output templates
    report-template.md
\`\`\`

**SKILL.md** is your entry point. Agents start here. Make it high-signal.

**references/** holds deep context, loaded only when the agent asks for it. Each file is one topic. Avoid nested folders.

**scripts/** contains utilities for fragile or repetitive work. Include example invocations and document inputs/outputs.

**assets/** stores templates the agent can copy to build output. A template is more legible than 200 words of description.

## Common anti-patterns

### "Skill never triggers"

The description is too narrow or not a description at all. It is not a summary — it is a trigger condition.

**Fix:** Rewrite with explicit "Use when…" clauses and literal user phrases. Test by asking without naming the skill.

### "Skill triggers too often"

The description is too broad or applicable to unrelated tasks. Narrow it. If you have multiple related workflows, split into two focused skills.

**Fix:** Remove general language. Replace "Use when working with code" with "Use when reviewing pull requests for security and performance regressions."

### "Instructions ignored mid-run"

Either SKILL.md is too long (agent stops reading), or steps are buried in narrative. Put the critical checklist at the top. Move theory to separate files.

**Fix:** Lead with step numbers. Move prose to `references/`. Keep main SKILL.md under 500 lines.

### "Too many nested subdirectories"

Deeply nested paths (references/db/v1/schema.md) force the agent to think. Stay flat: `references/db-schema-v1.md`.

**Fix:** Rename to flat structure. Update links in SKILL.md.

### "SKILL.md is 1,500 lines"

This defeats progressive disclosure. The agent pays a high cost for every load.

**Fix:** Identify major sections (schemas, workflows, templates). Move each to a separate file in `references/` or `assets/`. Update SKILL.md to link and instruct the agent when to read each.

## Integration with other tools

### Skills + MCP servers

If your skill invokes external APIs (linear.com, slack.com, datadog.com), document the MCP server setup in a **references/** file and link from SKILL.md.

\`\`\`markdown
## Linking a Jira issue to a sprint

For this step, you need the MCP Jira integration. See \`references/mcp-jira-setup.md\`.
\`\`\`

The skill stays generic; setup docs stay localized. Reusability improves.

### Skills + rules

Cursor and Claude Code also use rules (.mdc files) for always-on policy. Skills are on-demand; rules are always-loaded.

- **Rules:** Coding standards, safety rails, never-delete guardrails
- **Skills:** Deployment checklists, migration runbooks, review procedures

Use both. Rules cost context once per session. Skills cost context only when activated. They scale together.

### Skills + documentation

Your [agent workflow documentation](/blog/document-ai-agent-workflows) explains *why* you have a skill. Your SKILL.md explains *how* to execute it. A brief README in the skill folder explains *where* it lives and *who* maintains it.

\`\`\`markdown
# code-reviewer skill

Checks pull requests for security, performance, and contract issues.
Used in daily code review workflows for the platform team.

Maintained by: Platform team
Last updated: 2026-07-16
\`\`\`

## Practical checklist

- [ ] Description includes both what the skill does and explicit triggers ("Use when…")
- [ ] SKILL.md is numbered steps or clear sections, not narrative
- [ ] Main body is under 500 lines
- [ ] Supplementary files are in flat, one-level-deep folders (references/, scripts/, assets/)
- [ ] Each file name is descriptive (error-codes.md, not data.md)
- [ ] Examples show input and output shape
- [ ] You tested with a real request (not by naming the skill)
- [ ] Related files are explicitly linked from SKILL.md ("See \`references/auth-flow.md\`…")
- [ ] Scripts document prerequisites, inputs, and exit codes

## Before publishing

Walk through one real task with your skill active. Watch the agent traces:

1. Did it load the skill?
2. Did it read the description?
3. Did it follow the steps?
4. Did it read any supplementary files?

Each trace tells you where to tighten language or reorganize. This is your feedback loop. Most published skills went through 2–3 iterations after real-world use.

The skills that survive contact with actual work are the ones worth sharing on [Onie Explore](/app/explore). Your workflow is someone else's starting point.
`.trim(),
  faqs: [
    {
      question: 'How long should SKILL.md be?',
      answer:
        'Anthropic recommends keeping the main SKILL.md body under 500 lines. This keeps the context cost low when the agent loads the skill. Move detailed reference material, templates, and scripts to separate files in references/, assets/, and scripts/ folders and link to them from SKILL.md so the agent loads extras only when needed.',
    },
    {
      question: 'What makes a good description for skill discovery?',
      answer:
        'A good description tells the agent both what the skill does and when to activate it. Use literal trigger phrases like "Use when the user asks to…" or "Triggers on…". Avoid vague language like "Helps with code" or marketing adjectives. Test by asking an agent a realistic request without naming the skill — if it loads, your description is working.',
    },
    {
      question: 'Why do my skills never trigger even though I have them loaded?',
      answer:
        'Almost always the description. It must include specific "Use when" clauses and phrases people actually say. Generic descriptions like "general assistant" will not trigger. Rewrite with concrete trigger phrases, then test by making a request without naming the skill. If it still does not load, check the agent traces to see what it read.',
    },
    {
      question: 'Should I keep helper scripts inside SKILL.md or in separate files?',
      answer:
        'Use a scripts/ subdirectory. Code blocks in SKILL.md cost tokens every time the skill loads. Scripts cost tokens only when executed, not when read. Document what each script does, its inputs, outputs, and exit codes in SKILL.md, then link to it: "See scripts/validate.sh to check prerequisites."',
    },
    {
      question: 'How do I know if my skill should be multiple skills instead of one big skill?',
      answer:
        'If your skill has multiple unrelated trigger phrases or the description is a long list of "or use when", split it. For example, "code-reviewer" and "performance-auditor" are separate skills, not one. Each should have a focused description and a clear procedure. Related workflows can cross-link in relatedSlugs but stay independent.',
    },
    {
      question: 'Can I use nested folders in references/ like references/db/schemas/?',
      answer:
        'Avoid nesting. Use flat, one-level-deep structure: references/db-schemas.md or references/api-schema.md instead. Deeply nested paths make it harder for agents to track file locations, and they increase context overhead. If you have many files, group by topic name (db, api, auth) rather than by hierarchy.',
    },
    {
      question: 'What is the difference between skills and MCP tools?',
      answer:
        'MCP tools are integrations with external services (APIs, databases, code hosts). Skills are workflows that use MCP tools as steps. A skill might say "Step 2: Using the Jira MCP, search for open issues in the sprint" — the MCP tool does the API call, but the skill organizes the entire procedure.',
    },
    {
      question: 'How do I test if my skill is working correctly?',
      answer:
        'Run a real task and observe agent traces. Did the agent load the skill? Did it follow the steps? Did it call supplementary files when needed? Traces show you where the agent drifted or where instructions were unclear. Most published skills went through 2–3 iterations based on real-world traces, not assumptions.',
    },
  ],
}
