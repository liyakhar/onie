import type { BlogPost } from '#/content/blog/types'

export const saasMvpAgentWorkflowPost: BlogPost = {
  slug: 'saas-mvp-agent-workflow',
  title: 'SaaS MVP with AI agents: Ship a workflow, not a tool',
  description:
    'Build a SaaS MVP by automating a single paycheck-attached workflow with AI agents. Shadow operators, spec minimal agents, validate with evals, sell pilots. From idea to pilot in 30 days.',
  publishedAt: '2026-07-31',
  readingMinutes: 10,
  primaryKeyword: 'saas mvp agent workflow',
  keywordCluster: [
    'saas mvp agent workflow',
    'ai agent saas business model',
    'how to build agent saas',
    'minimal useful agent',
    'agent-first product',
    'saas product with ai agents',
  ],
  author: {
    name: 'Alex Chen',
    role: 'Founding engineer · Agent products',
    bio: 'Built three agent-first SaaS products to paying pilots. Writes on architectural patterns for agent workflows at scale.',
  },
  tldr:
    'Agent-first SaaS competes with payroll, not software budgets. The fastest path from idea to paying customer is to pick one repetitive workflow where work has a clear finish line, shadow humans doing it, build a minimal agent (draft-and-approve or triage), validate with an eval set of 50 real examples, and sell pilots before productizing. This workflow-first approach ships MVPs in 30 days.',
  relatedSlugs: ['agent-workflow-template', 'document-ai-agent-workflows', 'ux-research-ai-agent-workflow'],
  body: `
## The shift: From tool SaaS to workflow SaaS

Traditional SaaS sells software. You build a dashboard, charge per seat, compete with other software budgets.

Agent SaaS sells completed work. You automate a paycheck-attached job—one operators do repeatedly, one your customers already pay for. You compete with payroll, not software spend.

The addressable market is different. Software budgets are millions. Labor is a multi-trillion dollar market.

The business model is radically simpler. If a business pays a human $50K/year to answer phones, book appointments, and route calls, you charge $15K/year to replace that work. The math is transparent. Customers get a payoff calculation before they sign.

## The core pattern: Pick a workflow with money attached

Not all workflows are equal. Start where you know a business is hemorrhaging money today.

A good agent workflow has five traits:

1. **It happens all day.** Daily is fine. Hourly is better. Every inbound lead. Every call. Every chat. Every ticket that lands in a queue.
2. **It has a clear finish line.** The job got booked. The ticket got categorized. The quote got sent. The handoff happened. You know when it's done.
3. **It touches existing software.** Gmail, Slack, Shopify, HubSpot, Zendesk, Stripe. Your agent needs tools to use and context to pull from.
4. **The edge cases are annoying but learnable.** Too simple and a Zapier zap does it. Pure judgment and your v1 breaks. You want repetitive work with enough judgment that AI actually helps.
5. **The buyer feels the loss immediately.** Missed calls cost them money. Dropped leads sink deals. Slow replies mean customers go to competitors. The pain is visceral.

Real examples:

- **Home services.** Roofers, plumbers, HVAC. Inbound calls during business hours go unanswered because the dispatcher is already on a job. Missed calls are lost revenue. An agent answers, asks two qualifying questions, checks service area, books the appointment.
- **Restaurants.** The phone rings during dinner rush. Host is seating people. Private dining calls get routed to voicemail. An agent answers, checks capacity, handles reservations, escalates VIPs.
- **Insurance agencies.** Lead follow-up is critical and manual. Agents get assigned, then agents forget to call back unless someone sends a reminder. An agent reads lead notes, calls prospects, books intro calls for humans to close.

Write down 20 workflows your target niche complains about. Then score each one: How often does it happen? How expensive is the pain? How clearly do you know when it's done? What tools does it touch? Who owns the budget?

That last question is the one most builders skip. If the workflow is owned by a department head with a budget line, you are in.

## Step 1: Shadow the operator

Before you write a prompt. Before you code. Watch a human do the job 10 to 20 times. Ask them to screen record. Ask them to narrate their thinking.

Pay them for their time if you have to.

Ask:

- What makes a case easy?
- What makes a case weird?
- What do you check before you decide?
- Where do the mistakes happen?
- What information do you need right now to do this faster?

The restaurant host answering "what time are you open?" is actually handling much deeper work. They know when the kitchen closes, which tables fit strollers, when the patio is shut, how to spot a VIP caller, how to ask follow-up questions that get you the right reservation time.

The detail is the product.

Document what you learn. You are building your eval set.

## Step 2: Spec the agent in seven parts

Once you understand the workflow, write down:

1. **What wakes it up.** An inbound call. An email. A form submission. A Slack message.
2. **What context it needs.** Call history. Customer record. Appointment calendar. Service area map. Inventory.
3. **What tools it can use.** Make a call. Send an email. Query a database. Create a record. Update a CRM.
4. **What it can do alone.** Answer FAQ questions. Route a lead. Check availability. Send a reminder.
5. **Where it needs approval.** Before anything permanent. Before anything expensive. Charges over $50. Refunds. Account deletions.
6. **When it escalates to a human.** Angry tone. Unclear intent. Out-of-scope request. Anything that breaks the pattern.
7. **What success looks like.** Metrics for your eval: appointment booked. Lead qualified. Refund approved. Task routed correctly.

Build the spec as a markdown document. Share it with someone who does the job. Ask them: "Is this what you do?"

## Step 3: Run the workflow manually first

Before you write code, run the workflow with Claude or ChatGPT manually. This is day five of your 30-day plan.

Copy-paste the spec and a few examples into Claude Code. Run the workflow on 5–10 real cases. A human approves the output before it ships.

This answers the core question: Does AI actually help? Does this workflow speed up the job or just add hallucinations?

If the manual run works, you have a candidate. If it fails, you learn what you misunderstood.

## Step 4: Build the minimal useful agent

Most people hear "agent" and imagine a fully autonomous employee. That breaks in production every time.

Start smaller. There are four tiers, from most constrained to most autonomous:

1. **Draft and approve.** The agent reads context, drafts the reply or action, a human approves. Great when there is risk or creativity. Example: Draft an email response to an angry customer. Human hits "send" or edits first.
2. **Triage.** The agent classifies inbound work and routes it. Maintenance request vs billing issue vs refund. It does not do the work. It sorts it.
3. **Coordinator.** It sits between systems and people. Check calendar availability. Send a reminder to a human. Chase missing information. Escalate if stuck.
4. **Bounded action.** One specific thing under clear rules. Book an appointment if the slot is open. Send a follow-up if five days have passed. Process refunds under $50.

Start at tier 1 or 2. Do not aim for full autonomy on day one. You earn autonomy as you prove the workflow works.

## Step 5: Build your eval set

This is your most powerful tool. Build a set of 50 real examples—50 calls, 50 leads, 50 tasks from your customer's actual workflow.

For each example, mark the right answer. If it is a call: What is the correct routing? If it is a lead: Should it be qualified? If it is an appointment: What is the correct time and confirmation message?

Run your agent against all 50. Count passes and failures. Understand why each failure happened.

This is not a vanity metric. This is your gym. Every time you change the prompt, the model, or the tools, run it again. Every time a customer hits a weird edge case, add it to the eval set.

You will also use the eval set in your pitch:

"We tested this on 50 of your old service requests. It routed 42 correctly, flagged 8 for human review, and made 2 mistakes. Here are the two mistakes and what we changed."

That wins deals better than any demo.

## Step 6: Build the wrapper

The agent does the work. The wrapper builds the trust.

Customers need to see what happened. Your product needs:

- **Logs.** Every action the agent took. Every escalation.
- **Approvals.** A queue of decisions awaiting human sign-off.
- **Settings.** A way for the customer to change rules. Confidence thresholds. Handoff targets. Escalation conditions.
- **A test mode.** A way to run the agent on historical data before it goes live.

Start here. This is where you live after the agent works.

## Step 7: Sell pilots

Do not wait for the product to be perfect. Sell pilots.

Pick three customers in one niche. Same niche, same workflow, same pain. Sell the outcome, not the tech: "We will answer and qualify your missed calls."

Run the workflow manually with AI for the first pilot. You are not building software yet. You are running the automation by hand, one case at a time. This is week 2.

Real pricing examples:

- $1,500 setup + $1,000/month for one workflow
- $2,000 setup + $30 per qualified lead
- $3,000/month for up to 500 handled tickets

Compare that to a receptionist's salary. The math is obvious.

Track what the customer values. Where does the agent break? What needs approval? What would they miss if you took it away?

## Week 3–4: Productize the repeat

If every roofer in your niche needs the same call script, qualification checklist, scheduling confirmation, and follow-up timing—you have a product. You earned the software by doing the work first.

This is the builder's secret: service first, product second.

Ship with logging, approvals, and settings. Do not ship with full autonomy. Do not ship with fifteen integrations. Ship with the single workflow that passed your eval, a way to test it, and a kill switch.

## Common mistakes

### Building for autonomy too early

Fully autonomous agents sound good in demos. They break in production. Start with draft-and-approve or triage. Earn the right to autonomy by proving the workflow works at lower autonomy first.

### Skipping the eval set

Do not ship without testing against 50 real examples. Do not call a customer "production ready" until your agent passes 80%+ of your eval. The eval set is the difference between a prototype and a product.

### Too many tools

Give your agent 2–5 tools, not twenty. More tools = more hallucinations. More hallucinations = customer does not trust it. Start narrow. Add tools after you prove the core workflow.

### Shipping before you understand the job

This is the big one. Builders who shadow the job, ask questions, watch edge cases, and talk to operators win. Builders who prompt GPT and ship lose. Spend a week shadowing. It will save you three months of iteration.

### Forgetting the human handoff

The agent does not replace the human. It surfaces the work the human needs to see. Build the handoff first: how does the agent escalate? What does the human actually do? What does the human need to make a decision quickly? This is where evals also matter—your eval set should include "hard cases that humans should review."

## What to publish on Onie

Once you have a working workflow, share your patterns:

- Your workflow spec template
- A sample eval set (with customer data anonymized)
- Your prompt structure for this agent type
- A checklist for shipping agent workflows
- A breakdown of your pricing model

Document it so other practitioners can fork it for their own niches.

## The 30-day timeline

- **Day 1–3:** Pick a niche and a workflow. Interview operators.
- **Day 4:** Write the spec and eval set structure.
- **Day 5:** Run the workflow manually with Claude.
- **Day 6–7:** Build a tiny agent. Test it on 10 real cases.
- **Week 2:** Sell two pilots. Pitch with the manual workflow, not the code.
- **Week 3:** Add the wrapper (logs, approvals, settings). Run your eval set every day.
- **Week 4:** Launch to customers. Instrument failures. Measure success rate weekly.

The hard part is not the tech. It is understanding the job. Spend your time on shadowing, not coding.
`.trim(),
  faqs: [
    {
      question: 'What is the difference between agent SaaS and tool SaaS?',
      answer:
        'Tool SaaS (like Slack or Notion) sells software features and charges per seat. Agent SaaS sells completed work and competes with payroll. A tool SaaS customer asks "how much time will this save?" An agent SaaS customer asks "what does this cost vs. my current hire?" Agent SaaS has a clearer ROI.',
    },
    {
      question: 'How do I know if a workflow is paycheck-attached?',
      answer:
        'Ask: Is someone currently paid to do this job? If a business pays a human $50K/year, a dispatcher $60K/year, or an agency $5K/month for this work, it is paycheck-attached. That is your pricing ceiling.',
    },
    {
      question: 'Can I build an agent SaaS without shadowing operators?',
      answer:
        'You can try, but you will miss edge cases and build the wrong thing. Shadowing is the highest-ROI investment you can make. Spend a week following operators. You will learn what your prompts need to handle and where the real pain lives.',
    },
    {
      question: 'What should my eval set include?',
      answer:
        'Fifty real examples of the workflow you are automating, from your customer or a similar niche. For each, mark the correct answer: the right routing, the right decision, the right output. Include edge cases and hard calls. This is your test suite.',
    },
    {
      question: 'How autonomous should my first agent be?',
      answer:
        'Start at draft-and-approve or triage. Do not aim for full autonomy day one. You earn autonomy by proving the workflow works at lower autonomy first. Full autonomy too early = broken production demos and lost deals.',
    },
    {
      question: 'What is the typical pricing for an agent workflow?',
      answer:
        'Anchor to payroll. If you are replacing a $50K/year job, a reasonable SaaS price is $15K–$20K/year. If you are replacing a $100/month agency task, charge $30–50/month. The baseline is always "what does this work currently cost the customer?"',
    },
    {
      question: 'Do I need to build a complex product on day one?',
      answer:
        'No. Start with logs, approvals, settings, and a test mode. That is enough. Do not build multi-tenancy, advanced analytics, or fifteen integrations before you have three paying customers. Ship the minimal product and iterate based on customer feedback.',
    },
    {
      question: 'How long does it take to go from idea to paying customer?',
      answer:
        'Using this workflow-first approach: 30 days to a pilot. 60–90 days to productizing the pilot into repeatable customers. 6 months to product-market fit. This timeline assumes you are shadowing early, selling pilots without a finished product, and iterating based on customer feedback.',
    },
  ],
}
