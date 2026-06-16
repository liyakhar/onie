import type { BlogPost } from '#/content/blog/types'

export const documentWorkflowsPost: BlogPost = {
  slug: 'document-ai-agent-workflows',
  title: 'How to document AI agent workflows others can reuse',
  description:
    'A practical template for documenting agent workflows — prompts, skills, tools, inputs, outputs, and failure modes — so teammates can fork and ship faster.',
  publishedAt: '2026-06-10',
  updatedAt: '2026-06-16',
  readingMinutes: 10,
  primaryKeyword: 'how to document ai agent workflows',
  keywordCluster: [
    'how to document ai agent workflows',
    'agent workflow template',
    'share ai prompts',
    'agent harness documentation',
    'workflow observability',
  ],
  author: {
    name: 'Alex Rivera',
    role: 'SaaS builder · agent harness maintainer',
    bio: 'Ships product loops with Cursor and Claude Code. Documents every harness before it becomes tribal knowledge.',
  },
  tldr:
    'Document agent workflows like small services: purpose, inputs, tool boundaries, numbered steps, verification, and known failure modes. Keep instructions self-contained, version the harness, and publish the whole setup — not just the prompt paragraph.',
  relatedSlugs: ['how-to-write-claude-code-skills', 'claude-code-workflow-examples'],
  body: `
## Why most agent docs fail

Most teams share a prompt snippet in Slack. Two weeks later nobody remembers which model it was tuned for, which files to attach, or what "done" looked like. The model changed, the repo moved, and the workflow died in a pinned message.

**How to document AI agent workflows** properly means capturing the harness — prompts, skills, tools, context files, and verification — in one place a stranger could run on Monday morning.

## The minimum viable workflow doc

Use this skeleton for every workflow you expect to repeat:

### 1. Purpose (one paragraph)

What outcome does this workflow produce? Who is it for? What is explicitly out of scope?

Example: "Turns raw UX interview transcripts into affinity clusters and a one-page synthesis. For researchers, not for generative personas or survey quant."

### 2. Inputs and prerequisites

List every input with format expectations:

- Files (\`.md\`, \`.csv\`, repo paths)
- Environment (API keys, MCP servers, database access)
- Human decisions required before start

If an input is missing, the doc should say **stop** — not guess.

### 3. Tool and agent boundaries

Draw a simple boundary table:

| Component | Role |
| --- | --- |
| Main agent | Orchestrates steps, writes final artifact |
| Explore / sub-agent | Read-only repo or web search |
| Scripts | Deterministic transforms (parse CSV, lint output) |
| Skills | Loaded for specialized sub-tasks |

AWS's agentic AI guidance calls this **decoupling logic from authoring** — the workflow spec should survive a runtime swap. See [Agentic AI Lens — document agents as production software](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html).

### 4. Numbered steps with verification

Each step needs:

1. **Action** — imperative, one verb per step where possible.
2. **Output** — file name, section heading, or schema.
3. **Check** — how a human or script confirms success before the next step.

Bad: "Analyze the data."
Good: "Cluster quotes by theme into \`themes.md\`. Check: at least 5 themes, each with 3+ quotes and a one-line insight."

### 5. Output contract

Define the deliverable shape: markdown sections, JSON schema, PR description template. Link an example of a **good** final output and a **rejected** output.

### 6. Failure modes and rollback

Document what usually breaks:

- Context overflow → summarize in step 2, link raw data instead of inlining.
- Tool hallucination → require citations to source line numbers.
- Partial writes → use temp files, merge only after verification.

## A template you can copy

\`\`\`markdown
# Workflow: [name]

## Purpose
[One paragraph]

## Inputs
- [ ] Input A (format)
- [ ] Input B (format)

## Tools
- Agent: [model / profile]
- Skills: [list]
- MCP / APIs: [list]

## Steps
1. [Action] → Output: [artifact] → Verify: [check]
2. ...

## Output contract
[Schema or section list]

## Failure modes
- [Symptom] → [Fix]

## Version
- v1.0 — [date] — [what changed]
\`\`\`

Keep the logic in this doc or in a linked SKILL.md — not split across three Notion pages and a verbal tradition.

## Observability: design vs runtime

Production agent systems compare **runtime traces** to design specs to catch drift. You do not need a full observability stack on day one — but you do need:

- A changelog on the workflow doc when prompts or tools change.
- A note on which model version you last validated against.
- Example runs stored next to the doc (redacted if needed).

When something fails in the wild, update the failure modes section. That is your postmortem.

## What to publish publicly vs keep internal

Publish on [Onie](/app/explore) when:

- The workflow is not tied to secret data or unreleased product names.
- Tools and skills are named so others can reproduce the shape.
- You include enough context that a practitioner in your field could adapt it.

Keep internal when credentials, customer data, or unreleased strategy are embedded in prompts. You can still publish a **redacted** variant with placeholder paths.

## Internal links worth adding

Cross-link related workflows in your doc body — "After synthesis, run the [design QA checklist](/app/explore)" — so readers stay in a graph of setups, not isolated prompts.

On Onie, fork someone else's workflow and note what you changed. Forks are documentation of adaptation.

## Skills + workflow docs work together

If a step repeats inside many workflows, extract it to a [Claude Code skill](/blog/how-to-write-claude-code-skills). The workflow doc references the skill; the skill holds the micro-playbook.

| Layer | Holds |
| --- | --- |
| Workflow doc | End-to-end harness, inputs, verification |
| Skill | Repeatable sub-task with triggers |
| Rules | Repo-wide conventions |

## When documentation is enough without a new tool

You do not need a custom platform to document agent workflows. You need a consistent template, a habit of versioning, and a place teammates actually look.

Onie is that place for practitioners who want public, field-tagged workflows — but the template above works in any repo README or internal wiki until you are ready to publish.

## Start with one workflow you run weekly

Pick the loop you already run every Monday. Document it with the skeleton above. Run it once from the doc alone — if you had to explain verbally, the doc is not done yet.

Then publish it, tag your discipline and stack, and let the next person fork instead of reinventing.
`.trim(),
  faqs: [
    {
      question: 'What should an agent workflow document include?',
      answer:
        'At minimum: purpose, inputs, tool boundaries, numbered steps with verification checks, output contract, failure modes, and version history. Optional but valuable: example good output, redacted run logs, and links to skills or scripts the workflow depends on.',
    },
    {
      question: 'How is documenting an agent workflow different from saving a prompt?',
      answer:
        'A prompt is one instruction string. A workflow document covers the full harness: context files, skills, tools, step order, verification, and what to do when steps fail. Prompts are ingredients; workflow docs are recipes with quality checks.',
    },
    {
      question: 'Should workflow instructions live in separate files or one doc?',
      answer:
        'Keep the orchestration narrative self-contained in one instructions field or markdown file. Link out to skills, schemas, and scripts rather than splitting behavior across artifacts the agent cannot see unless explicitly loaded.',
    },
    {
      question: 'How do I version agent workflows?',
      answer:
        'Add a version section with date and changelog. Note the model or tool versions you validated against. When prompts change, bump the version and record what broke or improved — same discipline as API changelogs.',
    },
    {
      question: 'What is workflow drift in agent systems?',
      answer:
        'Drift happens when runtime behavior diverges from the documented design — new tools added informally, prompts edited in chat but not in the repo, or model updates changing output shape. Comparing traces to your spec catches drift early.',
    },
    {
      question: 'Where should teams publish reusable agent workflows?',
      answer:
        'Internal wikis work for private harnesses. For practitioners who want field-tagged, forkable setups, publish on Onie with discipline and tool tags so others can search, follow, and adapt your workflow.',
    },
  ],
}
