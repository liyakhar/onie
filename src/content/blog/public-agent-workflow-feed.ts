import type { BlogPost } from '#/content/blog/types'

export const publicAgentWorkflowFeedPost: BlogPost = {
  slug: 'public-agent-workflow-feed',
  title: 'Publish agent workflows to the public feed',
  description:
    'Share Onie workflows publicly so other builders can discover, clone, and extend them. How to make workflows discoverable, versioned, and standards-compliant.',
  publishedAt: '2026-08-02',
  readingMinutes: 7,
  primaryKeyword: 'public agent workflow feed',
  keywordCluster: [
    'public agent workflow feed',
    'share agent workflows',
    'agent workflow marketplace',
    'agent workflow discovery',
    'publish workflows openly',
    'workflow feed infrastructure',
    'agent workflow standards',
    'workflow versioning and schema drift',
  ],
  author: {
    name: 'Morgan Reeves',
    role: 'Builder · Agent infrastructure',
    bio: 'Helps teams ship agent workflows that scale. Focused on making workflows discoverable and portable across teams and tools.',
  },
  tldr:
    'The agent ecosystem needs a public discovery layer. Onie workflows published to a public feed (agent-feed protocol, workflow registries, or shared repositories) become visible to other builders, searchable, and versionable. Publishing workflows publicly requires backward-compatible versioning, clear entry points, and honest deprecation notices so downstream agents do not break silently when your API changes.',
  relatedSlugs: [
    'document-ai-agent-workflows',
    'share-claude-code-skills-with-team',
    'agent-workflow-template',
  ],
  body: `
## Why publish workflows publicly

Agent workflows live in private codebases today. Your team builds a useful automation—a research pipeline, a data processing workflow, a testing harness—and it stays local. Other builders reinvent the same patterns.

Public workflows change this. When you publish an Onie workflow:

- **Other builders discover it** via search, feeds, or registries
- **Teams adopt it** and customize it for their own work
- **Patterns surface** as more people share. You see what works, what does not, what the community standardizes
- **Tools improve** because there is public data about what builders do with workflows

The agent ecosystem is young. Most of the value comes from shared patterns, not guarded playbooks. Onie sits at this intersection—a public workspace where builders publish, discover, and collaborate on workflows.

## The public feed layer

Several infrastructure layers are emerging to standardize how workflows are announced and discovered:

### agent-feed protocol

The \`agent-feed\` protocol defines an append-only, signed announcement layer at \`/.well-known/agent-feed.xml\`. Services (APIs, tools, workflow registries) publish schema changes, endpoint deprecations, and canonical moves so downstream agents detect breaking changes before they break silently.

If your Onie workflow depends on an external API or MCP service, that service can publish an agent-feed to tell your agent when something changes. Your workflow subscribes to the feed in CI and fails before deployment if the API has shifted.

### Workflow registries and marketplaces

Emerging registries catalog publicly available workflows:

- MCP server catalogs (hundreds of servers indexed by capability)
- Agent workflow marketplaces (GitHub-based, npm-style, or bespoke)
- Onie's own registry (searchable, tagged, versionable)

Registries let builders search by intent ("I need data processing"), language ("Python agent workflows"), or tooling ("Cursor + Claude Code").

### Social feeds for agents

Tools like daige-st/agentfeed create social-style dashboards where agents post updates and humans trigger them via mentions or feedback. Builders publish workflow outputs publicly, creating a feed where teams collaborate asynchronously.

## Publishing your Onie workflow publicly

### Step 1: Prepare your workflow for public consumption

Before publishing, ensure:

- **Entry point is clear.** What does the workflow do in one sentence? How do builders invoke it (CLI command, MCP tool, direct import)?
- **Dependencies are explicit.** What tools, APIs, or data does it need? Document any secrets or config required.
- **Success criteria are testable.** What does a good run look like? Provide example inputs and expected outputs.

Example:

\`\`\`yaml
workflow: data-pipeline-summarizer
description: "Synthesize CSV data, categorize rows, generate a summary report"
entry: "npm run summarize -- input.csv"
dependencies:
  - Claude API (key: ANTHROPIC_API_KEY)
  - Node.js 18+
example_input: "data/sales.csv"
example_output: "reports/summary.md"
\`\`\`

### Step 2: Version your workflow

Workflows evolve. Use semantic versioning to signal compatibility:

- **v1.0** — First stable release
- **v1.1** — Bug fixes, backward compatible
- **v2.0** — Breaking changes (new required field, API change, output format shift)

When you publish, tag releases. Builders who depend on your workflow pin to a specific version:

\`\`\`bash
npx onie-cli clone workflow/data-pipeline-summarizer@1.0
\`\`\`

### Step 3: Document the contract

Write one page that covers:

- **What it does.** Problem it solves, target user.
- **How to run it.** Step-by-step: clone, configure, invoke, verify.
- **Inputs and outputs.** Schema, examples, validation rules.
- **Failure modes.** What can go wrong? How to debug?
- **Deprecation policy.** If you plan to discontinue this workflow, give 6–12 weeks notice.

Onie renders this as a workflow card on the public feed. Other builders read this before adopting.

### Step 4: Publish to a registry

Push your workflow to one or more of:

- **Onie's public registry** — \`npx onie-cli publish --public\`
- **GitHub** — Tag releases, add to awesome-onie-workflows
- **agent-feed** — If your workflow publishes schema or endpoints, sign with did:web and publish at /.well-known/agent-feed.xml
- **npm** — Package as \`@your-org/workflow-name\` for programmatic install

Each channel reaches different builders. Onie's registry surfaces workflows in the UI. GitHub reaches developers who search there. npm reaches node-based tool chains.

### Step 5: Announce and maintain

Publish a post on Onie:

- Link to the registry entry
- Explain the problem it solves (in 1–2 paragraphs)
- Show a quick example (one successful run)
- Invite feedback in comments

Maintenance is ongoing:

- Pin your workflow to a specific tool/API version in documentation
- When you update, publish a new version and announce breaking changes
- Monitor issues and bug reports; patch quickly for production workflows

## Versioning and breaking changes

The key to a thriving public workflow ecosystem is honest versioning. Builders trust your workflow because they know what to expect when they upgrade.

### Backward compatible (v1.1 → v1.2)

- Bug fix in an existing step
- New optional parameter
- Performance improvement
- Better error messages

No changes to the published API or contract. Builders update safely.

### Breaking (v1.0 → v2.0)

- Remove or rename a required input parameter
- Change output format or schema
- Swap tool dependencies (Claude → Gemini)
- Drop support for an old API version

Announce this clearly and give builders time to migrate:

\`\`\`markdown
## v2.0 (2026-09-01)

**Breaking:** Input field renamed \`source_file\` → \`input_path\`

Migration: Update your invocation:
\`\`\`bash
# Before (v1.x)
workflow run --source-file data.csv

# After (v2.x)
workflow run --input-path data.csv
\`\`\`

See the migration guide below.
\`\`\`

### Deprecation policy

If you plan to discontinue a workflow:

1. **Month 1:** Publish v2.0 with deprecation notice. Redirect to alternative.
2. **Month 2–3:** Keep the workflow available, but mark it deprecated in registries.
3. **Month 4+:** Archive the repository. Leave a README directing users to the replacement.

Never delete a publicly published workflow without warning. Builders depend on it.

## Schema drift: Preventing silent failures

The hardest problem in public workflows is schema drift. Your API changes, but downstream users do not know.

### Subscribe to announcements

If your workflow calls external services, subscribe to their agent-feed:

\`\`\`bash
agent-feed verify https://api.anthropic.com
# Outputs: last breaking change on 2026-04-12
# Your workflow still uses /v1/messages (deprecated 2026-04-15)
\`\`\`

Verify before deployment. CI fails if the API has shifted underneath you.

### Publish your own feed

If your workflow publishes endpoints or accepts tool registrations, publish an agent-feed:

\`\`\`bash
bunx agent-feed init --from-corpus my-workflow.dev
bunx agent-feed sign --key did:web:my-workflow.dev#k0
cp agent-feed.xml ./public/.well-known/
\`\`\`

Downstream agents subscribe. They see schema changes before they break.

### Test against pinned versions

In your CI, lock API versions:

\`\`\`yaml
test:
  env:
    ANTHROPIC_API_VERSION: "2026-04-15"
    WORKFLOW_VERSION: "v1.0"
  script:
    - npm run test
    - npm run build
\`\`\`

Pin both your workflow version and the versions of services it depends on. When you upgrade, explicitly test and document the change.

## Discovering and adopting public workflows

As a consumer, how do you find and use a published workflow safely?

### Search the feed

\`\`\`bash
onie-cli search "data processing"
# Returns: 12 workflows
# • data-pipeline-summarizer@1.2 · 847 installs · ⭐ 89
# • csv-analyzer@2.0 · 234 installs · ⭐ 12
# • etl-orchestrator@0.8 · 45 installs · ⭐ 3
\`\`\`

Sort by installs, stars, or update recency. Look at recent usage and community feedback.

### Pin to a version

\`\`\`bash
# Clone a specific version
onie-cli clone workflow/data-pipeline-summarizer@1.2

# Lock in your project
workflow-lock.json:
{
  "data-pipeline-summarizer": "1.2"
}
\`\`\`

### Test before production

\`\`\`bash
# Run with example inputs
npm run test --workflow data-pipeline-summarizer

# Dry-run on real data
npm run preview -- input.csv
\`\`\`

### Subscribe to updates

\`\`\`bash
# Get notified of new versions
onie-cli subscribe workflow/data-pipeline-summarizer

# Get notified only of breaking changes (v2.0, v3.0)
onie-cli subscribe --breaking-only workflow/data-pipeline-summarizer
\`\`\`

## FAQ

`.trim(),
  faqs: [
    {
      question: 'Why should I publish my workflow publicly?',
      answer:
        'Public workflows increase visibility, enable collaboration, and let other builders learn from your patterns. You also get feedback and contributions that improve the workflow over time.',
    },
    {
      question: 'How do I ensure my published workflow does not break downstream users?',
      answer:
        'Use semantic versioning, document your API contract clearly, and publish schema changes in advance. If you make breaking changes, bump the major version and give users time to migrate (at least 4 weeks notice).',
    },
    {
      question: 'What is the difference between a workflow version and a tool version?',
      answer:
        'A workflow version tracks changes to the workflow itself (inputs, outputs, logic). A tool version (Claude API, MCP server) tracks changes to external dependencies. Pin both in your CI to avoid surprises.',
    },
    {
      question: 'Can I unpublish a workflow after it is public?',
      answer:
        'Avoid it. Instead, mark it deprecated and redirect users to an alternative. If you must remove it, give builders at least 4 weeks notice. Unpublishing without warning breaks downstream workflows.',
    },
    {
      question: 'How do I know if a public workflow is safe to use?',
      answer:
        'Check the install count, recent updates, star rating, and issue tracker. Read the documentation. Look for a clear deprecation policy and pinned tool versions. Avoid workflows with no recent updates or unresolved critical issues.',
    },
    {
      question: 'Should I publish my workflow on Onie, npm, GitHub, or all three?',
      answer:
        'Start with Onie for visibility in the agent community. Publish to GitHub for version control and issue tracking. Publish to npm only if your workflow is a Node.js library that other code depends on.',
    },
    {
      question: 'What happens if a service my workflow depends on shuts down?',
      answer:
        'Subscribe to the service's agent-feed to get notified of deprecations. Have a migration plan ready. When the service shuts down, bump your workflow to v2.0, update dependencies, and publish a migration guide.',
    },
    {
      question: 'Can I charge for a publicly published workflow?',
      answer:
        'Yes, but be transparent. Publish the workflow open-source, and offer a commercial version with support, hosting, or additional features. Most successful agent workflows are free+support or open-source with commercial tooling.',
    },
  ],
}
