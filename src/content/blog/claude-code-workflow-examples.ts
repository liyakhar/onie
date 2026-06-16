import type { BlogPost } from '#/content/blog/types'

export const claudeCodeWorkflowExamplesPost: BlogPost = {
  slug: 'claude-code-workflow-examples',
  title: 'Claude Code workflow examples that scale past one chat',
  description:
    'Real Claude Code workflow patterns — fan-out research, classify-and-act, pipelines — plus when to use workflows vs skills and how to publish yours on Onie.',
  publishedAt: '2026-06-16',
  readingMinutes: 11,
  primaryKeyword: 'claude code workflow examples',
  keywordCluster: [
    'claude code workflow examples',
    'claude code dynamic workflows',
    'multi-agent orchestration',
    'deep-research workflow',
    'when to use workflows vs skills',
  ],
  author: {
    name: 'Sam Okonkwo',
    role: 'Engineering lead · multi-agent harnesses',
    bio: 'Runs migration sweeps and research pipelines with Claude Code workflows. Shares the scripts that survived production on Onie.',
  },
  tldr:
    'Claude Code workflows are JavaScript harnesses that spawn subagents in parallel or sequence — fan-out-and-synthesize, classify-and-act, and pipeline are the three patterns you will reuse most. Use `/deep-research` to see a bundled example, then save your own to `~/.claude/workflows/` or publish the harness on Onie.',
  relatedSlugs: ['how-to-write-claude-code-skills', 'document-ai-agent-workflows'],
  body: `
## What counts as a Claude Code workflow

A **workflow** is an executable script Claude writes (or you save) that orchestrates multiple subagents instead of doing everything in one linear chat. Anthropic calls these [dynamic workflows](https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code): a harness built for one job — codebase audit, migration sweep, cross-checked research.

This is different from a [skill](/blog/how-to-write-claude-code-skills) (on-demand instructions) and different from a single-session prompt. Workflows are for tasks that need **parallelism**, **structured handoffs**, or **reruns** with the same topology.

**Claude Code workflow examples** you can run today without writing code:

- \`/deep-research\` — fans out web research, cross-checks sources, returns a cited report ([docs](https://code.claude.com/docs/en/workflows))
- Ask Claude to "write a workflow for…" or include the keyword \`ultracode\` in your prompt
- Set \`/effort ultracode\` so substantive tasks auto-plan a workflow

## The three primitives (and when to use each)

Most custom workflows compose the same building blocks from the [workflows documentation](https://code.claude.com/docs/en/workflows):

| Primitive | What it does | Example use |
| --- | --- | --- |
| \`agent(prompt, options)\` | Spawn one isolated subagent | Summarize one module, review one file |
| \`parallel(thunks)\` | Run many agents concurrently | Scan 40 directories at once |
| \`pipeline(items, ...stages)\` | Sequential stages per item | Lint → fix → test per package |

Add \`phase(title)\` to group steps in the progress UI so humans can see where a long run is stuck.

## Example 1: Fan-out-and-synthesize (research)

**Problem:** You need a weekly digest from nine sources — release notes, blogs, forums — and one agent times out if you dump everything in one prompt.

**Pattern:** Fan out one agent per source with a strict JSON schema, reduce in plain JavaScript, synthesize with a final agent.

Sketch:

\`\`\`javascript
export const meta = {
  name: 'weekly_digest',
  description: 'Collect Vue ecosystem updates from configured sources',
  phases: [{ title: 'Research' }, { title: 'Curate' }, { title: 'Write' }],
}

const sources = [
  { key: 'releases', prompt: 'List core framework releases this week. Return JSON.' },
  { key: 'blogs', prompt: 'Summarize official blog posts. Return JSON.' },
  // ...
]

phase('Research')
const raw = await parallel(sources.map((s) => () => agent(s.prompt, { schema: itemSchema })))

phase('Curate')
const deduped = dedupeByUrl(raw.flat())

phase('Write')
return await agent(\`Write a markdown digest from: \${JSON.stringify(deduped)}\`)
\`\`\`

This mirrors production newsletter workflows described by practitioners running [fan-out → reduce → synthesize](https://alexop.dev/posts/claude-code-workflows-deterministic-orchestration/) pipelines. The barrier between phases matters: curation should not start until every source agent returns.

## Example 2: Classify-and-act (triage at scale)

**Problem:** Hundreds of files need different handling — tests get one playbook, configs another, docs a third.

**Pattern:** One classification agent per batch (or per path), route to specialized follow-up agents.

1. \`agent("Classify this diff: test | prod | docs")\`
2. Branch on label — run the matching remediation agent
3. Aggregate results into a single PR description

Use this when **homogeneous parallel work** is wrong but **typed parallel work** is right. Do not fan out 200 identical prompts; classify first, then fan out per bucket.

## Example 3: Pipeline (migrate many packages)

**Problem:** Monorepo with 30 packages — each needs the same ordered steps: codemod, typecheck, snapshot tests.

**Pattern:** \`pipeline(packages, codemodStage, typecheckStage, testStage)\` where each stage receives the previous output.

Keep stages **small and verifiable**. If typecheck fails, the next stage should not run. That is the same feedback loop production guides describe for [agentic coding workflows](https://www.truefoundry.com/blog/claude-code-workflow-guide): propose → execute → read feedback → adjust.

## Example 4: Adversarial verification (quality gate)

**Problem:** Generated migrations look plausible but break edge cases.

**Pattern:** Generator agent produces patch → verifier agent attacks it with a checklist → only merge if verifier passes.

Bolt this onto fan-out or pipeline as a final phase. The bundled \`/deep-research\` workflow uses a similar cross-check mindset: sources must agree before claims land in the report.

## Workflows vs skills vs one-shot prompts

| Approach | Best when |
| --- | --- |
| One-shot prompt | Quick, ambiguous exploration |
| Skill | Repeatable playbook with triggers ([SKILL.md](/blog/how-to-write-claude-code-skills)) |
| Workflow | Many agents, structured phases, rerunnable script |
| Workflow + skill | Skill holds templates; workflow references them as sub-steps |

If you rerun the same topology weekly, save the workflow. If you need judgment on when to start, encode that in a skill description and let Claude invoke the workflow from inside the skill.

## How to save, rerun, and share

**Locally:** Save from the workflow menu to \`~/.claude/workflows/\`. Check into dotfiles or a team repo.

**With skills:** Put workflow JS files in a skill folder and reference them from SKILL.md as templates Claude can adapt per run.

**With Onie:** [Document the harness](/blog/document-ai-agent-workflows) — inputs, phases, verification, failure modes — and publish the workflow body plus tool versions. Teammates fork your setup instead of reverse-engineering your terminal history.

Browse field-tagged examples in [Explore](/app/explore) and filter by \`claude-code\` or \`engineering\`.

## Common failure modes

**Unbounded fan-out.** Cap concurrency. Batch items and merge between waves.

**Missing schemas.** Without JSON shapes per agent, reduce steps become fragile string parsing.

**No phase boundaries.** Long runs look hung. Use \`phase()\` and log lines liberally.

**Workflow as god script.** Split into composable workflows; nest one level deep per Claude Code limits.

**Skipping the doc.** A script nobody can run is not a workflow — it is a one-off. Write the minimum workflow doc template alongside the JS.

## Start with a bundled example, then fork

1. Run \`/deep-research\` on a real question in your domain.
2. Open \`/workflows\` and inspect phases while it runs.
3. Ask Claude to write a smaller workflow for your repo (or enable ultracode for one task).
4. Save, rerun on a second input, tighten schemas.
5. Publish the harness on Onie with tags and a link to your saved script shape.

The goal is not the cleverest orchestration — it is the one your team reruns next quarter without you in the room.
`.trim(),
  faqs: [
    {
      question: 'What is a Claude Code workflow?',
      answer:
        'A workflow is a JavaScript harness that orchestrates multiple Claude Code subagents using primitives like agent(), parallel(), and pipeline(). Claude can write workflows on the fly for complex tasks or you can save and rerun them from ~/.claude/workflows/.',
    },
    {
      question: 'How do I run a Claude Code workflow example without writing code?',
      answer:
        'Use the bundled /deep-research command for multi-source research, ask Claude to create a workflow for your task, include the ultracode keyword in your prompt, or set /effort ultracode so Claude auto-plans workflows for substantive work.',
    },
    {
      question: 'What is the fan-out-and-synthesize pattern?',
      answer:
        'Spawn many parallel subagents on smaller slices of work (one per source, directory, or ticket), merge their structured outputs in JavaScript, then run a final synthesis agent on the reduced dataset. It avoids context limits and speeds up large scans.',
    },
    {
      question: 'When should I use a workflow instead of a skill?',
      answer:
        'Use a workflow when you need multiple coordinated agents, parallel execution, or a rerunnable script with phases. Use a skill when you need on-demand instructions and triggers for a repeatable playbook inside a single agent session. They compose: skills can invoke saved workflows.',
    },
    {
      question: 'Where are Claude Code workflows saved?',
      answer:
        'Save workflows from the workflow menu to ~/.claude/workflows/ for local reuse. Teams can check them into a shared repo, bundle them inside skills, or publish documented harnesses on Onie for others to fork.',
    },
    {
      question: 'What is ultracode in Claude Code?',
      answer:
        'Ultracode is a Claude Code effort setting that combines high reasoning effort with automatic workflow orchestration. With it enabled, Claude plans a workflow for substantive tasks instead of waiting for you to explicitly request one.',
    },
  ],
}
