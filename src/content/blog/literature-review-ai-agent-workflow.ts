import type { BlogPost } from '#/content/blog/types'

export const literatureReviewAiAgentWorkflowPost: BlogPost = {
  slug: 'literature-review-ai-agent-workflow',
  title: 'Literature review AI agent workflow: From months to weeks',
  description:
    'Automate systematic literature reviews with multi-agent workflows. Compress search, screening, and synthesis from 12+ months to weeks using AI agents for planning, evaluation, and analysis.',
  publishedAt: '2026-07-30',
  readingMinutes: 10,
  primaryKeyword: 'literature review ai agent workflow',
  keywordCluster: [
    'literature review ai agent workflow',
    'ai agents literature review',
    'systematic review automation',
    'multi-agent research pipeline',
    'automated literature review screening',
    'research synthesis ai agent',
  ],
  author: {
    name: 'Morgan Chen',
    role: 'Research engineer · AI systems',
    bio: 'Builds multi-agent systems for academic and industry research. Published on PRISMA-compliant AI-assisted review methodologies.',
  },
  tldr:
    'Systematic literature reviews take 12–18 months on average. The bottleneck is not expert judgment—it is volume: thousands of papers to screen, extract, and synthesize. Multi-agent workflows automate these mechanical steps using specialized agents for search planning, screening, data extraction, and synthesis. The pattern is human-guided automation: agents accelerate the pipeline, humans validate findings and own strategic interpretation.',
  relatedSlugs: ['ux-research-ai-agent-workflow', 'agent-workflow-template', 'document-ai-agent-workflows'],
  body: `
## The literature review bottleneck

Systematic reviews are foundational to evidence-based research. A literature review synthesizes existing work to answer a specific research question. But the process is slow:

1. Define research questions and inclusion/exclusion criteria (hours)
2. Search academic databases (journals, preprints, gray literature) (hours to days)
3. Screen titles and abstracts for relevance (days to weeks, thousands of papers)
4. Retrieve full papers and assess eligibility (days)
5. Extract structured data from selected papers (weeks to months)
6. Synthesize findings and write the report (weeks to months)

According to Cochrane, the median systematic review takes 11–18 months. Studies show researchers underestimate this by 69%. For PhD students and small teams, this timeline is unsustainable.

The mechanical work—screening, data extraction, initial synthesis—accounts for 70% of the labor. Expert judgment—deciding which studies matter, interpreting contradictions, building the narrative—takes less time. Yet most teams spend most effort on the mechanical steps.

A multi-agent workflow inverts this. Agents handle volume. Experts handle judgment.

## The multi-agent pattern

A literature review pipeline has five distinct phases. Rather than one agent doing all work, use specialized agents with different capabilities:

### Agent 1: The Search Planner

Define your research question precisely. The planner agent takes your question and generates a search strategy:

- Refines your research question for clarity and scope
- Identifies key concepts and synonyms (e.g., "literature review," "systematic review," "evidence synthesis")
- Generates search strings for each database (PubMed, Scopus, IEEE Xplore, arXiv)
- Suggests date ranges and document types to include or exclude
- Flags edge cases and ambiguous inclusion criteria

Result: a validated search strategy that reduces false negatives and false positives. You review and approve before proceeding.

### Agent 2: The Screening Agent

After your database searches return thousands of papers, the screener agent:

- Reads titles and abstracts against your inclusion criteria
- Scores each paper on relevance (0–100)
- Flags borderline cases for human review
- Deduplicates and organizes results
- Generates a screening report: papers accepted, rejected, flagged

Result: a shortlist of papers worth full-text review. Studies show AI-assisted screening reduces manual workload by 80–95%.

### Agent 3: The Eligibility Reviewer

For papers that passed screening, the reviewer agent:

- Reads full texts and assesses eligibility against detailed criteria
- Extracts key information: study design, population, intervention, outcomes
- Flags studies with data quality issues or methodological concerns
- Generates an eligibility report with accept/reject/conditional decisions

Result: a curated set of studies ready for data extraction. You spot-check rejections to ensure criteria were applied correctly.

### Agent 4: The Data Extractor

For accepted papers, the extractor agent:

- Reads the paper and identifies relevant data tables, figures, and text
- Extracts structured fields: authors, year, study design, sample size, outcomes, findings
- Converts results into a standardized format (CSV or JSON)
- Flags missing or unclear data
- Generates extraction quality checks

Result: a structured dataset ready for synthesis. The agent creates consistency where paper formatting varies wildly.

### Agent 5: The Synthesis Agent

After data extraction, the synthesis agent:

- Analyzes all extracted data to identify patterns and clusters
- Groups studies by outcome, population, or intervention
- Drafts summary tables and forest plots (if quantitative)
- Writes narrative synthesis: key findings, gaps, contradictions
- Highlights high-quality evidence vs. weak signals

Result: a first-draft synthesis. You review patterns, validate interpretations, and identify themes for the final report.

## How to set up the workflow

### Step 1: Define your research question

Use the PICO framework (Population, Intervention, Comparison, Outcomes):

- Population: Who are we studying?
- Intervention: What treatment, exposure, or phenomenon?
- Comparison: What is the alternative?
- Outcomes: What do we measure?

Example: "In software development teams (P), does using AI agents for code review (I) improve defect detection (O) compared to traditional peer review (C)?"

Document this clearly. Pass it to the search planner agent.

### Step 2: Run Agent 1: Search Planner

Prompt structure:

\`\`\`
You are a literature review search planner. I am conducting a systematic review on:

Research question: [PICO question]
Databases available: [PubMed, Scopus, IEEE Xplore, arXiv, etc.]
Date range: [e.g., 2020-2026]
Document types: [peer-reviewed journals, conference papers, preprints]
Inclusion criteria:
- [criterion 1]
- [criterion 2]

Generate a search strategy for each database, including:
- Key concepts and synonyms
- Boolean search strings (with AND/OR/NOT operators)
- Date and document type filters
- Rationale for each string

Also identify edge cases where the criteria are ambiguous.
\`\`\`

Save the output. Review for accuracy. Adjust as needed.

### Step 3: Conduct database searches

Use your access to PubMed, Scopus, or your institution's library. Export results as CSV or BibTeX. Aim for 500–5000 initial hits, depending on your topic.

### Step 4: Run Agent 2: Screening Agent

Prompt structure:

\`\`\`
You are a literature review screening agent. You will read titles and abstracts and score each on relevance to our research question.

Research question: [PICO question]
Inclusion criteria:
- [criterion 1]
- [criterion 2]

For each paper:
1. Read the title and abstract
2. Assign a relevance score (0–100; 70+ is likely relevant)
3. Note your reasoning in 1–2 sentences
4. Flag if the decision is uncertain (borderline cases)

Output a CSV with columns: [ID, Title, Abstract, Relevance Score, Reasoning, Flagged]

[Paste exported papers here]
\`\`\`

Review flagged papers manually. Adjust the scoring threshold based on false positives and false negatives.

### Step 5: Run Agent 3: Eligibility Reviewer

For papers scoring 70+, run the full-text eligibility assessment:

\`\`\`
You are an eligibility reviewer. For each full-text paper, assess it against our eligibility criteria.

Inclusion criteria:
- [criterion 1]
- [criterion 2]

Exclusion criteria:
- [exclusion 1]

For each paper:
1. Read the full text
2. Decide: ACCEPT, REJECT, or CONDITIONAL (needs clarification)
3. Note your reasoning and cite the relevant section of the paper
4. Extract key details: study design, sample size, outcomes, findings

Output a CSV with columns: [ID, Title, Decision, Reasoning, Study Design, Sample Size, Key Outcomes]

[Paste papers or attach PDFs]
\`\`\`

### Step 6: Run Agent 4: Data Extractor

For accepted papers:

\`\`\`
You are a data extraction agent. Extract structured data from each study.

I need:
- Author(s) and publication year
- Study design (RCT, cohort, survey, qualitative, etc.)
- Population (N, demographics)
- Intervention (what was tested)
- Comparison/control (if applicable)
- Primary outcome(s) and result(s)
- Secondary outcome(s) and result(s)
- Key limitations noted by authors
- Funding source

Output a JSON array with one object per paper, using these fields.

[Paste papers]
\`\`\`

### Step 7: Run Agent 5: Synthesis Agent

With extracted data:

\`\`\`
You are a synthesis agent. Analyze the extracted data and identify patterns.

Extracted data:
[Paste JSON]

For each major outcome:
1. List all studies that measured it
2. Report the direction and magnitude of effects
3. Identify studies with conflicting findings
4. Note study quality patterns (which designs had stronger effects?)
5. Highlight gaps in the literature (populations or settings not studied)

Output:
- Summary tables by outcome
- Narrative synthesis: key findings, patterns, contradictions, gaps
- Confidence assessment: which findings are robust?

Also generate a "dissent report": What did minority findings say? Are they credible?
\`\`\`

### Step 8: Validate and interpret

Review the synthesis. Challenge findings. Read 3–5 papers in detail to spot-check the extraction and synthesis. Ask:

- Did the agent miss any nuance in how results were reported?
- Are contradictions real or due to methodological differences?
- What is the quality of evidence for the main finding?

Then write the final review narrative. Use the agent's synthesis as scaffolding, but inject your judgment.

## Best practices

### PRISMA compliance

Your review should document the screening and selection process using the PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) framework. PRISMA is a 27-item checklist and a flow diagram showing the number of papers at each stage:

- Identification: records identified
- Screening: records after deduplication
- Eligibility: full texts assessed
- Inclusion: studies included in synthesis

The agents can generate these numbers automatically.

### Human-in-the-loop at each stage

Never skip the human review step. Agents will make errors. At screening, review a sample of 50 papers the agent marked as "reject" to ensure false negatives are minimal. At extraction, spot-check 5–10 papers for data accuracy.

### Manage edge cases

Inclusion criteria often have ambiguity. If screening produces a wide spread (e.g., 100 accepts, 1000 rejects, 500 flagged), you likely have criteria that are too strict or too vague. Clarify with the research team before proceeding.

### Version control your criteria

Document every decision. When you refine inclusion criteria mid-review, note the version and the rationale. This transparency is a PRISMA requirement.

### Archive everything

Keep all search strings, screening results, full-text PDFs, and extraction sheets. Future updates to the review will reuse this history.

## Common pitfalls

### Over-relying on agent screening

An agent might systematically miss papers outside the typical writing style. For example, if most papers use "systematic review" and you included "evidence synthesis" in your criteria, the agent might score papers using only "evidence synthesis" lower. Spot-check to avoid this bias.

### Losing methodological rigor

Agents can speed up the mechanical work, but they can introduce new errors. For instance, an extractor agent might misread a p-value or confuse a confidence interval with a range. Require the agent to cite its sources for every extracted value.

### Stopping synthesis too early

The agent identifies patterns. You interpret them. Dont settle for "Study A shows X, Study B shows X" as a finding. Ask: Why did they find that? Under what conditions does it hold? What did other studies disagree on? The synthesis is not the agent's summary—it is your judgment, informed by the data.

### Ignoring publication bias

AI agents accelerate the review, but they do not automatically detect publication bias (the tendency for journals to publish significant results and reject null findings). Manually assess whether the studies you found are likely a representative sample or a biased one.

## What to publish on Onie

When you build or refine a literature review agent workflow, share:

- Your PICO framework and inclusion criteria
- Your search strategy (search strings by database)
- Your screening, eligibility, and extraction prompts
- A sample extraction sheet (with data anonymized)
- Your PRISMA flow diagram
- Lessons learned (edge cases, refinements)

Document the pipeline so other researchers can fork it for their own reviews. If you use Claude or Cursor, include your skill prompts.

## Getting started

A multi-agent literature review workflow can compress a 12–18 month review to 4–8 weeks. The time you save moves from busywork to interpretation: reading papers deeply, challenging findings, building narrative.

Start with a pilot. Run screening on a batch of 500 papers. If the agent correctly flags 90%+ of true positives (papers that should advance), add the eligibility reviewer. Build the pipeline stage by stage, adjusting prompts as you learn what works for your domain.

Then share your workflow. The field needs more streamlined, AI-augmented reviews.
`.trim(),
  faqs: [
    {
      question: 'Can AI agents replace expert reviewers in a systematic review?',
      answer:
        'No. Agents automate the volume work (screening, extraction, initial pattern-finding), but they cannot make strategic decisions. Expert reviewers own the research question, inclusion criteria, and interpretation. The agent is a force multiplier: it handles 10,000 papers so experts can focus on the 100 that matter.',
    },
    {
      question: 'How do I ensure the screening agent does not introduce bias?',
      answer:
        'Spot-check the agent's decisions. Manually review a random sample of 50 papers it marked "reject" to measure false negative rate. If it is above 10%, refine your criteria or your screening prompt. Use a second human reviewer for borderline cases.',
    },
    {
      question: 'What if two agents disagree on a paper's relevance?',
      answer:
        'This is expected when criteria are ambiguous. When you see disagreement, clarify the criterion with your research team. Make a decision and move forward consistently. Document the decision for the PRISMA report.',
    },
    {
      question: 'How long does a full literature review take with agents?',
      answer:
        'Search planning: 2–4 hours. Database searches: 1–2 days. Screening 2000 papers: 4–8 hours (agent does this, you review sample). Full-text eligibility: 1–2 weeks. Data extraction: 2–3 weeks. Synthesis: 1–2 weeks. Total: 4–8 weeks vs. 12–18 months manually. The speedup scales with review size.',
    },
    {
      question: 'Can I use agents for qualitative research synthesis?',
      answer:
        'Yes, with modifications. For qualitative reviews, the screening and extraction agents work the same way, but synthesis requires a different approach. Instead of quantitative pooling, the synthesis agent identifies themes, frameworks, and conceptual patterns across papers. Human interpretation is even more critical.',
    },
    {
      question: 'What databases do AI agents work with?',
      answer:
        'Agents work best with structured data: CSV, BibTeX, JSON exports from PubMed, Scopus, IEEE Xplore, or arXiv. For proprietary databases requiring login, you can export results and run the agents locally (Claude Code, Cursor) to avoid sending credentials to external APIs. For full-text PDFs, use agents with document analysis capabilities.',
    },
    {
      question: 'How do I handle studies in non-English languages?',
      answer:
        'If your criteria include non-English papers, prompt the agent to translate abstracts and key sections for screening. For full-text extraction, you may need to manually review non-English studies or use a translation service first. Document your approach for PRISMA.',
    },
    {
      question: 'What if the agent extracts data inconsistently across papers?',
      answer:
        'This is common because study formatting varies. Require the agent to cite the exact section where it extracted each data point. In post-processing, run consistency checks: for example, verify that "p-value" fields contain numeric values less than 1. For inconsistencies, manually fix the source paper or re-run the agent with clearer extraction instructions.',
    },
  ],
}
