import type { BlogPost } from '#/content/blog/types'

export const uxResearchAiAgentWorkflowPost: BlogPost = {
  slug: 'ux-research-ai-agent-workflow',
  title: 'UX research AI agent workflow: Synthesis without losing insight',
  description:
    'Automate research synthesis with AI agents: transcription, thematic analysis, and report generation. Use multi-agent pipelines to accelerate UX research while maintaining methodological rigor.',
  publishedAt: '2026-07-29',
  readingMinutes: 9,
  primaryKeyword: 'ux research ai agent workflow',
  keywordCluster: [
    'ux research ai agent workflow',
    'ai agent ux research',
    'automated ux research synthesis',
    'research pipeline automation',
    'interview analysis with ai',
    'research report generation ai',
  ],
  author: {
    name: 'Jake Burghardt',
    role: 'UX researcher · Agent systems',
    bio: 'Leads AI-augmented research workflows at product companies. Contributor to grounded-theory agent patterns on Onie.',
  },
  tldr:
    'UX research involves repetitive work: transcription cleanup, thematic coding, report drafting. AI agents automate these steps, freeing researchers for strategic analysis and insight validation. The pattern is human-in-the-loop: agents handle synthesis, you validate and interpret. Using a multi-agent pipeline (guide creator, transcript cleaner, synthesis assistant), you maintain methodological rigor while cutting research turnaround by half.',
  relatedSlugs: ['literature-review-ai-agent-workflow', 'agent-workflow-template', 'document-ai-agent-workflows'],
  body: `
## The research bottleneck

User research is methodologically sound but operationally slow. A typical study looks like this:

1. Write a research plan and discussion guide (hours)
2. Conduct 5–8 interviews or usability sessions (days)
3. Transcribe and clean raw recordings (hours per session)
4. Read through transcripts, tag themes, write insights (many hours)
5. Draft and iterate the research report (hours)
6. Present findings to stakeholders (meeting)

Steps 3, 4, and 5—the synthesis phase—eat two-thirds of the timeline. Yet most of this work is structured: tagging code for patterns, writing summary paragraphs, organizing findings by theme. These are tasks where an AI agent excels. The bottleneck is not research judgment. It is busywork.

An AI-augmented workflow does not replace your thinking. It accelerates the mechanical steps so you spend more time on interpretation and less time on data wrangling.

## The multi-agent pattern

A research pipeline has distinct stages, each with different requirements. Rather than one agent doing everything, use specialized agents:

### Agent 1: The Guide Creator

You hand the agent a stakeholder brief: research goals, questions, hypotheses. The agent:

- Fine-tunes research questions for clarity and scope
- Suggests the right method (explorative vs. validation)
- Generates a discussion guide draft with hypotheses and probing questions
- Flags edge cases you might have missed

Result: a structured interview guide that is 80% ready. You refine it with domain knowledge.

### Agent 2: The Transcript Cleaner

Raw transcripts are messy. Audio stutters, speakers interrupt, names are misspelled, participants mumble. The cleaner agent takes a raw transcript and:

- Fixes grammar and structural issues
- Removes filler words and clarifies unclear passages
- Adds speaker labels and timestamps
- Anonymizes sensitive data (names, companies, internal terms)
- Flags sections where audio quality made transcription uncertain

Result: a structured, anonymized, analysis-ready transcript. You spot-check a few sections and move on.

### Agent 3: The Synthesis Assistant

This is the heavyweight. After you collect transcripts, the synthesis agent:

- Reads all transcripts and identifies recurring themes
- Groups quotes by theme for pattern matching
- Drafts insight statements with supporting evidence
- Writes a research report structure: executive summary, methodology, findings by theme, implications
- Flags contradictions or surprising patterns worth digging into

Result: a rough report with your first-pass analysis. Your job: validate, challenge, dig deeper. Does this theme hold up? What are the exceptions? What is the "why" behind each pattern?

## How to set up the workflow

### Step 1: Create a research project directory

Use your coding client (Claude Code, Cursor) to create a workspace for the study:

\`\`\`
research-study-2026-07/
├── 01-planning/
│   ├── stakeholder-brief.md
│   └── research-questions.txt
├── 02-guides/
│   └── discussion-guide.md
├── 03-sessions/
│   ├── session-1-raw.txt
│   ├── session-2-raw.txt
│   └── session-3-cleaned.txt
├── 04-analysis/
│   ├── theme-clusters.md
│   └── draft-insights.txt
└── 05-output/
    └── research-report.md
\`\`\`

### Step 2: Write a project brief

Paste stakeholder goals, your research questions, and any constraints (budget, timeline, compliance).

### Step 3: Run Agent 1: Guide Creator

Prompt structure:

\`\`\`
You are a research planning agent. I am planning a study on [topic].

Stakeholder goals: [paste]
Research questions: [paste]
Constraints: [paste]

Generate a discussion guide with:
- Refined research questions
- Hypothesis statements
- Probing questions (2–3 follow-ups per main question)
- Task scenarios (if applicable)
- Screen-out criteria

Also suggest the best research method and sample size.
\`\`\`

Save the output to guides/discussion-guide.md.

### Step 4: Conduct sessions and record

Use Marvin AI, Rev, or your platform's native recording. Export raw transcripts to sessions/.

### Step 5: Run Agent 2: Transcript Cleaner

For each raw transcript:

\`\`\`
Clean this research transcript for analysis. Do the following:

- Fix grammar and transcription errors
- Add speaker labels (Participant A, Researcher)
- Add timestamps [00:15] where relevant
- Anonymize names and company identifiers
- Remove filler words (um, uh, like) unless they carry emotional weight
- Flag [UNCLEAR] where audio quality prevented transcription

Keep all substantive content. Output a clean markdown.
\`\`\`

Save to sessions/session-N-cleaned.txt.

### Step 6: Run Agent 3: Synthesis Assistant

Once all transcripts are cleaned:

\`\`\`
You are a UX research synthesis agent. Analyze these interviews using grounded theory: identify recurring themes, group supporting quotes, and draft insights.

Read the transcripts:
[paste all cleaned transcripts]

Output a JSON structure:

{
  "themes": [
    {
      "theme": "name of pattern",
      "frequency": "# of participants who mentioned",
      "quotes": [quoted passages],
      "insight": "what this means for the product"
    }
  ],
  "contradictions": [
    {
      "pattern": "finding that some participants disagreed on",
      "examples": [quotes from both sides]
    }
  ],
  "implications": ["implications for design or product strategy"]
}
\`\`\`

### Step 7: Validate and interpret

Review the themes the agent surfaced. Challenge weak ones. Ask "why" on each insight. Dig into contradictions. Document your judgment calls.

Then write the final report. Use the agent's structure as a scaffold, but inject your strategic narrative.

## Best practices

### Human-in-the-loop validation

Never ship agent-generated insights without reading the source transcripts. Agents can misclassify a quote or invent a theme. Your job is to catch those errors and add nuance.

### Use direct quotes

Require the agent to include a direct quote for every insight. Insights without quotes are not evidence—they are speculation.

### Flag uncertainty

When the agent finds a weak pattern (only two mentions, conflicting details), ask it to say so. "This theme appeared in only 2 of 8 interviews. It might not be a product signal."

### Run evaluation checks

After the synthesis pass, ask the agent:

- "Which insights have the strongest evidence?"
- "Which insights appear in only one or two interviews?"
- "Are there patterns that contradict the majority?"
- "What questions would you ask to validate this theme?"

This turns synthesis into a rigorous process, not a summary.

### Keep the research brain

Agents can code themes. They cannot decide which themes matter for strategy. You still own the "so what" question. An agent might say "Participants struggled with the onboarding flow." You decide: Is this a priority? Is it a blocker for adoption or just a friction point?

## Integration with your tools

### Markdown and version control

Store all research artifacts in markdown in a git repo. This lets you version iterations, run diffs, and collaborate. Most coding agents can commit changes on your behalf.

### Plugins for Cursor and Claude Code

You can automate the full pipeline as a Cursor workflow or Claude Code plugin:

- A plugin called /research-brief parses your stakeholder goals
- A plugin called /synthesize reads cleaned transcripts and generates themes
- A plugin called /report-draft combines themes into a structured report

Each plugin encapsulates a stage of the workflow. You trigger them by slash command.

### Connect to design tools

Export insights to Figma, Miro, or your design tool via API. Tag findings by theme so design teams can filter findings by problem area.

## Common pitfalls

### Over-trusting the agent

An agent can hallucinateinsights. It might invent supporting quotes or cluster unrelated statements into a false theme. Always validate against transcripts.

### Losing the qualitative voice

Agents tend toward bullet points and abstract generalizations. Research reports need quotes, context, and the texture of how people actually speak. Rewrite the agent's prose to sound like real research.

### Skipping the methodological foundation

Grounded theory requires active search for disconfirming cases and triangulation. Agents can do this if you prompt for it explicitly. Require the synthesis agent to:

- Flag contradictions
- Identify participants who diverge from the pattern
- State confidence levels for each theme

### Not integrating stakeholder feedback

After synthesis, share draft insights with stakeholders and product teams. Their questions often reveal where the agent missed nuance or overstated a finding. Loop those insights back into the report.

## What to publish on Onie

When you build a research workflow, share:

- Your research brief template
- A sample cleaned transcript (with data anonymized)
- Your synthesis prompt structure
- A checklist for validating agent outputs

Document the pipeline so other practitioners can fork it for their own studies.

## Getting started

The full pipeline—briefing, guide generation, cleaning, synthesis, report—takes a researcher from a stakeholder request to draft findings in one-third the time of manual work. The time you save goes back into interpretation and strategy, not data entry.

Start with one study. Run the transcript cleaner on a single recorded session. If that saves 2–3 hours, add the synthesis assistant to your next batch of interviews. Build the pipeline piece by piece, and adjust the prompts based on what works for your research style.
`.trim(),
  faqs: [
    {
      question: 'Can AI agents replace UX researchers?',
      answer:
        'No. Agents automate the mechanical synthesis work (transcript cleanup, initial theme identification, report drafting), but they cannot make strategic judgments. Researchers own the interpretation, the "so what," and the decision about which themes matter for product. The agent is a labor multiplier, not a replacement.',
    },
    {
      question: 'How do I ensure the agent does not hallucinate insights?',
      answer:
        'Require every insight to be tied to a direct quote from the transcript. Validate the agent's themes against your own reading of a few transcripts. Flag weak patterns (mentioned by only 1–2 participants). Use evaluation checks to ask the agent itself which findings have strong vs. weak evidence.',
    },
    {
      question: 'What should I clean from transcripts before synthesis?',
      answer:
        'Fix grammar and transcription errors, add speaker labels, remove filler words (unless emotionally significant), anonymize names and companies, flag [UNCLEAR] sections. Keep all substantive content. The goal is a clean, analysis-ready transcript, not a perfect manuscript.',
    },
    {
      question: 'How long does a full research pipeline take with agents?',
      answer:
        'Planning and guide creation: 2–4 hours. Interviews: depends on count (5–8 sessions = 1–2 days). Transcript cleaning: 30 min per session. Synthesis and report: 4–6 hours. Total: 2–3 weeks for a full study vs. 4–5 weeks manually. The speedup compounds if you run multiple studies.',
    },
    {
      question: 'Can I use agents for both qualitative and quantitative research?',
      answer:
        'Agents excel at qualitative work (interviews, usability tests, open-ended surveys) where synthesis is manual and pattern-finding is subjective. For quantitative work, use statistical tools instead. Mix both: use agents to synthesize qualitative interviews, then survey a larger cohort on your findings.',
    },
    {
      question: 'How do I handle sensitive data in a research workflow?',
      answer:
        'The transcript cleaner agent should anonymize names, companies, and identifying details. Store raw recordings in a secure, access-controlled location. Use local agents (Claude Code, Cursor) if data cannot leave your network. Never send raw recordings to external APIs.',
    },
    {
      question: 'What if the agent misses a theme or clusters things incorrectly?',
      answer:
        'This is expected. Review the agent's synthesis against your own reading of at least 2–3 transcripts. Add missing themes. Split over-clustered themes. Use the agent's work as a first draft, not a final output. Your domain expertise corrects its blindspots.',
    },
    {
      question: 'Can I use this workflow for remote research?',
      answer:
        'Yes. Record sessions with Marvin AI, Rev, or your platform's native recording. Export transcripts and run them through the cleaning and synthesis pipeline. The workflow is platform-agnostic as long as you have transcripts.',
    },
  ],
}
