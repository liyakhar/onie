import type { BlogPost } from '#/content/blog/types'

export const dynamicWorkflowExamplesPost: BlogPost = {
  slug: 'dynamic-workflow-examples',
  title: 'Real-world dynamic workflow examples for AI agents',
  description:
    'Learn practical patterns for multi-agent workflows: fact-checking, code audits, content migrations, and research synthesis with orchestration code examples.',
  publishedAt: '2026-09-23',
  readingMinutes: 12,
  primaryKeyword: 'dynamic workflows ai agents examples',
  keywordCluster: [
    'dynamic workflows ai agents examples',
    'ai agent workflow examples',
    'multi-agent workflow patterns',
    'workflow orchestration examples',
    'agent orchestration patterns',
    'parallel agent workflows',
    'agent workflow use cases',
  ],
  author: {
    name: 'Jordan Reyes',
    role: 'Product engineer · agent orchestration',
    bio: 'Runs production workflows for audits, migrations, and research. Shares patterns on Onie that survive real constraints.',
  },
  tldr:
    'Dynamic workflows excel at tasks too large for one agent: fact-checking with adversarial verification, code audits across hundreds of files, large content migrations, and multi-phase research. Each pattern uses fan-out to parallelize independent work, then synthesis to merge results. Control when orchestration scales beyond your context window.',
  relatedSlugs: ['claude-code-dynamic-workflows', 'claude-code-workflow-examples', 'agent-workflow-template'],
  body: `
## When a single agent breaks

A single agent works well for isolated tasks: search a query, analyze a document, write a function. But real work often has structure that a single context window cannot manage.

You need dynamic workflows when:

- **Scale exceeds one context.** Auditing 300 files, analyzing 50 research papers, cross-checking 100 independent claims.
- **Verification must be enforced.** A lazy agent might skip hard checks or declare victory too early. Parallel verification agents apply rules independently.
- **Parallelism matters more than conversation flow.** 10 agents auditing 10 files at once is faster than one agent doing them sequentially.
- **The orchestration is worth keeping.** Migrations, audits, and research workflows run again; codified scripts beat repeated prompts.

Dynamic workflows move the plan out of the agent's context and into a script. Claude writes the script once, the runtime executes it, and you can read it, version it, and rerun it.

## Pattern 1: Fact-checking with adversarial verification

Claim verification at scale has a signature problem: the same agent that found a claim is asked to verify it. This breeds self-preferential bias. A claim the agent already selected feels persuasive to the agent that wrote it.

The fix is isolation. Separate agents find claims and verify them. Add a skeptic agent that actively tries to refute confirmations.

**The workflow shape:**

1. **Extractor:** Read the document, identify all factual claims that can be checked.
2. **Parallel verifiers:** Each takes one claim and searches for evidence.
3. **Parallel skeptics:** Each re-reads the sources their paired verifier cited, trying to find contradictions.
4. **Synthesizer:** Collect all verdicts and produce a final go/no-go report.

**When to use it:**

- Policy documents before publish
- Investor pitches and financial claims
- Research reports with cited sources
- Customer-facing blog posts with numbers

**Cost:** Many parallel agents means high token usage. Worth it for high-stakes claims where errors are costly.

### Code shape

\`\`\`javascript
// Extractor phase
const claims = await agent('Extract all factual claims from this document:\\n\\n<document>');

// Parallel verification
phase('Verify claims');
const verificationResults = await parallel(
  claims.map((claim) =>
    () => agent('Verify this claim: ' + claim + '\\nReturn verdict and sources.')
  )
);

// Parallel skepticism
phase('Skeptic review');
const skepticResults = await parallel(
  verificationResults.map((result) =>
    () => agent('Challenge these sources. Are they actually cited correctly?\\n' + result.sources)
  )
);

// Synthesis
const finalReport = await agent(
  'Compile verdicts into a report. Update any verdict if the skeptic found contradictions.\\n' + JSON.stringify(skepticResults)
);
\`\`\`

## Pattern 2: Code audit across a codebase

Auditing a large codebase sequentially is slow. An auditor might also fatigue and miss issues in files reviewed late.

Parallel agents each audit a different file or module. A synthesis agent identifies cross-file issues (unused imports that span modules, repeated patterns, architecture violations).

**The workflow shape:**

1. **Lister:** Walk the codebase tree, partition files into audit targets.
2. **Parallel auditors:** Each agent audits its assigned files for security, performance, and style.
3. **Synthesis:** Detect patterns, cross-module issues, and prioritize findings.

**When to use it:**

- Security baseline before deployment
- Post-acquisition code review
- Refactoring preparation for legacy codebases
- Migrating frameworks or languages

**Token cost:** One agent per file for small files, one agent per module for large codebases. Mitigate with clustering: assign 5–10 related files to one agent.

### Code shape

\`\`\`javascript
// List files
const files = await agent(
  'Walk this directory tree and return a JSON array of all .ts and .tsx files.\\nPartition into groups of 5 related files.\\n<codebase>',
  { schema: fileGroupSchema }
);

// Parallel audit
phase('Audit files');
const auditResults = await parallel(
  files.map((group) =>
    () => agent('Security audit these files for injection, authentication, crypto misuse.\\nReturn structured findings.\\n' + group.content, { schema: auditSchema })
  )
);

// Synthesis
const crossModuleIssues = await agent(
  'Detect patterns across modules: repeated antipatterns, dependency violations, architectural issues.\\n' + JSON.stringify(auditResults),
  { schema: synthesisSchema }
);
\`\`\`

## Pattern 3: Large content migration

Migrating content from one format or platform to another is error-prone if done by one agent that gets tired, or by scripted find-replace that misses context.

Parallel agents each migrate a different section. A verification stage checks that no data was lost and structure matches.

**The workflow shape:**

1. **Parser:** Break large content into logical chunks (chapters, sections, records).
2. **Parallel migrators:** Each transforms its chunk to the target format.
3. **Verifier:** Spot-check results for completeness and correctness.
4. **Assembler:** Merge migrated chunks, handle cross-references, produce final output.

**When to use it:**

- Markdown to structured HTML
- Database schema migrations with transformation logic
- Large documentation rewrites (API docs to OpenAPI spec)
- Monorepo file reorganization

**Skill to preserve quality:** Have migrators return a schema with the original + transformed content side by side, so verifiers can compare.

### Code shape

\`\`\`javascript
// Parse and partition
const chunks = await agent(
  'Break this large markdown document into logical sections (chapters, subsections).\\nReturn as JSON with section title and content.\\n<document>',
  { schema: chunkSchema }
);

// Parallel migration
phase('Migrate sections');
const migratedChunks = await parallel(
  chunks.map((chunk) =>
    () => agent(
      'Migrate this section from Markdown to structured HTML.\\nReturn {original, transformed}.\\n' + JSON.stringify(chunk),
      { schema: migrationSchema }
    )
  )
);

// Verification
phase('Verify migration');
const verified = await parallel(
  migratedChunks.map((result) =>
    () => agent('Did this migration lose any content? Are there formatting issues?\\n' + JSON.stringify(result))
  )
);

// Assembly
const finalDocument = await agent(
  'Assemble all migrated sections into one document. Fix any broken cross-references. Return valid HTML.\\n' + JSON.stringify(verified)
);
\`\`\`

## Pattern 4: Multi-phase research synthesis

Research tasks often need staged investigation: broad search, detailed extraction, cross-study validation, then synthesis.

Parallel agents handle each phase independently, preventing early agents from biasing later ones.

**The workflow shape:**

1. **Searchers:** Multiple agents search for studies using different queries or keywords.
2. **Extractors:** Parallel agents read papers and extract structured findings (methodology, sample size, results, limitations).
3. **Validators:** Independent agents cross-check findings for contradictions or methodology issues.
4. **Synthesizer:** Compile evidence, highlight agreements and disagreements, produce final report.

**When to use it:**

- Literature reviews and evidence syntheses
- Market research across multiple sources
- Competitive landscape analysis
- Feasibility studies with empirical grounding

**Quality lever:** Have validators focus on contradictions and methodology: two studies reporting opposite findings often differ in rigor or scope.

### Code shape

\`\`\`javascript
// Search phase
phase('Search studies');
const searchQueries = ['AI coding assistants productivity', 'developer tools empirical study', 'LLM developer performance'];
const papers = await parallel(
  searchQueries.map((query) =>
    () => agent('Search for peer-reviewed studies on: ' + query + '\\nReturn titles, authors, URLs.')
  )
);

// Extraction phase
phase('Extract findings');
const extracted = await parallel(
  papers.map((paper) =>
    () => agent(
      'Read this paper. Extract: methodology, sample size, primary findings, effect size, limitations.\\n' + paper.url,
      { schema: extractionSchema }
    )
  )
);

// Validation phase
phase('Cross-check findings');
const validated = await parallel(
  extracted.map((result) =>
    () => agent(
      'Cross-check this finding against the others. Flag contradictions, methodology issues, scope mismatches.\\n' +
      JSON.stringify(result) +
      '\\nOther studies:\\n' +
      JSON.stringify(extracted)
    )
  )
);

// Synthesis
const report = await agent(
  'Synthesize these findings. Where do they agree? Where do methodologies differ? What is the overall evidence?\\n' +
  JSON.stringify(validated),
  { schema: reportSchema }
);
\`\`\`

## Cost and constraint management

Dynamic workflows are powerful but token-intensive. Each additional agent adds cost.

**Reduce tokens:**

- Assign multiple files per agent instead of one file per agent.
- Use cheaper models for mechanical tasks (extraction, formatting).
- Move expensive reasoning to synthesis, not extraction.
- Provide schema constraints so agents do not generate filler.

**Parallelism limits:**

- Runtime supports up to 16 concurrent agents.
- If you need 50 parallel jobs, the runtime queues 50 and runs 16 at a time.
- Workflows cap at 1,000 total agents in one run; tasks with more work need partitioning or staging.

**Choose when orchestration is worth it.**

One agent auditing 300 files sequentially costs more than you think: token bloat from repeated context, missed issues from fatigue. 30 agents auditing in parallel costs more in absolute tokens but finishes faster and with higher quality. Run the math on your task.

## Starting simple, scaling up

Start by asking Claude directly: "Audit these 20 files for security issues." Most tasks fit in one context at small scale.

When you hit limits—the agent is tired, files accumulate, you want to rerun the logic monthly—ask Claude to write a workflow:

\`\`\`
I need to audit our codebase for security issues. We have ~300 files. Write a dynamic workflow that audits files in parallel, checks for cross-module patterns, and produces a report.
\`\`\`

Claude will write the JavaScript. You review it, approve it, and it runs. If you like the pattern, save it to \`~/.claude/workflows/\` and reuse it.

## Workflow > conversation for orchestration

The key insight: once orchestration matters—parallelism, multiple phases, verification—the script becomes the source of truth, not the conversation. You can read it, version it, share it, and run it without explaining it each time.

That is why dynamic workflows sit at the top of the coordination ladder. They are worth it for tasks where the orchestration itself deserves to be code.
`.trim(),
  faqs: [
    {
      question: 'When should I use a dynamic workflow instead of asking Claude directly?',
      answer:
        'Use workflows when a task is too large for one context window (~100 KB of input), needs parallel verification, or is run repeatedly. For a one-off task under ~50 KB, a single agent is faster and cheaper. For recurring audits, migrations, or research, a workflow pays for itself in the second run.',
    },
    {
      question: 'How many agents can a workflow run in parallel?',
      answer:
        'The runtime supports up to 16 concurrent agents. If you need more parallel work, the runtime queues jobs until a slot frees. The entire workflow caps at 1,000 agents in one run. For tasks needing more, partition the work or run multiple workflows in sequence.',
    },
    {
      question: 'How do I prevent agents in a workflow from influencing each other?',
      answer:
        'Keep agents isolated: give each one a specific objective, limited context, and no visibility into other agents\' work until synthesis. Use the `parallel()` primitive to run them truly independently. Bring results together only in a dedicated synthesis stage, where one agent can weigh contradictions and form conclusions.',
    },
    {
      question: 'What is the typical token cost of a dynamic workflow?',
      answer:
        'Token cost scales with the number of agents and the size of their prompts. A 10-agent parallel audit of 100 files might use 2–4x the tokens of one sequential audit, but finish in 1/10 the time. For high-stakes tasks, the faster feedback and higher quality justify the cost. For low-stakes work, stay with a single agent.',
    },
    {
      question: 'Can I use different AI models for different agents in a workflow?',
      answer:
        'Yes. By default, all agents use the model you set in your session. But you can route specific stages to cheaper models for mechanical work (extraction, formatting) and stronger models for reasoning. Use environment variables or agent config to override per-stage.',
    },
    {
      question: 'How do I reuse a workflow I wrote?',
      answer:
        'Save the JavaScript file to ~/.claude/workflows/ in your Claude Code directory. Give it a descriptive name. Claude will discover it and suggest it for relevant tasks. You can also share workflows on Onie as part of a skill or example library.',
    },
    {
      question: 'What happens if one agent in a workflow fails?',
      answer:
        'The workflow pauses and surfaces the error. You can inspect the failure, fix the prompt or input, and resume from where it stopped. The runtime preserves state across resumptions, so you do not start over.',
    },
    {
      question: 'How do I debug a workflow?',
      answer:
        'Use the Claude Code dashboard to view the generated JavaScript before approval. Inspect the phases, branching logic, and agent prompts. Use the View raw script option. Once running, the dashboard shows progress per phase. If a stage fails, you see which agent errored and why.',
    },
  ],
}
