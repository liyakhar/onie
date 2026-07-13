import { PrismaClient } from '../prisma/generated/node/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from 'better-auth/crypto'
import { DEMO_ACCOUNTS } from '../src/lib/demo-accounts.ts'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const LEGACY_DEMO_IDS = [
  'demo-ux-designer',
  'demo-saas-builder',
  'demo-scientist',
]

const LEGACY_POST_IDS = ['post-ux-research', 'post-saas-mvp', 'post-science-lit']

type SeedPost = {
  id: string
  authorId: string
  title: string
  description: string
  category:
    | 'UX_UI'
    | 'ENGINEERING'
    | 'SAAS'
    | 'MOBILE'
    | 'CONTENT'
    | 'DEVOPS'
  kind: 'WORKFLOW' | 'SKILL' | 'PLAYBOOK' | 'PROMPT' | 'SETUP' | 'TEMPLATE'
  tools: string[]
  content: string
}

const POSTS: SeedPost[] = [
  {
    id: 'post-liya-ui-audit',
    authorId: 'demo-liya-k',
    title: 'Frontend design skill: audit any screen in 15 minutes',
    description:
      'A Cursor skill inspired by the popular frontend-design pattern — typography, spacing, hierarchy, and “does this feel shipped?”',
    category: 'UX_UI',
    kind: 'SKILL',
    tools: ['Cursor', 'SKILL.md', 'Claude', 'Figma screenshot'],
    content: `## What this solves
You inherit a UI that “works” but feels off. This skill runs a structured visual audit before you touch code.

## Skill outline (\`skills/frontend-audit/SKILL.md\`)
\`\`\`markdown
# Frontend audit
When the user shares a UI screenshot or route:
1. List 3 hierarchy issues (size, weight, contrast)
2. Flag spacing rhythm breaks (8px grid violations)
3. Name 2 quick wins under 30 minutes
4. Suggest one “delight” micro-interaction if appropriate
Never propose a full redesign unless asked.
\`\`\`

## Workflow
1. Paste screenshot or run \`pnpm dev\` and capture the route
2. Invoke the skill in Cursor agent mode
3. Apply quick wins in a single PR
4. Re-run audit on the diff

## Why it spreads
Teams on r/Cursor and skills.sh keep remixing this pattern because it’s **bounded** — audit, don’t rewrite.`,
  },
  {
    id: 'post-liya-research-skill',
    authorId: 'demo-liya-k',
    title: 'UX research synthesis skill (interviews → themes → readout)',
    description:
      'Turn messy interview notes into themes, quotes, and a stakeholder readout — the workflow designers on X keep asking for.',
    category: 'UX_UI',
    kind: 'WORKFLOW',
    tools: ['Claude', 'Cursor', 'Notion', 'SKILL.md'],
    content: `## Harness
- \`/research/raw/\` — one markdown file per interview
- \`skills/ux-synthesis/SKILL.md\` — theme extraction + quote bank rules

## Steps
1. Drop transcripts into \`/research/raw/\`
2. Run synthesis per file → \`/research/themes/\`
3. Merge themes; dedupe with “same pain, different words” rule
4. Generate 1-page readout: **So what / Now what / Open questions**

## Prompt snippet (popular on Reddit design threads)
> “Extract pains as verbs users say aloud. Every theme needs ≥2 quotes. Flag contradictions instead of smoothing them.”

## Output artifact
Shareable Notion page + Slack summary block.`,
  },
  {
    id: 'post-sasha-triage-bot',
    authorId: 'demo-sasha-zelts',
    title: 'Support ticket → repro → fix loop (in-house automation)',
    description:
      'How we close user-reported bugs faster: classify tickets, pull logs, draft patches, and ping CS when fixed.',
    category: 'ENGINEERING',
    kind: 'WORKFLOW',
    tools: ['Claude Code', 'Linear', 'GitHub Actions', 'Slack webhook'],
    content: `## Problem
Users report “it broke” with vague steps. Engineers burn time reproducing.

## Automation stack
1. **Intake** — Zendesk/Intercom webhook → \`/triage/incoming.json\`
2. **Classify** — agent tags: repro-ready / needs-logs / duplicate / feature-request
3. **Repro harness** — if logs attached, agent writes minimal repro script
4. **Patch draft** — branch \`fix/ticket-{id}\`, smallest diff, test note
5. **Close loop** — merge → notify CS with user-facing summary

## Guardrails
- Never auto-merge to main
- Human approves anything touching auth or billing
- Duplicate detector compares stack traces + route + user agent

## Result
Median time from ticket → verified fix dropped from ~3 days to same-day for top quartile issues.`,
  },
  {
    id: 'post-sasha-bug-playbook',
    authorId: 'demo-sasha-zelts',
    title: 'Playbook: weekly bug burndown with agents',
    description:
      'Friday ritual — scrape open bugs, cluster by root cause, assign agent-assisted fixes to on-call.',
    category: 'DEVOPS',
    kind: 'PLAYBOOK',
    tools: ['Linear API', 'Claude', 'Cursor', 'Datadog'],
    content: `## Weekly cadence (60 min)
| Block | Owner | Agent job |
|-------|-------|-----------|
| 0–10m | On-call | Export open bugs + error spikes |
| 10–25m | Team | Cluster by root cause (not symptom) |
| 25–45m | Pair | Agent drafts fix + test for top cluster |
| 45–60m | Lead | Pick 2 merges, defer rest with reason |

## Agent prompt (internal)
\`\`\`
Given stack trace + last deploy diff:
- Hypothesis in one sentence
- Smallest code change
- Regression test name
- Rollback note
\`\`\`

## Metric we track
**% bugs closed with user confirmation** — not just merged PRs.`,
  },
  {
    id: 'post-mathiew-48h-mvp',
    authorId: 'demo-mathiew-builds',
    title: '48-hour MVP: idea → deployed app',
    description:
      'The loop I use to ship a working product before the weekend — PRD, schema, UI, deploy, smoke test.',
    category: 'SAAS',
    kind: 'PLAYBOOK',
    tools: ['Claude Code', 'TanStack Start', 'Prisma', 'Railway', 'Cloudflare'],
    content: `## Day 1 (AM) — Decide
- 30-min problem interview notes → 1-page PRD
- Cut scope until **one painful workflow** remains
- Pick stack you’ve shipped before (mine: TanStack Start + Postgres)

## Day 1 (PM) — Skeleton
- \`pnpm create\` → auth stub → one model → one list view
- Deploy to staging before dinner (forces env discipline)

## Day 2 — Polish + ship
- Happy path only; no settings page yet
- Seed demo data; record 90-sec Loom
- Production deploy + error monitoring

## Agent rules that matter
- Commits every 20–30 min
- “No abstractions until second use”
- Run \`pnpm test\` before calling a task done

## Proof
Last month: niche B2B form tool — **Thursday idea, Saturday paid pilot**.`,
  },
  {
    id: 'post-mathiew-stack-template',
    authorId: 'demo-mathiew-builds',
    title: 'My “start repo” template for week-long products',
    description:
      'Auth, DB, email, OG tags, and deploy scripts pre-wired so agents don’t reinvent the wheel.',
    category: 'SAAS',
    kind: 'TEMPLATE',
    tools: ['Better Auth', 'Prisma', 'TanStack Start', 'shadcn/ui'],
    content: `## What’s in the box
\`\`\`
/app          — feed + explore
/auth         — email + Google optional
/prisma       — User, Post, Profile
/scripts      — seed + deploy
\`\`\`

## First agent task every project
> “Read README. Implement feature X without new dependencies. Match existing patterns.”

## Checklist before launch
- [ ] \`BETTER_AUTH_SECRET\` rotated
- [ ] DB migrations applied
- [ ] OG image + meta on marketing page
- [ ] Seed demo accounts for empty feed

## Time saved
~1 day per project vs scaffolding from zero.`,
  },
  {
    id: 'post-matios-widget-loop',
    authorId: 'demo-matios-apps',
    title: 'Flutter screen scaffold loop with Cursor',
    description:
      'From wireframe description → widget tree → golden test → theme tokens in under an hour.',
    category: 'MOBILE',
    kind: 'WORKFLOW',
    tools: ['Flutter', 'Cursor', 'Dart', 'Widgetbook'],
    content: `## Inputs
- \`design/spec.md\` — states, empty/error, accessibility notes
- \`lib/theme/tokens.dart\` — spacing, radii, typography

## Steps
1. Agent generates \`feature_x_screen.dart\` + view model stub
2. Extract repeated pieces to \`widgets/\`
3. Add golden test with light + dark \`flutter test --update-goldens\`
4. Widgetbook entry for design review

## Prompt that works
> “Use Material 3. No hard-coded colors. Prefer \`StatelessWidget\` until state is proven.”

## Common Flutter gotchas we catch
- \`BuildContext\` across async gaps
- Missing \`semanticsLabel\` on icon-only buttons
- Oversized \`ListView\` without builders`,
  },
  {
    id: 'post-matios-release',
    authorId: 'demo-matios-apps',
    title: 'Flutter release checklist (TestFlight + Play Console)',
    description:
      'Agent-assisted store submission — versioning, screenshots, privacy labels, and rollout notes.',
    category: 'MOBILE',
    kind: 'SETUP',
    tools: ['Fastlane', 'Flutter', 'Claude', 'App Store Connect'],
    content: `## Pre-flight
- Bump \`pubspec.yaml\` version + build number
- \`flutter analyze\` clean
- Changelog from merged PR titles

## iOS
- Archive via Xcode or \`fastlane beta\`
- Privacy nutrition labels synced with \`PrivacyInfo.xcprivacy\`
- TestFlight notes → non-technical summary

## Android
- \`flutter build appbundle\`
- Play Console → staged rollout 10%

## Agent job
Generate **What’s new** copy in 3 tones: App Store, Play Store, in-app modal.`,
  },
  {
    id: 'post-rayan-real-estate',
    authorId: 'demo-rayan-roberts',
    title: 'Real estate photo pipeline: dull sky → twilight hero shot',
    description:
      'Batch workflow for agencies — upscale, sky replace, window pull, and MLS-safe exports.',
    category: 'CONTENT',
    kind: 'WORKFLOW',
    tools: ['ComfyUI', 'Topaz Gigapixel', 'Claude', 'Dropbox'],
    content: `## Client story
A brokerage sends 40 exteriors every Monday. Agents need consistent “golden hour” look without reshoots.

## Pipeline
1. **Ingest** — Dropbox folder watch → RAW + JPG pairs
2. **Upscale** — Topaz or SD upscale node (only if < 24MP)
3. **Sky** — mask + replace; keep tree edge natural
4. **Window pull** — balance interiors without halos
5. **Export** — MLS max long edge 2048px, sRGB, no watermark

## Tools I actually bill for
| Step | Tool | Why |
|------|------|-----|
| Upscale | Topaz / SD | Recover drone crops |
| Sky | ComfyUI graph | Repeatable presets per market |
| QA | Side-by-side contact sheet | Client sign-off in one email |

## Agent assist
Claude drafts **per-batch QA notes**: “3 images need manual mask on chimney — see filenames.”`,
  },
  {
    id: 'post-rayan-photographer-tools',
    authorId: 'demo-rayan-roberts',
    title: 'Portrait & wedding upscaling stack (2026)',
    description:
      'What I use after shoots — skin-safe upscale, batch cull helpers, and delivery gallery prep.',
    category: 'CONTENT',
    kind: 'SETUP',
    tools: ['Lightroom', 'Imagen AI', 'Claude', 'Pixieset'],
    content: `## Philosophy
Photographers pay for **time back** and **consistent skin tone** — not gimmicky filters.

## Stack
- **Cull** — Narrative Select / Aftershoot (AI pre-tag, human final say)
- **Develop** — Lightroom sync’d presets per venue type
- **Upscale** — Imagen or Topaz; never on faces at > 1.5× without review
- **Delivery** — Pixieset + automated “hero 20” zip for print shop

## Prompt I keep in Claude project
> “Given this shot list JSON, propose 5 hero candidates per scene based on expression + composition. Explain in one line each.”

## Pricing lesson
Sell **per-gallery automation** retainers, not per-image magic — agencies want predictability.`,
  },
  {
    id: 'post-liya-skill-review-loop',
    authorId: 'demo-liya-k',
    title: 'A skill is a quality system, not a mega-prompt',
    description: 'A small review skill for turning screenshots into ranked, testable design fixes instead of a long list of opinions.',
    category: 'UX_UI',
    kind: 'SKILL',
    tools: ['Claude', 'Cursor', 'SKILL.md', 'Figma'],
    content: `## Trigger
Use this when someone shares a screenshot, route, or component and asks why it feels off.

## The loop
1. **Observe** — list visible evidence: hierarchy, spacing, type, contrast, and states
2. **Rank** — choose the three issues with the biggest effect on comprehension
3. **Propose** — give two fixes under 30 minutes and one deeper fix
4. **Check** — run the same checklist after the patch

## Guardrail
Never turn a bounded audit into a full redesign. If the request is ambiguous, ask for the user goal first.

## Output shape
3 issues → 2 quick wins → 1 deeper fix → 1 verification question

## Research note
Inspired by the reusable-skill pattern discussed by @coreyganim:
https://x.com/coreyganim/status/2027124057540632819`,
  },
  {
    id: 'post-sasha-evidence-loop',
    authorId: 'demo-sasha-zelts',
    title: 'A bug fix is not done until the evidence exists',
    description: 'An agent-assisted bug loop that ends with a reproducible check, regression test, and screenshot or recording.',
    category: 'ENGINEERING',
    kind: 'PLAYBOOK',
    tools: ['Claude Code', 'Playwright', 'GitHub Actions', 'Linear'],
    content: `## The five checkpoints
1. **Reproduce** — write the smallest reliable repro before touching code
2. **Explain** — state the likely cause in one sentence and link the evidence
3. **Patch** — make the smallest change that addresses the cause
4. **Verify** — run the regression test plus the nearest adjacent flow
5. **Show** — attach a screenshot or short recording to the ticket

## Agent boundaries
- No auto-merge
- No closing a ticket on a green unit test alone
- Auth, billing, and destructive actions require human review

## Done means
The next engineer can understand what broke, why the patch is safe, and what proof was collected.

## Research note
Adapted from @kaxil's public description of agent-assisted development with full tests and visual evidence:
https://x.com/kaxil/status/2037503513350005134`,
  },
  {
    id: 'post-mathiew-ship-checkpoints',
    authorId: 'demo-mathiew-builds',
    title: 'Four checkpoints before an agent-built feature ships',
    description: 'A compact shipping loop that keeps fast product work from becoming a pile of unverified agent output.',
    category: 'SAAS',
    kind: 'WORKFLOW',
    tools: ['Claude Code', 'Vite', 'Playwright', 'GitHub Actions'],
    content: `## Checkpoint 01 — scope
Write the one user action the feature must make easier. Cut everything that does not support it.

## Checkpoint 02 — vertical slice
Build the smallest end-to-end path: real input, persistence, empty state, and error state.

## Checkpoint 03 — evidence
Run tests, open the route in a browser, and capture the happy path plus one failure state.

## Checkpoint 04 — handoff
Ask the agent to summarize changed files, known risks, rollback steps, and the command that proves the feature works.

## Rule
Speed is useful only when the loop produces something another person can inspect and trust.

## Research note
The emphasis on agents running tests and capturing screenshots is adapted from @kaxil:
https://x.com/kaxil/status/2037503513350005134`,
  },
  {
    id: 'post-matios-screen-proof',
    authorId: 'demo-matios-apps',
    title: 'Make the mobile agent prove the screen, not just write it',
    description: 'A Flutter review loop for catching broken states, missing semantics, and layout regressions before a device build.',
    category: 'MOBILE',
    kind: 'WORKFLOW',
    tools: ['Flutter', 'Dart', 'Widgetbook', 'Patrol'],
    content: `## Inputs
- A screen spec with loading, empty, error, and offline states
- Theme tokens and accessibility requirements
- One realistic fixture, not placeholder lorem ipsum

## Agent loop
1. Generate the smallest widget tree
2. Add a golden test for light and dark themes
3. Add semantics checks for icon-only actions and form fields
4. Run one device smoke test for navigation and keyboard behavior
5. Capture the screen states for review before opening the PR

## Review question
Can a person understand what to do when the network is slow, the list is empty, or the action fails?

## Research note
Adapted from the broader agent workflow pattern of pairing implementation with tests and visual proof, discussed by @kaxil:
https://x.com/kaxil/status/2037503513350005134`,
  },
  {
    id: 'post-rayan-image-proof',
    authorId: 'demo-rayan-roberts',
    title: 'AI image edits need a contact sheet and a human pass',
    description: 'A production-safe image workflow for comparing AI edits, protecting client intent, and keeping deliverables traceable.',
    category: 'CONTENT',
    kind: 'WORKFLOW',
    tools: ['ComfyUI', 'Lightroom', 'Claude', 'Dropbox'],
    content: `## Before the model
Save the original, client brief, crop target, and export rules next to the job. Never overwrite the source.

## After the model
Generate a contact sheet with original / edit / final crop side by side. Check:
- straight lines and window edges
- repeated textures and invented objects
- skin, foliage, and reflections
- color consistency across the batch
- metadata and delivery dimensions

## Agent assist
Have Claude write a batch QA note with filenames and confidence: **pass**, **review**, or **reject**. A human makes the final call on anything client-facing.

## Rule
The fastest pipeline is the one that makes a bad edit easy to find before delivery.

## Research note
Adapted from public agent workflow discussions about evaluating outputs instead of trusting generation alone:
https://x.com/defi_explora/status/2036861515580457345`,
  },
]

