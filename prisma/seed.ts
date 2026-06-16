import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from 'better-auth/crypto'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

const DEMO_USERS = [
  {
    id: 'demo-ux-designer',
    name: 'Maya Chen',
    email: 'maya@weavel.demo',
    username: 'maya-chen',
    field: 'UX_UI' as const,
    headline: 'UX lead weaving research + Cursor skills',
    bio: 'I share workflows for synthesis, prototyping, and design QA with agents.',
  },
  {
    id: 'demo-saas-builder',
    name: 'Alex Rivera',
    email: 'alex@weavel.demo',
    username: 'alex-rivera',
    field: 'SAAS' as const,
    headline: 'Indie SaaS founder shipping with Claude Code',
    bio: 'Full-stack workflows: PRDs, implementation, and launch checklists.',
  },
  {
    id: 'demo-scientist',
    name: 'Dr. Sam Okonkwo',
    email: 'sam@weavel.demo',
    username: 'sam-okonkwo',
    field: 'SCIENCE' as const,
    headline: 'Computational biologist · agent-assisted literature reviews',
    bio: 'Pipelines for paper triage, replication notes, and lab notebook drafts.',
  },
]

async function main() {
  console.log('Seeding Weavel demo data...')

  const passwordHash = await hashPassword('demo12345')

  for (const demo of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: demo.id },
      update: {},
      create: {
        id: demo.id,
        name: demo.name,
        email: demo.email,
        emailVerified: true,
        accounts: {
          create: {
            id: `${demo.id}-cred`,
            accountId: demo.id,
            providerId: 'credential',
            password: passwordHash,
          },
        },
        profile: {
          create: {
            username: demo.username,
            field: demo.field,
            headline: demo.headline,
            bio: demo.bio,
          },
        },
      },
    })
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: 'demo-saas-builder',
        followingId: 'demo-ux-designer',
      },
    },
    update: {},
    create: {
      followerId: 'demo-saas-builder',
      followingId: 'demo-ux-designer',
    },
  })

  const posts = [
    {
      id: 'post-ux-research',
      authorId: 'demo-ux-designer',
      title: 'UX research synthesis in one afternoon',
      description:
        'Turn raw interview notes into themes, quotes, and a shareable readout using skills + structured prompts.',
      category: 'UX_UI' as const,
      tools: ['Claude', 'Cursor', 'SKILL.md', 'Notion export'],
      content: `## What this solves
Interview synthesis without losing nuance.

## Harness
- Cursor with a \`ux-research\` skill
- Claude project with interview transcript attached

## Steps
1. Export transcripts to /research/raw/
2. Run the synthesis skill on each file
3. Merge themes in a single markdown doc
4. Generate "so what" summary for stakeholders

## Files
\`\`\`
skills/ux-research/SKILL.md
prompts/synthesis.md
\`\`\``,
    },
    {
      id: 'post-saas-mvp',
      authorId: 'demo-saas-builder',
      title: 'SaaS MVP loop: idea → PRD → scaffold → ship',
      description:
        'My weekly loop for validating and shipping small products with an agent pair-programmer.',
      category: 'SAAS' as const,
      tools: ['Claude Code', 'TanStack Start', 'Railway', 'Prisma'],
      content: `## Loop
1. Problem interview notes → PRD draft
2. PRD → technical plan + schema
3. Scaffold repo with TanStack Start
4. Implement thinnest slice
5. Deploy to Railway same day

## Agent setup
- System prompt emphasizes YAGNI
- Always commit in small slices
- Run tests before marking done`,
    },
    {
      id: 'post-science-lit',
      authorId: 'demo-scientist',
      title: 'Literature triage for busy researchers',
      description:
        'Filter 40 papers down to 6 worth deep reading using structured agent criteria.',
      category: 'SCIENCE' as const,
      tools: ['Claude', 'Zotero', 'MCP'],
      content: `## Criteria rubric
- Directly tests hypothesis? (Y/N)
- Sample size adequate?
- Methods reproducible?

## Workflow
Export Zotero library → batch score → human review top quartile only.`,
    },
  ]

  for (const post of posts) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: {},
      create: post,
    })
  }

  await prisma.user.update({
    where: { id: 'demo-ux-designer' },
    data: { pinnedPostId: 'post-ux-research' },
  })

  await prisma.like.createMany({
    data: [
      { userId: 'demo-saas-builder', postId: 'post-ux-research' },
      { userId: 'demo-scientist', postId: 'post-ux-research' },
      { userId: 'demo-ux-designer', postId: 'post-saas-mvp' },
      { userId: 'demo-scientist', postId: 'post-saas-mvp' },
      { userId: 'demo-saas-builder', postId: 'post-science-lit' },
    ],
    skipDuplicates: true,
  })

  await prisma.comment.createMany({
    data: [
      {
        postId: 'post-ux-research',
        authorId: 'demo-saas-builder',
        content:
          'Used this yesterday — the synthesis skill saved me hours. Would love to see your prompt for stakeholder summaries.',
      },
      {
        postId: 'post-ux-research',
        authorId: 'demo-scientist',
        content: 'Adapted the same structure for interview notes in a research study. Works great.',
      },
      {
        postId: 'post-saas-mvp',
        authorId: 'demo-ux-designer',
        content: 'The PRD → scaffold loop is exactly how I ship side projects now.',
      },
    ],
    skipDuplicates: true,
  })

  console.log('Done. Demo login: maya@weavel.demo / demo12345')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
