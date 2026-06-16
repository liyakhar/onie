#!/usr/bin/env node
/**
 * Draft or queue founder feed posts spotlighting Onie workflows.
 *
 * Usage:
 *   pnpm outreach:feed -- --title "..." --author maya-chen --post-id <id> --summary "..."
 *   pnpm outreach:feed -- --examples
 *   pnpm outreach:feed -- --db [--max 3]
 */
import { loadConfig } from './lib/config.mjs'
import { loadTemplate, renderTemplate, truncateForTweet } from './lib/template.mjs'
import { appendQueue, newQueueRow } from './lib/queue.mjs'

const EXAMPLES = [
  {
    title: 'Research synthesis with Cursor skills',
    author: 'maya-chen',
    post_id: 'demo',
    one_line_summary: 'How a UX lead runs lit reviews with tagged skills',
  },
  {
    title: 'Ship checklist for indie SaaS',
    author: 'alex-rivera',
    post_id: 'demo',
    one_line_summary: 'PRD → code → launch with Claude Code',
  },
]

function parseArgs(argv) {
  const args = { examples: false, db: false, max: 3, yes: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--title') args.title = argv[++i]
    else if (a === '--author') args.author = argv[++i]
    else if (a === '--post-id') args.post_id = argv[++i]
    else if (a === '--summary') args.summary = argv[++i]
    else if (a === '--examples') args.examples = true
    else if (a === '--db') args.db = true
    else if (a === '--max') args.max = Number(argv[++i])
    else if (a === '--yes' || a === '-y') args.yes = true
    else if (a === '--help') args.help = true
  }
  return args
}

async function loadPostsFromDb(max) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set — use --examples or pass --title manually')
  }
  const { PrismaClient } = await import('../../src/generated/prisma/client.js')
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })
  try {
    const posts = await prisma.post.findMany({
      take: max,
      orderBy: { createdAt: 'desc' },
      include: { author: { include: { profile: true } } },
    })
    return posts.map((p) => ({
      title: p.title,
      author: p.author.profile?.username ?? 'onie',
      post_id: p.id,
      one_line_summary: p.description || p.title,
    }))
  } finally {
    await prisma.$disconnect()
  }
}

async function draftFeedPost(config, item) {
  const body = await loadTemplate('feed-post').catch(() => {
    throw new Error('Missing outreach/templates/feed-post.md')
  })
  return truncateForTweet(
    renderTemplate(body, {
      workflow_title: item.title,
      author: item.author,
      post_id: item.post_id,
      one_line_summary: item.one_line_summary,
      site_url: config.siteUrl,
    }),
  )
}

async function queueFeedPost(config, item, text) {
  const row = newQueueRow({
    postUrl: `${config.siteUrl}/p/${item.post_id}`,
    postText: `[feed] ${item.title}`,
    authorHandle: `@${item.author}`,
    classify: { score: 5, variant: 'feed', reason: 'feed spotlight' },
    draftText: text,
  })
  row.type = 'feed'
  await appendQueue(row)
  return row
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage:
  pnpm outreach:feed -- --examples
  pnpm outreach:feed -- --db
  pnpm outreach:feed -- --title "..." --author user --post-id id --summary "..."
`)
    return
  }

  const config = await loadConfig()
  let items = []

  if (args.title && args.post_id) {
    items = [
      {
        title: args.title,
        author: args.author || 'onie',
        post_id: args.post_id,
        one_line_summary: args.summary || args.title,
      },
    ]
  } else if (args.examples) {
    items = EXAMPLES
  } else if (args.db) {
    items = await loadPostsFromDb(args.max)
  } else {
    console.error('Use --examples, --db, or --title/--post-id')
    process.exit(1)
  }

  for (const item of items) {
    const text = await draftFeedPost(config, item)
    console.log(`\n--- Feed draft: ${item.title} (${text.length} chars) ---\n${text}\n`)
    if (args.yes) {
      const row = await queueFeedPost(config, item, text)
      console.log(`Queued ${row.id}`)
    }
  }

  if (!args.yes) {
    console.log('Pass --yes to queue feed drafts, or copy manually.')
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
