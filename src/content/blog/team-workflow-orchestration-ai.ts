import type { BlogPost } from '#/content/blog/types'

export const teamWorkflowOrchestrationPost: BlogPost = {
  slug: 'team-workflow-orchestration-ai',
  title: 'Team workflow orchestration with AI agents',
  description:
    'Coordinate multiple AI agents across your team. Learn orchestration patterns, implement deterministic workflows, and ship reproducible agent systems on Onie.',
  publishedAt: '2026-09-25',
  readingMinutes: 12,
  primaryKeyword: 'team workflow orchestration with ai',
  keywordCluster: [
    'team workflow orchestration with ai',
    'ai agent orchestration patterns',
    'multi-agent workflow coordination',
    'deterministic agent workflows',
    'team collaboration ai agents',
    'agent workflow governance',
    'workflow automation with multiple agents',
  ],
  author: {
    name: 'Sam Stokes',
    role: 'Platform engineer · agent systems',
    bio: 'Builds orchestrated agent systems for teams. Ships workflow patterns that survive concurrent agent execution and async handoffs. Teaches governance on Onie.',
  },
  tldr:
    'Team workflow orchestration coordinates specialized agents—audit, synthesis, approval—within a deterministic control flow. Four patterns win in production: manager agents that delegate to specialists, handoffs where agents transfer ownership, routers that classify work, and explicit workflows where code decides progression. Pair patterns with Onie to publish team workflows as reusable templates.',
  relatedSlugs: [
    'claude-code-dynamic-workflows',
    'dynamic-workflow-examples',
    'agent-workflow-template',
    'share-claude-code-skills-with-team',
  ],
  body: `
## Why orchestration matters for teams

When one agent works alone in a chat window, reasoning is fast and flexible. When your team runs workflows daily—code audit, research synthesis, approval chains—you need predictability.

Team workflow orchestration is the system that coordinates:

- Which agent does what task
- When handoffs happen (audit agent → human reviewer → deployment agent)
- What context crosses boundaries
- Where authority lives (agent proposes, code validates, human approves)
- How state persists across failures and retries

Without explicit orchestration, workflows leak into chat history, approval steps get skipped, and results vary wildly between runs. Orchestration makes workflows reproducible, auditable, and suitable for teams.

## Four orchestration patterns

The top teams running production agent workflows use four composable patterns. They are not mutually exclusive—a single workflow often combines all four.

### 1. Manager agent with specialists

One agent (the manager) breaks work into subtasks and delegates to specialists. The manager synthesizes results and owns the final answer.

Use this pattern when:
- One agent should own the outcome
- Subtasks are independent
- You need one voice on the answer

Example: A code audit where a manager agent routes files to specialists (security, performance, style checkers), collects findings, and ranks them by severity.

\`\`\`
Manager: "Here are 200 files. Audit security.js for auth issues, db.js for SQL injection, api.js for rate limits. Synthesize into a report."
  ↓
Specialist agents run in parallel
Security Agent → findings
Database Agent → findings
API Agent → findings
  ↓
Manager: synthesizes findings into risk matrix
\`\`\`

Boundaries are clear: manager owns reasoning, specialists own expertise, manager owns output.

### 2. Handoff pattern

An agent completes its task and hands off to a different agent (or human) who owns the next interaction.

Use this pattern when:
- The specialist should directly own the next step
- Context is compact enough to transfer
- You want decoupled, sequential execution

Example: An audit agent flags issues, then a fix agent owns implementation without reiterating the audit.

\`\`\`
Audit Agent: "Found 3 security issues: [details]"
  ↓
Fix Agent: "I acknowledge these issues. Fixing now."
  ↓
Test Agent: "Verifying fixes work."
\`\`\`

Each agent owns their step fully. No manager looping. Failures are explicit handoff boundaries.

### 3. Router pattern

One component classifies incoming work and sends it to the right specialist.

Use this pattern when:
- Input classification is the main challenge
- Destinations are bounded and stable
- You want fast, deterministic routing

Example: A customer question router that sends billing questions to the accounting agent, bugs to the engineering agent, and features to the product agent.

\`\`\`
Router: classify intent
  ↓
if intent == "billing" → Accounting Agent
if intent == "bug" → Engineering Agent  
if intent == "feature" → Product Agent
\`\`\`

Routers are lightweight. Code can implement them, or a lightweight agent can classify and then hand off.

### 4. Deterministic workflow (graph)

Control flow lives in code or a workflow engine, not inside an agent loop. The workflow calls agents at specific steps, handles branching, retries, and approval gates.

Use this pattern when:
- Process order must be deterministic
- You need retries and recovery
- Approvals or business gates are required
- Multiple agents must work in sequence or fan-out

Example: A code migration where 5 steps must happen in order (lint old code, generate new code, test new code, diff, review, deploy).

\`\`\`
workflow {
  step "lint" → agent(lint_spec)
  step "generate" → agent(generate_spec)  
  step "test" → agent(test_spec)
  step "diff" → code_to_display_changes
  approval "human_review" → require(human_approval)
  step "deploy" → agent(deploy_spec) if approved
  retry on_failure { backoff(exponential) }
}
\`\`\`

Code controls order. Agents are called as steps. Failures halt and log. Approvals are explicit.

## Combining patterns: a production example

Real workflows stack all four:

A team publishes agent workflows to Onie. The workflow:
1. (Router) classifies which agent skill to publish (syntax check, tests, examples)
2. (Manager + parallel specialists) one manager coordinates three linters in parallel
3. (Handoff) passes clean code to a writer agent to generate docs
4. (Deterministic workflow) executes approve → tag → deploy in order with retry logic

Each boundary is explicit. Authority is clear. Results are repeatable.

## How to build deterministic workflows

### Option A: Claude Code dynamic workflows

[Claude Code dynamic workflows](/blog/claude-code-dynamic-workflows) are JavaScript orchestration scripts. You define agents, run them in parallel, collect results, and hand off to the next stage.

\`\`\`javascript
const auditResults = await parallel([
  () => agent('Audit auth for SQLi'),
  () => agent('Audit crypto for weak keys'),
  () => agent('Audit rate limits'),
])
const fixResults = await agent(
  'Generate fixes for these issues',
  { context: auditResults }
)
\`\`\`

Best for: teams using Claude Code, rapid iteration, multi-agent parallelism.

### Option B: Durable workflow engines

Frameworks like Dapr Agents or LangGraph provide workflow primitives with built-in retry, state recovery, and observability.

\`\`\`python
@workflow
def audit_and_fix():
  audit_step = await call_activity(audit_agent)
  fix_step = await call_activity(fix_agent, input=audit_step)
  return fix_step
\`\`\`

Best for: production infrastructure, long-running pipelines, enterprise governance.

### Option C: Application-level orchestration

Hand-write control flow in your application (e.g., API routes that call agents in order and handle state).

\`\`\`javascript
const audit = await callAgent('audit', { files })
const fixes = await callAgent('fix', { audit })
const approved = await requireApproval(fixes)
await deploy(approved)
\`\`\`

Best for: simple workflows, tight integration with app state, custom approval logic.

## Implementing governance

Team workflows need boundaries. Without them, agents mutate shared state, approvals vanish, and audits fail.

### Approval gates

Insert human decision points:

\`\`\`
Agent proposes changes
  ↓
Human reviews changes (can see agent reasoning)
  ↓
if approved: continue to next agent
if rejected: agent revises or stops
\`\`\`

The human owns the gate. The agent must respect the decision.

### Shared state and context passing

When agents hand off, pass only what is needed. Too much context bloats the next agent. Too little causes re-work.

Example handoff for a code audit:
- Pass: [issue, severity, file, line number, fix suggestion]
- Do not pass: entire codebase, full reasoning logs

### Logging and auditability

Every agent call should log:
- Who triggered it
- What the agent decided
- What state changed
- Who approved the change

Teams using Onie can publish workflows alongside this log as a template. Other teams can fork and adapt.

### Retry and failure recovery

Deterministic workflows should specify what happens on agent failure:

\`\`\`
on_agent_failure {
  retry(max=3, backoff=exponential)
  if max_retries_exceeded: escalate_to_human
}
\`\`\`

Agents will fail (bad input, model timeout, tool errors). The workflow must survive failures and alert humans when retry is exhausted.

## Sharing workflows on Onie

Once your team has a working orchestration, publish it on Onie.

A team workflow on Onie includes:
- The workflow definition (code or visual description)
- Agent instructions (what each agent does, constraints)
- Approval gates (where humans review)
- Example runs (input → output)
- Failure modes (what breaks, how to fix)

Other teams can fork your workflow, adapt it to their domain, and publish their variant.

This is how orchestration scales: one team's audit workflow becomes a template. Another team adapts it for code review. A third team extends it to include performance checks. All are published, discoverable, and versioned.

## Patterns in the wild

### Content review (edit → fact-check → publish)

\`\`\`
Writer agent: drafts article
  ↓
Fact-check agent: verifies claims against sources
  ↓
Editor agent: improves clarity and tone
  ↓
Human approval: final sign-off
  ↓
Publish agent: posts to blog, updates index
\`\`\`

Each agent is a specialist. Each hands off. Failures at fact-check halt publication.

### Code migration (lint → generate → test → review → deploy)

\`\`\`
Lint agent: scan old code for issues
  ↓
Generate agent: write new code
  ↓
Test agent: run test suite on new code
  ↓
Human review: approve changes
  ↓
Deploy agent: merge and deploy
\`\`\`

Order is fixed. Testing must happen before review. Review must happen before deploy.

### Research synthesis (gather → summarize → fact-check → cite)

\`\`\`
Gather agents (parallel): collect papers, docs, interviews
  ↓
Synthesis agent: summarize key findings
  ↓
Fact-check agents (parallel): verify claims in sources
  ↓
Citation agent: format references
  ↓
Output: structured research report
\`\`\`

Gathering and fact-checking run in parallel. Synthesis happens once all inputs are collected. Strict order where needed.

## Anti-patterns to avoid

### Agents with side effects in an uncontrolled loop

If an agent can deploy code while also deciding whether to deploy, errors hide. Separate decision from action.

Bad:
\`\`\`
Agent: "Code looks good. Deploying now."
[agent calls deploy]
\`\`\`

Good:
\`\`\`
Agent: "Code looks good. Ready to deploy."
Workflow: requires human approval
Human: approves
Workflow: calls deploy
\`\`\`

### Implicit handoff context

When agent A hands off to agent B, assume B does not have context A had. Pass what is needed explicitly.

Bad:
\`\`\`
Audit agent: "Done with security audit."
(implicit: assumptions about code are lost)
Fix agent: re-audits because it has no audit results
\`\`\`

Good:
\`\`\`
Audit agent: outputs [issues, severity, file]
Workflow: passes audit output to fix agent
Fix agent: uses audit results to write fixes
\`\`\`

### Mixing agent reasoning with workflow control

If the agent decides workflow direction and also executes it, failures are hard to trace.

Bad:
\`\`\`
Agent: "Found 3 bugs. Fixing them now. Test passed. Deploying."
(Agent made 4 decisions in one turn; where did it fail?)
\`\`\`

Good:
\`\`\`
Step 1 (audit): Agent finds bugs
Step 2 (fix): Agent fixes bugs  
Step 3 (test): Agent runs tests
Step 4 (approval): Human approves
Step 5 (deploy): Code deploys
(Each step is explicit; failures are isolated)
\`\`\`

## Next steps

Start with the pattern that fits your workflow:

1. **New to orchestration:** try the manager + specialists pattern. One agent delegates to task-specific experts. Simple to reason about.

2. **Sequential work:** try handoffs. Each agent owns one step and passes to the next.

3. **Fast routing:** try routers. Classify incoming work and send it to the right agent without overhead.

4. **Complex governance:** implement a deterministic workflow. Use Claude Code or a durable engine to control order, retries, and approvals.

5. **Share your workflow:** publish it on Onie. Include instructions, example runs, and failure modes. Other teams will adapt it. You'll learn how they extend it.

The most mature teams mix all four patterns. Each workflow uses the right tool for the right job. Boundaries are explicit. Authority is clear. Failures are recoverable.

Start simple. Iterate. Share on Onie.
`.trim(),
  faqs: [
    {
      question:
        'What is the difference between a manager agent and a router in orchestration?',
      answer:
        'A manager agent makes decisions and delegates subtasks to specialists, then synthesizes results into a final answer. The manager reasons about what specialists should do and evaluates their outputs. A router classifies incoming work and sends it to a fixed destination; the router has no reasoning step. Managers are good when specialization and synthesis matter. Routers are good when classification is the main problem.',
    },
    {
      question: 'When should I use handoffs vs. a manager pattern?',
      answer:
        'Use handoffs when the specialist should directly own the next interaction without a manager reassessing. Use a manager when one agent should own the final decision. Handoffs are lighter and encourage each agent to own their step. Managers are better when the final output needs coordination.',
    },
    {
      question:
        'How do I prevent agents from making decisions they should not make?',
      answer:
        'Use explicit approval gates in your workflow. Agent proposes, code validates, human approves. Separate the agent\'s reasoning from the actual decision and action. The workflow engine controls what happens next, not the agent.',
    },
    {
      question: 'What happens if an agent fails in the middle of a workflow?',
      answer:
        'A deterministic workflow should specify retry logic and failure handlers. Use exponential backoff for transient failures. After max retries, escalate to a human or stop. Log every failure so you can audit why the workflow halted. Never silently skip failures.',
    },
    {
      question: 'Can I use multiple patterns in the same workflow?',
      answer:
        'Yes. A real workflow often uses all four: a router to classify input, a manager to coordinate specialists, handoffs between sequential agents, and a deterministic engine to control order and retries. Each pattern handles a different problem. Compose them where they fit.',
    },
    {
      question: 'How do I share team workflows on Onie?',
      answer:
        'Create a post on Onie in the Agent Workflows category. Include: the workflow definition (ASCII diagram or code), instructions for each agent, example input and output, approval gates, and known failure modes. Tag with relevant skills (e.g., audit, synthesis, approval). Other teams can fork and adapt.',
    },
    {
      question:
        'What tools can I use to build deterministic workflows with agents?',
      answer:
        'Claude Code dynamic workflows (JavaScript orchestration), Dapr Agents (durable execution engine), LangGraph (Python workflow graphs), UiPath Maestro Flow (enterprise automation), or application-level orchestration (hand-written in your API). Pick based on your team\'s tech stack and governance needs.',
    },
    {
      question:
        'How do I pass context from one agent to the next without losing information?',
      answer:
        'Pass only what the next agent needs. Use structured outputs (JSON Schema) so agents receive predictable data shapes. Document what each handoff carries: [issue, severity, file, line]. Avoid passing raw logs or full reasoning. The next agent can ask for more context if needed.',
    },
  ],
}