async function removeLegacyDemo() {
  await prisma.user.updateMany({
    where: { id: { in: LEGACY_DEMO_IDS } },
    data: { pinnedPostId: null },
  })
  await prisma.like.deleteMany({
    where: { postId: { in: LEGACY_POST_IDS } },
  })
  await prisma.comment.deleteMany({
    where: { postId: { in: LEGACY_POST_IDS } },
  })
  await prisma.post.deleteMany({
    where: { id: { in: LEGACY_POST_IDS } },
  })
  await prisma.user.deleteMany({
    where: { id: { in: LEGACY_DEMO_IDS } },
  })
}

const userIdMap = new Map<string, string>()

async function upsertDemoUser(
  demo: (typeof DEMO_ACCOUNTS)[number],
  passwordHash: string | null,
) {
  let userId = demo.id

  const existingByEmail = await prisma.user.findUnique({
    where: { email: demo.email },
  })

  if (existingByEmail) {
    userId = existingByEmail.id
    if (userId !== demo.id) {
      await prisma.user.deleteMany({ where: { id: demo.id } })
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: demo.name,
        emailVerified: true,
      },
    })
  } else {
    await prisma.user.upsert({
      where: { id: demo.id },
      update: {
        name: demo.name,
        email: demo.email,
        emailVerified: true,
      },
      create: {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        emailVerified: true,
      },
    })
    userId = demo.id
  }

  userIdMap.set(demo.id, userId)

  if (passwordHash) {
    const existingAccount = await prisma.account.findFirst({
      where: { userId, providerId: 'credential' },
    })

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: passwordHash },
      })
    } else {
      await prisma.account.create({
        data: {
          id: `${demo.id}-cred`,
          accountId: userId,
          providerId: 'credential',
          userId,
          password: passwordHash,
        },
      })
    }
  } else {
    await prisma.account.deleteMany({
      where: { userId, providerId: 'credential' },
    })
  }

  const usernameTaken = await prisma.profile.findUnique({
    where: { username: demo.username },
  })

  if (usernameTaken && usernameTaken.userId !== userId) {
    await prisma.profile.update({
      where: { userId: usernameTaken.userId },
      data: {
        username: `${demo.username}-prev-${Date.now().toString(36)}`,
      },
    })
  }

  await prisma.profile.upsert({
    where: { userId },
    update: {
      username: demo.username,
      field: demo.field,
      headline: demo.headline,
      bio: demo.bio,
      onboarded: true,
    },
    create: {
      userId,
      username: demo.username,
      field: demo.field,
      headline: demo.headline,
      bio: demo.bio,
      onboarded: true,
    },
  })
}

