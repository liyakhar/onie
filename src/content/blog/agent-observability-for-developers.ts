import type { BlogPost } from '#/content/blog/types'

export const agentObservabilityForDevelopersPost: BlogPost = {
  slug: 'agent-observability-for-developers',
  title: 'Agent observability for developers: Traces and debugging',
  description:
    'Learn how to instrument AI agents with observability: distributed tracing, span hierarchies, and evaluation loops. Build reliable agents that you can debug in production.',
  publishedAt: '2026-07-28',
  readingMinutes: 11,
  primaryKeyword: 'agent observability for developers',
  keywordCluster: [
    'agent observability for developers',
    'ai agent tracing',
    'distributed tracing ai agents',
    'agent debugging production',
    'opentelemetry ai agents',
    'agent workflow observability',
  ],
  author: {
    name: 'Priya Sharma',
    role: 'AI engineer · Agent systems',
    bio: 'Builds multi-agent systems in production and instrumentsworkflows for reliability. Contributor to agent observability patterns on Onie.',
  },
  tldr:
    'Agent observability is step-by-step visibility into an agent execution: every LLM call, every tool invocation, and every state transition. Unlike traditional logging, traces reconstruct the reasoning path that led to a result. Using distributed tracing with OpenTelemetry, span hierarchies for nested calls, and evaluation loops that turn production failures into test cases, you can debug drift and reasoning failures that would be invisible in logs alone.',
  relatedSlugs: ['agent-workflow-template', 'document-ai-agent-workflows'],
  body: `
## Why agents break differently

Traditional software observability assumes deterministic code paths. If your function fails, a stack trace and a log line point to the bug. Agents violate that assumption. Two runs with the same input can take different reasoning paths, call different tools, and produce different answers. The failure mode is often drift—the agent reasons its way into a wrong decision—not an exception.

Drift does not show up in logs. A log line records state at a single point. An agent trace records the reasoning sequence that led to that state. When an agent calls search_docs with an empty query, the log shows "search_docs returned nothing." The trace shows "the planner's JSON was truncated on turn four, which is why the search query was empty."

Agent observability is the practice of capturing that full reasoning path so you can replay failures and locate where reasoning diverged.

## Three pillars of agent observability

### 1. Distributed tracing: Reconstruct the execution path

A distributed trace is a directed acyclic graph of spans, where each span represents a single step: an LLM call, a tool invocation, a retrieval, a sub-agent handoff. Spans are linked by parent-child relationships, so you can see the causal chain.

An agent trace typically captures:

- **LLM spans**: Model name, input messages (system, user, assistant), output messages, token counts, cost, latency, and full request/response JSON
- **Tool spans**: Tool name, arguments, return value, errors, and latency
- **Retrieval spans**: Query, retrieved documents, relevance scores (usually instrumented as tool spans)
- **Sub-agent boundaries**: When a planner delegates to a specialist, the specialist's full run nests under the tool span that invoked it
- **Metadata**: User ID, session ID, run ID, any feature flag that changes behavior

Most frameworks (LangGraph, Pydantic AI, Claude Agent SDK, Vercel AI SDK) ship with auto-instrumentation. The SDK patches LLM and framework libraries at import time, so every model call lands as a span without additional code. You still add manual spans for your own functions: business logic, custom retrievers, custom tools. Wrap them with a decorator like `@observe()` and you get a named root span for every run, which anchors every other span.

### 2. Hierarchical views: From tree to transcript

A long agent trace has 500 to 5,000 spans. Render those as a tree and you have an outline, not a trace. Every row has equal weight: the root agent span, its query span, every tool call, every nested sub-agent. You scroll and squint and try to reconstruct what the agent actually did.

The better model is a transcript view. Lay the run out top-to-bottom as a conversation. The agent's input is parsed from the system/user messages and rendered inline as an Input block. Each LLM turn shows the assistant's message with a one-line preview. Each tool call shows the tool name and its first argument. Each sub-agent is a single collapsible card with its own Input, Output preview, and duration. Click the card and it expands: the sub-agent's own LLM turns and tool calls appear inside it.

Three things come out of this:

- The first question you ask (what did we ask this agent to do?) has an answer on the first screen
- Multi-agent runs stay readable. Ten sub-agents produce ten cards, not ten subtrees
- Inline previews let you scan a long trace. If the failure is on turn 47, the preview on row 47 often tells you

The transcript view does not replace the tree. You keep the tree one click away for when you need to confirm parent/child nesting or inspect raw span attributes. But the transcript is your default.

### 3. Production-to-eval loops: Turn failures into test cases

Tracing tells you what broke. Evaluations tell you whether your fix makes things better or worse in aggregate.

An evaluation is an offline test. Define a list of datapoints (input, optional target, optional metadata), an executor (the agent being tested), and one or more evaluators (functions that score the output). Run the evaluation: the agent traces every call, the evaluators score every output, and you compare runs side by side.

The production-to-eval loop, in practice:

1. A failure pattern emerges in prod. Maybe the agent looped on the same tool without progress, or it misunderstood the user's intent on follow-ups
2. You export the traces that show the failure to a dataset from the trace UI or SQL
3. You write an evaluation that scores whether that failure mode still happens
4. You change the prompt, model, or tool setup, run the evaluation again, and compare side by side
5. The fix either improves the score or it doesn't. If it does, ship it. If not, inspect the regressed trace to understand why

This closes the gap between production debugging and local testing. You are not guessing whether your fix works; you know.

## How to instrument an agent

### Step 1: Initialize observability

Most platforms provide a one-line initialization. With Laminar:

\`\`\`python
from lmnr import Laminar, observe

Laminar.initialize()
\`\`\`

\`\`\`typescript
import { Laminar, observe } from "@lmnr-ai/lmnr";

Laminar.initialize();
\`\`\`

The SDK now patches all LLM and framework libraries. Every model call and framework-level tool call lands as a span automatically.

### Step 2: Add a root span

Wrap your agent entry point with @observe(). This gives you a named root span on every run:

\`\`\`python
@observe()
async def run_agent(user_input: str):
    # agent logic
    pass
\`\`\`

\`\`\`typescript
export const runAgent = observe(
  { name: "runAgent" },
  async (userInput: string) => {
    // agent logic
  }
);
\`\`\`

### Step 3: Instrument custom functions

For business logic, custom retrievers, or custom tools, add @observe() decorators:

\`\`\`python
@observe(span_type="TOOL")
def search_knowledge_base(query: str):
    results = db.search(query)
    return results
\`\`\`

\`\`\`typescript
const searchKnowledgeBase = observe(
  { spanType: "TOOL", name: "search_knowledge_base" },
  (query: string) => {
    const results = db.search(query);
    return results;
  }
);
\`\`\`

### Step 4: Attach metadata

Include context that helps you filter and debug later:

\`\`\`python
Laminar.set_metadata({
    "user_id": user_id,
    "session_id": session_id,
    "feature_flag": "new_planner",
})
\`\`\`

\`\`\`typescript
Laminar.setMetadata({
  userId: userId,
  sessionId: sessionId,
  featureFlag: "new_planner",
});
\`\`\`

### Step 5: Query traces with SQL

Once traces arrive, query them to find patterns:

\`\`\`sql
-- Error rate by span name
SELECT name,
       countIf(status = 'error') AS errors,
       count(*) AS total,
       round(errors / total * 100, 2) AS error_rate
FROM spans
WHERE start_time > now() - INTERVAL 1 DAY
GROUP BY name
HAVING total > 10
ORDER BY error_rate DESC

-- Most expensive models
SELECT model, sum(total_cost) AS cost, count(*) AS calls
FROM spans
WHERE span_type = 'LLM' AND start_time > now() - INTERVAL 7 DAY
GROUP BY model
ORDER BY cost DESC

-- Sessions where a specific failure fired 3+ times
SELECT trace_id, count(*) AS failures
FROM signal_events
WHERE signal_id = '...' AND timestamp > now() - INTERVAL 7 DAY
GROUP BY trace_id
HAVING failures > 3
\`\`\`

## Choosing an observability platform

### Platform-specific (framework-locked)

LangSmith is the default for LangGraph users. It integrates deeply with the framework, so traces are structured automatically. The tradeoff: you are locked into LangGraph.

Braintrust and Pydantic AI's native observability are similar: tight framework integration, excellent UX, limited portability.

Use these when your entire team uses that framework and you don't anticipate switching.

### Vendor-agnostic (OpenTelemetry-native)

Laminar, Langfuse, and Arize Phoenix are built on OpenTelemetry. You instrument once, export to any OTLP backend. You are never locked in.

The benefits:

- Bring your existing OTel instrumentation (OpenLLMetry, any @opentelemetry/instrumentation-* package) and point it at the platform
- Fan out to multiple backends simultaneously for redundancy or multi-tenancy
- Migrate away without rewriting instrumentation
- Use standard semconv attribute names (gen_ai.request.model, gen_ai.usage.input_tokens) that any backend understands

Use these when you want portability, multi-framework support, or self-hosting.

### System-level (eBPF-based)

AgentSight is a local-first tool that observes agents from outside. It uses eBPF to capture LLM traffic, process execution, file access, and system activity without an SDK. No code changes, no proxy, works with any agent CLI.

The benefits:

- Works with closed-source agents (Claude Code, Gemini CLI, etc.) without SDKs
- Correlates LLM traffic with system effects: which files changed, which services were contacted
- Runs locally with output in SQLite or web UI
- Zero instrumentation cost

Use this for auditing what agents do, correlating LLM decisions to system effects, or observing agents you do not own.

## Common patterns

### Multi-turn sessions

Group traces by session ID so you can read a conversation end-to-end. Attach the same session_id to every trace in a user conversation. The platform groups them as a timeline. This catches context bleed and memory drift across turns.

### Sub-agent delegation

When a planner delegates to a specialist, nest the specialist's full run under the tool span. This preserves the causal chain: the planner decided to use a tool, and the tool invoked another agent.

### Evaluation datasets

Export traces that show failures or edge cases to a dataset. Reuse the dataset across multiple evaluations and CI runs. This builds a regression suite from production failures.

### Browser agents

If your agent drives a browser (Browser Use, Playwright-based agents), capture the session recording alongside the trace. Sync the playhead to the trace timeline so you can see what the page looked like when the LLM made a decision.

## Integration with Claude Code and Cursor

Claude Code and Cursor are agents. You can instrument them with observability tools by:

- Configuring an MCP server that emits OpenTelemetry spans
- Using platform SDKs if available (LangSmith, Laminar, etc.)
- Running AgentSight to observe their system effects

The main limitation: Claude Code and Cursor are your IDE agent. You do not own the code, so you cannot add manual @observe() decorators. You can only observe via MCP and system-level tools.

## What to avoid

### Sampling spans at ingest

Do not drop spans to save cost. Drift is rare, and rare failures are often in the sampled subset. Store full-fidelity traces.

### Summarizing LLM output

Do not truncate or summarize the full request/response JSON to save space. The evidence you need to debug is in the details.

### Skipping metadata

Do not treat metadata as optional. User ID, session ID, feature flag, and any config that changes behavior should be attached to every span. These are the fields you filter on when debugging a cohort.

### Treating traces like logs

Do not expect traces to answer "what went wrong." Traces answer "what happened." You need the evaluation loop to understand whether a fix works.

## Getting started on Onie

When you build agent workflows or tools on Onie, describe the observability approach:

- Which spans you emit
- How you correlate sub-agents
- What metadata you attach
- How you run evaluations to validate quality

Share workflows on Onie with observability baked in so practitioners can debug and iterate on your patterns.

## FAQ

**What is the difference between a log and a trace?** A log is a point-in-time record. A trace is a full execution graph. Logs answer "what was the state here?" Traces answer "how did the agent reason to this state?"

**Do I need tracing for simple agents?** Not if the agent is one-shot and deterministic. A classifier that calls the model once is fine with logs. Add tracing once the agent has more than two or three steps.

**Can I trace agents that I don't own?** Yes, with system-level tools like AgentSight or network proxies. You see LLM traffic and system effects but not framework-level details.

**How much does observability cost?** Depends on volume and retention. Most platforms charge per span or per trace. At moderate volumes (thousands of runs per day), expect $1–10k/month for a hosted platform, or self-host with ClickHouse/Jaeger to avoid per-span fees.

**What should I export to my evaluation dataset?** Failures, edge cases, and a random sample of successes. The dataset is your regression suite, so include enough successes to catch regressions.

**Can observability catch hallucinations?** Not directly. Observability shows what the agent did; evaluations score whether the output is correct. Use an LLM-as-a-judge evaluator to detect hallucinations.

**How do I correlate observability with user feedback?** Attach user ID, session ID, and feedback score to every span. Then query traces where feedback < 3 to find common failure patterns.

**Is observability useful for agents running in production?** Yes. This is when observability is most valuable. You capture production failures, export them to eval datasets, test fixes, and ship with confidence.
`.trim(),
  faqs: [
    {
      question: 'What is agent observability?',
      answer:
        'Agent observability is step-by-step visibility into an agent execution. It captures every LLM call, tool invocation, and state transition as nested spans, showing the full reasoning path. This reconstructs not just what the agent did but why it made each decision.',
    },
    {
      question: 'Why do agents need different observability than traditional code?',
      answer:
        'Agents are non-deterministic. Two runs with the same input can take different reasoning paths. Failures are often drift (wrong decisions) rather than exceptions. Logs show state at a point; traces show the reasoning sequence that led to that state.',
    },
    {
      question: 'What is a distributed trace?',
      answer:
        'A distributed trace is a directed acyclic graph of spans linked by parent-child relationships. Each span represents one step: an LLM call, a tool invocation, a retrieval. The trace reconstructs the causal chain across all steps.',
    },
    {
      question: 'What is OpenTelemetry and why is it important for agents?',
      answer:
        'OpenTelemetry (OTel) is an open standard for collecting traces and metrics. Using OTel for agent instrumentation keeps you portable: you can export to any OTel backend and never rewrite instrumentation. Platforms like Laminar and Langfuse are OTel-native.',
    },
    {
      question: 'How do production-to-eval loops work?',
      answer:
        'Export traces that show failures from production to a dataset. Run your agent against that dataset with an evaluator function that scores the failure. Change your prompt or model, run the evaluation again, and compare. This turns production failures into automated regression tests.',
    },
    {
      question: 'Can I observe agents I do not own?',
      answer:
        'Yes, with system-level tools like AgentSight. It uses eBPF to capture LLM traffic, process execution, and file access from outside the agent. You see system effects but not framework-level span details.',
    },
    {
      question: 'Should I sample spans to save cost?',
      answer:
        'No. Drift is rare, and rare failures are often in the sampled subset. Store full-fidelity traces. Most platforms have per-span or per-trace pricing that is reasonable at moderate volumes.',
    },
    {
      question: 'How do I trace sub-agents?',
      answer:
        'Nest the sub-agent's full run under the tool span that invoked it. Attach the same session ID to all traces in a conversation. This preserves the causal chain and lets you read multi-turn sessions end-to-end.',
    },
  ],
}
