import type { BlogPost } from '#/content/blog/types'

export const claudeCodeSubagentsWorkflowPost: BlogPost = {
  slug: 'claude-code-subagents-workflow',
  title: 'Claude Code subagents workflow: choose your orchestrator',
  description:
    'Subagents delegate work inside one session. Workflows move the plan to code. Agent teams coordinate peer workers. When to use each for multi-agent tasks.',
  publishedAt: '2026-07-25',
  readingMinutes: 12,
  primaryKeyword: 'claude code subagents workflow',
  keywordCluster: [
    'claude code subagents workflow',
    'claude code subagents vs workflows',
    'dynamic workflows claude code',
    'agent teams claude code',
    'multi-agent orchestration',
    'subagents vs agent teams',
  ],
  author: {
    name: 'Sarah Chen',
    role: 'ML engineer · Claude Code practitioner',
    bio: 'Ships multi-agent systems with Claude Code and publishes workflows on Onie. Focuses on orchestration patterns that scale from a few tasks to hundreds.',
  },
  tldr:
    'Claude Code offers three ways to parallelize work: subagents (Claude decides turn-by-turn what to spawn), agent teams (workers coordinate with each other), and dynamic workflows (a JavaScript script holds the plan). Use subagents for a few side tasks per turn. Use agent teams when workers need to debate or share findings. Use workflows when the same operation repeats across many items or the plan is stable enough to freeze into code.',
  relatedSlugs: [
    'claude-code-workflow-examples',
    'agent-workflow-template',
    'agent-skills-best-practices',
    'document-ai-agent-workflows',
  ],
  body: `
## Who holds the plan

The four Claude Code parallelism primitives differ in one core question: **who decides what runs next?**

- **Subagents:** Claude decides. You describe a multi-step task; Claude spawns focused workers, collects results, and chooses the next step.
- **Agent teams:** A lead agent decides (experimental, disabled by default). Teammates operate in separate context windows and message each other directly.
- **Dynamic workflows:** Code decides. You describe the task once; Claude writes a JavaScript orchestration script, and a runtime executes it in the background.
- **Agent view:** You decide. Multiple independent Claude Code sessions run in parallel, and you monitor them from one dashboard.

The orchestrator shapes the token cost, communication overhead, and scaling limit.

## Subagents: delegate inside one session

Subagents are focused workers spawned from your main session. They run in their own context window, complete a task, and return a summary back to your conversation.

**When to use:**
- A task needs a side investigation (search for context, run tests, debug logs)
- The next step depends on reading the previous result in detail
- You want the orchestration to stay responsive and visible in your session

**Example:** Audit a codebase for security issues. You ask Claude; it spawns a subagent to scan each module, another to check dependencies, and another to review auth patterns. Results come back as summaries, and you review findings together.

**Token cost:** Low until used. At session start, the subagent type definition sits in context (a few tokens). When spawned, Claude's attention shifts to the subagent temporarily. The subagent's result returns as a summary, so your main context stays lean.

**Communication:** One-way. Subagents report back to the caller. They do not talk to each other. If you need one subagent to use another's findings, Claude must coordinate the relay.

**Context isolation:** Each subagent gets its own context window, so they operate on fresh ground without the main session's memory. Useful for focused tasks; problematic if the subagent needs deep context from the caller.

## Agent teams: coordinate peer workers (experimental)

Agent teams let multiple Claude Code instances operate as peers. A lead agent spawns teammates, and teammates message each other directly — no relay through the lead.

**When to use:**
- Workers need to challenge each other (adversarial code review, debate trade-offs)
- Teammates must share findings and coordinate autonomously
- The task benefits from multiple perspectives working in parallel

**Example:** Design a system architecture. You ask Claude; it creates a lead agent and spawns three teammates: backend specialist, frontend specialist, and ops specialist. Each teammate reviews the design from their angle, identifies gaps, and proposes alternatives. Teammates message each other directly, iterate on the design, and reach consensus.

**Enabling:** Agent teams are experimental and disabled by default. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in your environment.

**Token cost:** High. Each teammate is a full Claude Code instance, so you pay the context cost for every teammate on every turn. Use when collaboration is worth the token spend.

**Communication:** Direct. Teammates message each other without the lead agent as intermediary. This enables fast iteration but can lead to branching conversations if not scoped clearly.

**Coordination:** Loose. Teammates pull from a shared task list, claim work, and self-coordinate. The lead agent does not micromanage every decision.

## Dynamic workflows: freeze the plan into code

A dynamic workflow is a JavaScript script that orchestrates subagents at scale. Claude writes the script once, and a runtime executes it in the background while your session stays responsive.

**When to use:**
- The same operation repeats across many items (audit every file, migrate every component)
- The orchestration is stable enough to save and rerun
- You want a repeatable quality pattern (e.g., cross-verification across subagents)
- The plan exceeds what you can coordinate turn-by-turn

**Example:** Migrate 500 class components to hooks. You describe the task; Claude writes a workflow script. The runtime iterates through the components, spawns migration subagents for each, collects results, cross-checks for consistency, and returns a report. Your session shows progress updates while the background runtime does the work.

**Token cost:** Very efficient at scale. The script holds the loop and branching logic, so Claude's context receives only the final answer. This is why workflows can coordinate dozens to hundreds of agents where subagents top out at a handful per turn.

**Concurrency:** Up to 16 agents run concurrently. A single workflow can coordinate up to 1,000 agents total across all iterations.

**Execution:** Background. The workflow runs in an isolated environment separate from your conversation. Intermediate results live in script variables, not in your main context. Your session receives progress updates and the final summary.

**Communication:** Through the script. Subagents do not communicate with each other; the script passes results between them and decides what to do next.

## Comparison table

| Aspect | Subagents | Agent teams | Workflows |
| --- | --- | --- | --- |
| **Orchestrator** | Claude (turn-by-turn) | Lead agent + peers | JavaScript script |
| **Communication** | Back to caller only | Direct peer messaging | Via script |
| **Best for** | Few side tasks per turn | Workers need to debate | Repeatable, large-scale tasks |
| **Token cost** | Low | High (full instances) | Efficient (script holds logic) |
| **Concurrency** | Few per turn | Limited | Up to 16 concurrent, 1k total |
| **Context for caller** | Main session stays lean | Lead agent manages | Session stays responsive |
| **Execution** | Foreground | Foreground | Background |
| **Setup** | Automatic | Experimental flag | Automatic |

## Decision: which one to pick

**Use subagents if:**
- The task is a few side investigations that feed into the main conversation
- You want to stay in control and see each step
- Token efficiency matters more than scale

**Use agent teams if:**
- Workers must debate, challenge, or compare findings
- The task benefits from autonomous peer coordination
- You can afford higher token cost for richer collaboration
- You enable the experimental flag

**Use workflows if:**
- The same operation repeats across many items (100+)
- The orchestration is stable (same steps, same branching every run)
- You want cross-verification or quality checks across subagents
- You need background execution while staying responsive

**Use agent view if:**
- You are managing multiple independent, long-running Claude Code sessions
- You want one dashboard to monitor progress across all sessions

## An example: codebase audit

Here is the same task handled three ways:

**Subagents:** Claude spawns a subagent to audit each module and collects summaries. Takes a few turns in your main conversation. You stay in control, but the process is linear and visible.

**Agent teams:** Claude creates a lead and spawns module specialists. Each reviews their section, and they message each other to reconcile findings and flag inconsistencies. Takes longer upfront but produces a more thorough audit. Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

**Workflows:** Claude writes a script that iterates through all modules, spawns subagents in parallel, cross-checks results for consistency, and returns a unified audit report. Runs in the background. Scales to 1,000 modules without your conversation becoming unresponsive.

## Hybrid strategies

Workflows and subagents are not mutually exclusive:

- **Workflows with subagents:** A workflow script spawns multiple subagents to divide work within each iteration.
- **Subagent workflows:** A subagent runs a bounded workflow (a few loops) and returns results to the main session.

The rule: pick the orchestrator that matches your scaling need.

## Onie: share your multi-agent workflow

Once you have a workflow that works for your team (audit pattern, migration script, cross-verification loop), publish it on [Onie](/app/explore) so others can fork and reuse it. Save the script, document the entry task and expected output, and cite the practitioner patterns you used.
`.trim(),
  faqs: [
    {
      question: 'What is a subagent in Claude Code?',
      answer:
        'A subagent is a focused worker spawned from your main session. It runs in its own context window, completes a task, and returns a summary back to your conversation. Subagents are cheap on tokens until used and useful for side investigations that feed into your main work.',
    },
    {
      question: 'When should I use a dynamic workflow instead of subagents?',
      answer:
        'Use a workflow when the same operation repeats across many items (100+ files to migrate, 500+ components to audit) or when the orchestration is stable enough to freeze into code. Workflows scale to hundreds of concurrent agents while subagents top out at a handful per turn. Workflows also run in the background, keeping your session responsive.',
    },
    {
      question: 'What is the difference between a workflow and agent teams?',
      answer:
        'Workflows move the orchestration plan into a JavaScript script; a runtime executes it in the background. Agent teams are peer workers that message each other directly and coordinate autonomously. Workflows are better for repeatable tasks; agent teams are better for collaborative work that needs debate and comparison.',
    },
    {
      question: 'How much more do agent teams cost than subagents?',
      answer:
        'Agent teams cost significantly more because each teammate is a full Claude Code instance. You pay context cost for every teammate on every turn. Subagents are cheaper because their results return as summaries. Use agent teams only when inter-agent collaboration is worth the token spend.',
    },
    {
      question: 'Can subagents talk to each other?',
      answer:
        'No. Subagents report results only to the caller. If you need one subagent to use another subagent\'s findings, Claude must coordinate the relay through your main session. For direct peer communication, use agent teams instead.',
    },
    {
      question: 'How many agents can a workflow manage?',
      answer:
        'A workflow can run up to 16 agents concurrently and coordinate up to 1,000 agents total across all iterations. This makes workflows ideal for large-scale, repeatable tasks. A single turn of subagents typically tops out at 3–5 delegations.',
    },
    {
      question: 'Are agent teams enabled by default?',
      answer:
        'No. Agent teams are experimental and disabled by default. To enable them, set the environment variable CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 before starting Claude Code.',
    },
    {
      question: 'What does "who holds the plan" mean?',
      answer:
        'The "orchestrator" is the entity that decides what runs next. With subagents, Claude decides turn-by-turn. With agent teams, the lead agent decides. With workflows, a JavaScript script holds the logic. This difference shapes the token cost, communication pattern, and scaling limit.',
    },
  ],
}