function authorId(seedAuthorId: string) {
  return userIdMap.get(seedAuthorId) ?? seedAuthorId
}

async function main() {
  if (process.env.SEED_LEGACY_ONIE_CONTENT !== 'true') {
    console.log(
      'Skipping legacy Onie demo seed. Set SEED_LEGACY_ONIE_CONTENT=true for local/staging backfill only.',
    )
    return
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to seed legacy Onie demo content in production.',
    )
  }

  console.log('Seeding legacy Onie demo builders...')
  console.log('Account list: src/lib/demo-accounts.ts')

  await removeLegacyDemo()

  const seedDemoLogins = process.env.SEED_DEMO_LOGINS === 'true'
  const passwordHash = seedDemoLogins
    ? await hashPassword(process.env.SEED_DEMO_PASSWORD ?? 'onie-local-demo')
    : null

  for (const demo of DEMO_ACCOUNTS) {
    await upsertDemoUser(demo, passwordHash)
  }

  for (const post of POSTS) {
    const resolvedAuthorId = authorId(post.authorId)
    await prisma.post.upsert({
      where: { id: post.id },
      update: {
        kind: post.kind,
        category: post.category,
        title: post.title,
        description: post.description,
        content: post.content,
        tools: post.tools,
        authorId: resolvedAuthorId,
      },
      create: {
        ...post,
        authorId: resolvedAuthorId,
      },
    })
  }

  const pinnedByUser: Record<string, string> = {
    'demo-liya-k': 'post-liya-ui-audit',
    'demo-sasha-zelts': 'post-sasha-triage-bot',
    'demo-mathiew-builds': 'post-mathiew-48h-mvp',
    'demo-matios-apps': 'post-matios-widget-loop',
    'demo-rayan-roberts': 'post-rayan-real-estate',
  }

  for (const demo of DEMO_ACCOUNTS) {
    const pinnedPostId = pinnedByUser[demo.id]
    if (!pinnedPostId) continue

    await prisma.user.update({
      where: { id: authorId(demo.id) },
      data: { pinnedPostId },
    })
  }

  const followPairs = [
    ['demo-sasha-zelts', 'demo-liya-k'],
    ['demo-mathiew-builds', 'demo-liya-k'],
    ['demo-mathiew-builds', 'demo-sasha-zelts'],
    ['demo-matios-apps', 'demo-mathiew-builds'],
    ['demo-rayan-roberts', 'demo-matios-apps'],
    ['demo-liya-k', 'demo-rayan-roberts'],
  ] as const

  for (const [followerSeedId, followingSeedId] of followPairs) {
    const followerId = authorId(followerSeedId)
    const followingId = authorId(followingSeedId)
    await prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      update: {},
      create: { followerId, followingId },
    })
  }

  await prisma.like.createMany({
    data: [
      { userId: authorId('demo-sasha-zelts'), postId: 'post-liya-ui-audit' },
      { userId: authorId('demo-mathiew-builds'), postId: 'post-liya-ui-audit' },
      { userId: authorId('demo-matios-apps'), postId: 'post-mathiew-48h-mvp' },
      { userId: authorId('demo-rayan-roberts'), postId: 'post-matios-widget-loop' },
      { userId: authorId('demo-liya-k'), postId: 'post-rayan-real-estate' },
      { userId: authorId('demo-sasha-zelts'), postId: 'post-sasha-triage-bot' },
    ],
    skipDuplicates: true,
  })

  await prisma.comment.createMany({
    data: [
      {
        postId: 'post-liya-ui-audit',
        authorId: authorId('demo-mathiew-builds'),
        content:
          'Ran this on our landing page yesterday — the “quick wins under 30 min” constraint is what makes it usable.',
      },
      {
        postId: 'post-sasha-triage-bot',
        authorId: authorId('demo-liya-k'),
        content: 'We adapted the classify step for design QA tickets too. Same shape, different labels.',
      },
      {
        postId: 'post-mathiew-48h-mvp',
        authorId: authorId('demo-sasha-zelts'),
        content: 'The “deploy before dinner” rule forces env vars to exist early. Saved us twice.',
      },
      {
        postId: 'post-rayan-real-estate',
        authorId: authorId('demo-matios-apps'),
        content: 'Love the MLS export table — mobile clients always ask for max dimensions.',
      },
    ],
    skipDuplicates: true,
  })

  console.log(
    seedDemoLogins
      ? 'Done. Seed demo credential logins were enabled for this run.'
      : 'Done. Seed demo credential logins are disabled; public personas only.',
  )
  for (const demo of DEMO_ACCOUNTS) {
    console.log(`  @${demo.username} — ${demo.email}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
