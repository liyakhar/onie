import type { BlogPost } from '#/content/blog/types'

export const claudeCodeDynamicWorkflowsPost: BlogPost = {
  slug: 'claude-code-dynamic-workflows',
  title: 'Claude Code dynamic workflows for multi-agent tasks',
  description:
    'Orchestrate tens of subagents in parallel with Claude Code workflows. Learn primitives, build production patterns, and scale beyond single-session limits.',
  publishedAt: '2026-09-22',
  readingMinutes: 13,
  primaryKeyword: 'claude code dynamic workflows',
  keywordCluster: [
    'claude code dynamic workflows',
    'dynamic workflows ai agents examples',
    'claude code orchestration',
    'multi-agent Claude Code',
    'workflow orchestration patterns',
    'ultracode Claude Code',
    'agent parallel orchestration',
  ],
  author: {
    name: 'Jordan Reyes',
    role: 'Product engineer · agent orchestration',
    bio: 'Ships workflows for code audit, migration, and research at scale. Publishes patterns that survive production on Onie.',
  },
  tldr:
    'Claude Code dynamic workflows are JavaScript harnesses that fan out work to up to 16 parallel subagents. Three primitives—agent(), parallel(), and pipeline()—compose into audit, migration, and research workflows. Turn on `ultracode` to auto-plan workflows, or ask Claude to write one inline. Save reusable workflows to `~/.claude/workflows/` and share them on Onie.',
  relatedSlugs: ['team-workflow-orchestration-ai', 'dynamic-workflow-examples', 'claude-code-workflow-examples'],
  body: `
## What is a dynamic workflow

A dynamic workflow is a JavaScript orchestration script that Claude Code writes and executes in the background. Instead of working linearly in one chat window, the script spawns multiple independent subagents in parallel or in stages, each working on a piece of the task, then synthesizes the results.

Dynamic workflows exist because some tasks are too large for one agent's context window or one conversation turn. Auditing 200 files, migrating a monorepo, cross-checking claims in research, or reviewing a large pull request from multiple angles—these all run faster and more reliably when split across subagents.

**When to reach for a workflow:**

- **Scale past one chat.** More than ~100 files, ~20 steps, or ~50 KB of input.
- **Parallel work.** Different agents checking different angles independently (audit, migration, research verification).
- **Staged processing.** Items flow through lint → fix → test, and you do not want to wait for all lint to finish before starting fix.
- **Reusable orchestration.** You run the same job weekly or monthly and want a codified script, not a repeated prompt.

**What you get:**

- Up to 16 concurrent agents running at once.
- Results held in script variables, not Claude's context—so orchestration scales independently of token limits.
- Automatic progress tracking (phases) so you see where long runs are stuck.
- Structured outputs with JSON Schema so downstream agents receive predictable shapes.

## Three primitives: agent, parallel, pipeline

Dynamic workflows compose three building blocks:

| Primitive | Purpose | Concurrency |
| --- | --- | --- |
| \`agent(prompt, options)\` | Spawn one isolated subagent | Sequential (one at a time) |
| \`parallel([fn, fn, ...])\` | Run many functions concurrently | Up to 16 at once |
| \`pipeline(items, stage1, stage2, ...)\` | Feed output of one stage into the next | Streaming per item |

Add \`phase(title)\` to segment progress in the dashboard so you see where a run is blocked.

### agent(): spawn a subagent

\`\`\`javascript
const result = await agent(
  'Audit this file for security issues. Return JSON.',
  { schema: jsonSchema, label: 'security-audit-main.js' }
)
\`\`\`

Each agent call spawns an independent subagent with the same model, tools, and permissions you set up. The subagent runs in the background; your script waits for the result.

Use \`schema\` to lock the output shape. If the agent returns data that does not match the schema, Claude Code retries automatically. This prevents downstream stages from breaking when an agent returns an unexpected format.

### parallel(): fan out independent work

\`\`\`javascript
phase('Scan all modules')
const results = await parallel([
  () => agent('Audit lib/auth.js for vulnerabilities'),
  () => agent('Audit lib/db.js for vulnerabilities'),
  () => agent('Audit lib/api.js for vulnerabilities'),
])
// results is now [auditAuth, auditDb, auditApi]
\`\`\`

The \`parallel()\` function takes an array of functions that return promises (usually agent calls), runs them concurrently, and waits for all to finish before returning an array of results.

Running 200 file audits in parallel finishes in minutes; serially it would timeout. This is where workflows earn their overhead.

### pipeline(): staged processing per item

\`\`\`javascript
const packages = [
  { name: 'react-ui', path: 'packages/react-ui' },
  { name: 'utils', path: 'packages/utils' },
]

phase('Codemod')
const codemods = await pipeline(
  packages,
  (pkg) => agent(\`Run TypeScript 5.0 migration on \${pkg.path}\`)
)

phase('Type-check')
const checks = await pipeline(
  codemods,
  (result) => agent(\`Run tsc --noEmit on \${result.path}\`)
)

phase('Test')
const tests = await pipeline(
  checks,
  (result) => agent(\`Run Jest on \${result.path}\`)
)
\`\`\`

Pipeline feeds each item through stages sequentially. Item A can be in the test stage while Item B is still in the codemod stage. This overlapping is the advantage over \`parallel()\`—you do not wait for all codemods before starting any type-checks.

The key difference: \`parallel()\` is a barrier (waits for all), \`pipeline()\` is a stream (flows as results arrive).

## Four production patterns

### Pattern 1: Code audit (12-line script)

Scan a codebase for one issue type across all files.

\`\`\`javascript
export const meta = {
  name: 'security_audit',
  description: 'Find hardcoded secrets or unsafe crypto patterns',
  phases: [{ title: 'Audit' }],
}

const files = [
  'src/auth.ts',
  'src/db.ts',
  'src/api.ts',
]

phase('Audit')
const results = await parallel(
  files.map((file) => () => agent(\`Check \${file} for hardcoded secrets. Return JSON: { file, issues }\`, { schema: issueSchema }))
)

return results.filter((r) => r.issues.length > 0)
\`\`\`

A single agent cannot hold all files in context at once. Parallel audits finish faster and do not timeout. Save this as \`~/.claude/workflows/security-audit.js\` and run it weekly.

### Pattern 2: Migration pipeline

Migrate files through ordered stages: codemod, type-check, tests.

\`\`\`javascript
export const meta = {
  name: 'upgrade_react_19',
  description: 'Migrate React 18 class components to React 19 functions',
  phases: [
    { title: 'Codemod' },
    { title: 'Type-check' },
    { title: 'Snapshot tests' },
  ],
}

const files = await agent('List all class components under src/components', { schema: filesSchema })

phase('Codemod')
const codemods = await pipeline(
  files,
  (f) => agent(\`Port \${f} from React class to function with hooks. Return the new code.\`)
)

phase('Type-check')
const typeChecked = await pipeline(
  codemods,
  (result) => agent(\`Run TypeScript on the migrated code. Warn on any errors.\`)
)

phase('Snapshot tests')
const final = await pipeline(
  typeChecked,
  (result) => agent(\`Run Jest --updateSnapshot on the migrated component.\`)
)

return final
\`\`\`

Each file flows through codemod, then type-check, then snapshot. File A does not block File B from starting codemod.

### Pattern 3: Adversarial verification (research)

Fact-check a claim by having one agent verify what another found.

\`\`\`javascript
export const meta = {
  name: 'fact_check',
  description: 'Cross-check research claims with adversarial agents',
  phases: [
    { title: 'Research' },
    { title: 'Verify' },
  ],
}

const claims = await agent('List the 5 main claims in this transcript', { schema: claimsSchema })

phase('Research')
const sources = await parallel(
  claims.map((claim) => () => agent(\`Find credible sources for: "\${claim.text}"\`))
)

phase('Verify')
const verified = await parallel(
  sources.map((result) => () => agent(\`Evaluate these sources. Is the claim true, false, or uncertain?\`, { schema: verifySchema }))
)

return {
  claims: claims.map((c, i) => ({ ...c, verdict: verified[i].verdict })),
}
\`\`\`

One agent researches, a second agent (with the research) evaluates. This pattern catches overlooked nuance.

### Pattern 4: Budget-aware research loop

Keep searching until you have enough data, then stop.

\`\`\`javascript
export const meta = {
  name: 'research_until_ready',
  description: 'Research a topic with loop-until-converged',
  phases: [
    { title: 'Search' },
    { title: 'Deduplicate' },
    { title: 'Verify' },
  ],
}

let sources = []
let round = 0

while (sources.length < 15 && round < 5) {
  phase(\`Search (round \${round + 1})\`)
  const newSources = await parallel([
    () => agent('Search for <topic> on Reddit'),
    () => agent('Search for <topic> on Product Hunt'),
    () => agent('Search for <topic> on official docs'),
  ])
  sources = sources.concat(newSources.flat())
  
  phase(\`Deduplicate (round \${round + 1})\`)
  sources = await agent(\`Deduplicate by URL. Remove near-duplicates.\`, { schema: sourceSchema })
  
  round++
}

phase('Final verify')
const final = await parallel(
  sources.map((s) => () => agent(\`Is this source credible?\`, { schema: credibilitySchema }))
)

return sources.filter((_, i) => final[i].credible)
\`\`\`

Loops let you stop when data converges, not when a timeout fires. Budget your agents wisely: this pattern can spin up to 100 agents across rounds.

## Running a workflow

### Option 1: Ask Claude to write one

In Claude Code, ask naturally:

\`\`\`
Create a workflow that audits all 200 files in src/ for hardcoded credentials. I want the results in a CSV.
\`\`\`

Claude will write a JavaScript harness, execute it in the background, and hand back the results.

### Option 2: Enable ultracode mode

Set \`/effort ultracode\` in your Claude Code session. This turns on auto-planning: Claude decides when a task is big enough to warrant a workflow and writes one without you asking.

### Option 3: Use a built-in workflow

Run \`/deep-research <question>\` to fan out research across many sources, cross-check claims, and synthesize a report. This workflow lives inside Claude Code as a template.

## Saving and sharing workflows

Once you have a workflow you like:

1. Run it in Claude Code and confirm the output is what you need.
2. In the workflow panel, press \`s\` to save it.
3. It saves to \`~/.claude/workflows/\` (you only) or \`.claude/workflows/\` (team, git-shared).
4. From then on, you can invoke it as a command in any Claude Code session.

To share workflows with practitioners: save it to \`.claude/workflows/\`, commit to your repo, and publish the harness + walkthrough on Onie. Describe the problem it solves, walk through the code, and explain when you reach for it in production.

## Constraints and gotchas

**Concurrency cap:** Up to 16 agents at once. If your script tries to spawn 50 in parallel, you get rate-limited.

**Total agent cap:** 1,000 agents per run. Running 200 files × 5 checks × 4 retry loops = 4,000 agents exceeds this; cap your loops or reduce file count.

**No user input mid-run:** A workflow cannot pause and ask you a question. For approval gates, run phases as separate workflows.

**Script has no filesystem access.** The script orchestrates; the agents get the tools. Do not try \`fs.readFile()\` in the script itself. Agent calls have filesystem access if you enable it.

**No streaming output from agents.** Results are whole objects, not streams.

**Token cost is real.** A 50-agent run costs more than a single-agent chat on the same task. Profile costs on small batches first.

## When to use workflows vs skills

Workflows and [skills](/blog/how-to-write-claude-code-skills) are different:

| Aspect | Skills | Workflows |
| --- | --- | --- |
| **What it is** | On-demand instructions | Orchestration scripts |
| **When loaded** | You invoke with \`/skill-name\` | Auto-triggered or explicit request |
| **Parallelism** | One conversation | 16 concurrent agents |
| **Token usage** | Lightweight | Higher (50–200+ agents) |
| **Reuse** | Team-shared instructions | Repeatable scripts saved to disk |

Use a skill when you want to teach Claude a technique or process it applies once. Use a workflow when you need to run the same multi-agent job repeatedly at scale.

## Sharing workflows on Onie

Dynamic workflows are the harnesses behind production agent work. If your team uses one weekly—auditing logs, migrating code, fact-checking reports—publish it on Onie:

1. Save the workflow to \`.claude/workflows/script-name.js\`.
2. Write a brief post explaining:
   - The problem it solves
   - The task breakdown (fan-out, stages, etc.)
   - Real metrics (time before vs after, token cost, agent count)
   - How other teams can adapt it
3. Link to the workflow repo or share the script directly.

Other practitioners will fork it, adapt it, and share their own improvements on Onie. That is how workflows get better.

[Explore published workflows](/app/explore) or [publish your own](/about).
`.trim(),
  faqs: [
    {
      question: 'What is the difference between a workflow and a skill in Claude Code?',
      answer:
        'A skill is an on-demand instruction set you invoke with `/skill-name`—useful for teaching Claude a technique. A workflow is a JavaScript orchestration script that spawns multiple parallel subagents—useful for large, repetitive jobs. Skills run in one conversation; workflows run 16+ agents in the background. Use skills for how-to guidance; use workflows for scale.',
    },
    {
      question: 'How many agents can a workflow spawn?',
      answer:
        'Up to 16 concurrent agents at any one time. However, a single run caps at 1,000 total agents across all stages and retries. If you audit 200 files with 5 checks each, that is 1,000 agents—right at the limit. Keep loops tight and batch sizes reasonable.',
    },
    {
      question: 'Can a workflow pause and ask me a question?',
      answer:
        'No. Workflows run end-to-end without mid-run user input. If you need approval gates between phases, design each phase as a separate workflow you can inspect and trigger manually.',
    },
    {
      question: 'What is `ultracode` and why would I turn it on?',
      answer:
        '`ultracode` is a Claude Code setting that combines `xhigh` reasoning with automatic workflow planning. Turn it on with `/effort ultracode` to let Claude decide when a task is big enough to warrant a workflow. You no longer need to ask; Claude auto-generates the harness. Useful for exploratory work where you do not know upfront if a workflow makes sense.',
    },
    {
      question: 'How do I save a workflow so I can reuse it?',
      answer:
        'After a successful run, select it in the `/workflows` panel and press `s`. It saves to `~/.claude/workflows/` (personal) or `.claude/workflows/` (team, git-tracked). From then on, invoke it as a command in any Claude Code session. Share it by committing to your repo and publishing a walkthrough on Onie.',
    },
    {
      question: 'Can I use TypeScript or Python instead of JavaScript?',
      answer:
        'Workflows are JavaScript, but you can call Claude Code from Python or TypeScript via the Agent SDK. The orchestration harness itself is always JavaScript; the agents themselves run whatever language you configure.',
    },
    {
      question: 'How much more expensive is a workflow than a single agent chat?',
      answer:
        'A 50-agent audit costs more than a single-agent scan, but finishes in minutes instead of timing out. Profile on a small batch first (10 files, 3 checks) to see token cost, then extrapolate. Most teams find the time savings worth the token cost.',
    },
    {
      question: 'Where can I see examples of production workflows other teams use?',
      answer:
        'Browse [Onie](/app/explore) for published workflows and harnesses. You can fork, adapt, and share your own improvements. The community workflows section grows as practitioners publish their patterns.',
    },
  ],
}
