import type { BlogPost } from '#/content/blog/types'

export const agentWorkflowTemplatePost: BlogPost = {
  slug: 'agent-workflow-template',
  title: 'Agent workflow template: DOE pattern for reliability',
  description:
    'A production-ready template for structuring AI agent workflows. Separates directives (SOPs), orchestration (AI decisions), and execution (deterministic scripts) to eliminate error compounding.',
  publishedAt: '2026-07-19',
  readingMinutes: 12,
  primaryKeyword: 'agent workflow template',
  keywordCluster: [
    'agent workflow template',
    'agent workflow example',
    'how to structure ai workflows',
    'DOE framework',
    'workflow automation template',
    'claude code workflow template',
  ],
  author: {
    name: 'Mason Munoz',
    role: 'Agent systems engineer · Cursor',
    bio: 'Builds production agent workflows that survive model updates and tool API changes. Open-sourced the DOE pattern to eliminate hallucination compounding in multi-step tasks.',
  },
  tldr:
    'Split your agent workflows into three layers: Directives (Markdown SOPs defining "what to do"), Orchestration (the AI making decisions and routing tasks), and Execution (deterministic scripts doing the actual work). This DOE pattern prevents error compounding, makes workflows debuggable, and lets you swap model or tool providers without rewriting everything.',
  relatedSlugs: [
    'document-ai-agent-workflows',
    'claude-code-workflow-examples',
    'how-to-write-claude-code-skills',
  ],
  body: `
## Why most agent workflows fail in production

Most agent setups start as a single prompt in Claude or Cursor. The AI reads context, decides what to do, and executes — all in one box. For one-off tasks this works. For repeatable workflows it breaks.

When the model hallucinates, you do not know which layer failed: the instruction, the AI's reasoning, or the script itself. When the LLM API changes, you have to rewrite everything. When a junior joins, they see a prompt blob with embedded logic instead of a system they can debug or improve.

**Agent workflow template** means splitting the work into three separate, testable, swappable layers. This is the DOE pattern.

## Layer 1: Directives (the SOPs)

A Directive is a plain-text SOP in Markdown describing the **what**, not the **how**. Think of it as instructions for an employee who takes initiative.

Example directive: \`directives/summarize_url.md\`

\`\`\`markdown
# Summarize a URL

## Goal
Extract the main ideas from a web page into a one-paragraph summary and a bulleted takeaway list.

## Input
- URL (string)
- Optional: max word count for summary (default 150)

## Steps
1. Fetch the page and extract main content (ignore nav, ads, footer).
2. Identify the primary topic and supporting points.
3. Write one paragraph (50–150 words) capturing the main argument.
4. Extract 3–5 bullet points of key takeaways.

## Output
\`\`\`json
{
  "summary": "...",
  "takeaways": ["...", "..."]
}
\`\`\`

## Verification
- Summary contains the URL's primary claim without citations.
- Takeaways are actionable (nouns + conclusions, not questions).
- Word count is within the limit.

## Failure mode
If page is paywalled or blocked, return HTTP status in error.
\`\`\`

Notice: no code, no API calls, no model-specific prompting. Just what to do and how to verify. The Directive is a contract.

### Why separate directives?

- **Reusable:** Use the same summarize directive with Claude, Gemini, Windsurf.
- **Versionable:** Track changes to the SOP independently from code.
- **Debuggable:** If the summary is wrong, you know it is a reasoning problem, not a script bug.
- **Testable:** A human can follow the directive and produce output; compare that to the AI's work.

## Layer 2: Orchestration (the AI agent)

The Orchestration layer is the AI reading a Directive, deciding what to do, coordinating steps, and handling errors.

In Claude Code or Cursor, this means:

1. **Read the directive:** Agent loads the SOP as context.
2. **Parse inputs:** Extract and validate what the user wants.
3. **Plan:** Map directive steps to execution calls.
4. **Execute:** Call scripts or API functions; route output back to directive verification.
5. **Handle errors:** If a script returns 429 or a validation fails, implement retry or fall-back logic.
6. **Learn:** Update the directive or execution script based on what broke.

The AI does **not** invent new steps or skip verification. It follows the Directive contract.

Example orchestration in Claude Code:

\`\`\`typescript
// Load directive as context
const directive = readFile('directives/summarize_url.md')

// Orchestrate: read input, validate, plan, execute
const url = getUserInput()
const result = await executeSummarizeUrl(url) // Call Layer 3 script

// Verify output matches contract
if (!result.summary || result.takeaways.length === 0) {
  retry() // Directive verification failed; try again
}

return result
\`\`\`

The Orchestrator is **not** a free-form thinker; it is a rules engine guided by the Directive.

## Layer 3: Execution (deterministic scripts)

Execution scripts are Python, TypeScript, Bash — code that **cannot hallucinate**. API calls, file parsing, data transformations.

Example execution: \`execution/summarize_url.py\`

\`\`\`python
import requests
from urllib.parse import urlparse

def fetch_and_extract(url: str) -> dict:
    """Fetch a URL and return HTML content."""
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return {"content": response.text, "status": response.status_code}

def validate_input(url: str) -> bool:
    """Ensure URL is well-formed."""
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except Exception:
        return False
\`\`\`

Notice:

- **No inference:** The script fetches and parses; it does not decide what to extract.
- **Testable:** Run in isolation, mock the API, measure performance.
- **Reusable:** Any orchestrator (agent or script) can call this function.
- **Error-safe:** Explicit raises on failure; no silent hallucinations.

## Putting it together: workflow diagram

\`\`\`
┌──────────────────────────────────────────────────────┐
│ User Input                                           │
│ "Summarize https://example.com"                      │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│ Layer 2: Orchestration (Claude Code / Cursor)        │
│ - Load Directive: summarize_url.md                   │
│ - Parse & validate input                             │
│ - Call execution/summarize_url.py                    │
│ - Check output vs. Directive verification             │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│ Layer 3: Execution (Python script)                   │
│ - Fetch URL (requests library)                       │
│ - Parse HTML (BeautifulSoup or similar)             │
│ - Return structured data                             │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────┐
│ Layer 1: Directive (SOP reference)                   │
│ - Verification: summary < 150 words                  │
│ - Verification: 3–5 takeaways                        │
│ - If failure: retry or error response               │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────────┐
         │ Output (JSON)           │
         │ {                       │
         │   "summary": "...",     │
         │   "takeaways": [...]    │
         │ }                       │
         └─────────────────────────┘
\`\`\`

## When DOE saves you

### Scenario 1: Model changes

You trained the orchestrator on GPT-4o. Anthropic releases Claude 4 with 10x lower latency. With DOE, swap the model in Layer 2; directives and scripts are model-agnostic.

### Scenario 2: Tool API breaks

An execution script calls a deprecated API. Fix the script; directives and orchestrator logic do not change. The AI reads the same SOP and asks, "What changed?" — not rebuilding from scratch.

### Scenario 3: Hallucination in multi-step workflows

Step 1 adds data to a database. Step 2 is supposed to query that data. If the AI hallucinates and queries the wrong table, the execution layer catches it and raises an error. The Directive's verification step retries with corrected context.

### Scenario 4: Onboarding a new person

A new engineer asks, "How does the email workflow work?" You hand them \`directives/send_newsletter.md\`. They read the SOP, understand the contract, ask "where's the implementation?" — and you point to \`execution/send_newsletter.py\`. No tribal knowledge.

## Template file structure

\`\`\`
my-workflow/
├── CLAUDE.md                      # Entry point for Claude Code
├── AGENTS.md                      # Mirror for other AI tools
├── directives/                    # Layer 1: SOPs
│   ├── _TEMPLATE.md              # Template for new directives
│   ├── summarize_url.md
│   ├── enrich_lead.md
│   └── approve_expense.md
├── execution/                     # Layer 3: Scripts
│   ├── _TEMPLATE.py              # Template for new scripts
│   ├── summarize_url.py
│   ├── fetch_lead_data.py
│   └── email_approver.py
├── .env                           # API keys (gitignored)
└── tests/                         # Optional: test cases for scripts
    ├── test_summarize_url.py
    └── test_fetch_lead_data.py
\`\`\`

The CLAUDE.md is your entry point. It tells Claude Code the project name, stack, which directives are active, and which skills or MCP servers to load.

Example CLAUDE.md:

\`\`\`markdown
# My Agent System

## Stack
- Model: Claude Code
- Language: Python 3.11
- APIs: Stripe, HubSpot, OpenAI Embeddings

## Active Workflows
1. Summarize URL → \`directives/summarize_url.md\`
2. Enrich lead → \`directives/enrich_lead.md\`

## Rules
- All output must match the Directive's output contract.
- Execution scripts must have tests.
- Never skip Directive verification.
\`\`\`

## Anti-patterns to avoid

**Don't:** Embed multiple Orchestration loops in one script. Orchestration should live in the AI or a top-level coordination script, not in execution scripts.

**Don't:** Have Directives reference specific model versions. Directives should describe the **what**, not "use temperature=0.7."

**Don't:** Skip verification. If the Directive says "output must have 3+ takeaways," the Orchestrator must check before returning. Silent failures compound downstream.

**Don't:** Mix concerns in execution scripts. One script = one job. If you are fetching data **and** transforming **and** sending email, split it.

## Getting started: build one workflow

Pick a task your team runs every week — data cleanup, report generation, lead enrichment. Write it using DOE:

1. **Directive:** SOP describing the task in human terms.
2. **Execution:** Python or bash script doing one job.
3. **Orchestration:** Claude Code gluing them together.

Run it once manually. Does it work? Great — now run it 10 times. Did it stay reliable? That is your signal that DOE is working.

From there, document it and [publish on Onie](/app/explore) so other teams can fork and adapt.

## DOE in production teams

AWS's agentic AI guidance calls this "decomposed workflows" — separate concerns so you can test, version, and swap pieces without rebuilding the whole system. See [Agentic AI Lens — Agents as Software](https://docs.aws.amazon.com/wellarchitected/latest/agentic-ai-lens/agentsus03-bp03.html) for the enterprise playbook.

Onie hosts workflows tagged by field — UX research, SaaS growth, developer tools — so you can fork a working DOE template and customize it for your stack.
`.trim(),
  faqs: [
    {
      question: 'What is the DOE pattern?',
      answer:
        'DOE stands for Directives, Orchestration, Execution. Directives are Markdown SOPs describing what to do. Orchestration is the AI reading directives and making decisions. Execution is deterministic code (Python, bash) that cannot hallucinate. Separating these layers lets you swap models, debug failures, and version workflows independently.',
    },
    {
      question: 'When should I use a Directive instead of putting everything in the prompt?',
      answer:
        'Use a Directive when the workflow will repeat, you need to version it, or you want teammates to understand it without reading code. A single Claude Code prompt works for one-off tasks. A Directive + Execution works for production workflows that need to survive model changes.',
    },
    {
      question: 'How do I test a workflow built with DOE?',
      answer:
        'Test each layer independently. For Execution scripts, write unit tests (pytest for Python). For Orchestration, run the full workflow with mock inputs and check the output matches the Directive contract. For Directives, have a human follow the SOP and compare their output to the AI\'s.',
    },
    {
      question: 'What goes in the Directive vs. the Execution script?',
      answer:
        'The Directive describes the goal, inputs, verification, and failure modes in human language. The Execution script does the API calls, file I/O, and data transforms. If a decision requires reasoning, put it in the Directive and let the Orchestrator handle it.',
    },
    {
      question: 'Can I use DOE with Claude Code, Cursor, or Windsurf?',
      answer:
        'Yes. DOE is model and tool agnostic. Any AI that can read a file and call a function can orchestrate. You can even use it with bash scripts and GitHub Actions for non-AI workflows.',
    },
    {
      question: 'How do I version a workflow?',
      answer:
        'Keep a CHANGELOG in the root directory. When you update a Directive or Execution script, note the date, what changed, and why. This lets teammates know whether their fork is still compatible with new versions.',
    },
    {
      question: 'What should I do if the Orchestration layer fails?',
      answer:
        'Check if it is a reasoning error (AI misunderstood the Directive) or an execution error (script returned bad data). If the AI repeatedly skips steps or misinterprets the SOP, clarify the Directive language. If the script crashes, add better error handling.',
    },
    {
      question: 'Where can I publish a workflow template?',
      answer:
        'Publish on [Onie](/app/explore) with discipline and tool tags so other practitioners can find, fork, and adapt it. You can also open-source it on GitHub or keep it in a private team repository.',
    },
  ],
}
