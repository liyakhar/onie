#!/usr/bin/env node
/**
 * Discover posts on X and queue drafts.
 *
 * Modes:
 *   --search          X API recent search (needs credentials + usually Basic tier)
 *   --file <path>     JSONL with {url, text, author?} per line
 *   --stdin           Same JSONL on stdin
 *
 * Usage:
 *   pnpm outreach:discover -- --file outreach/examples/candidates.example.jsonl
 *   pnpm outreach:discover -- --search --max 15
 */
import { readFile } from 'node:fs/promises'
import { stdin as input } from 'node:process'
import { loadConfig, loadSignals } from './lib/config.mjs'
import { createDraft } from './lib/draft-core.mjs'
import { appendQueue, newQueueRow } from './lib/queue.mjs'
import {
  buildSearchQuery,
  missingXEnv,
  searchRecentTweets,
} from './lib/x-api.mjs'

function parseArgs(argv) {
  const args = { search: false, file: null, max: 10, yes: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--search') args.search = true
    else if (a === '--file') args.file = argv[++i]
    else if (a === '--max') args.max = Number(argv[++i])
    else if (a === '--yes' || a === '-y') args.yes = true
    else if (a === '--help') args.help = true
  }
  return args
}

async function readJsonl(path) {
  const text = path ? await readFile(path, 'utf8') : await readStdin()
  return text
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((line) => JSON.parse(line))
}

async function readStdin() {
  if (input.isTTY) return ''
  const chunks = []
  for await (const c of input) chunks.push(c)
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help) {
    console.log(`Usage:
  pnpm outreach:discover -- --file outreach/examples/candidates.example.jsonl
  pnpm outreach:discover -- --search [--max 15]
`)
    return
  }

  const [config, signals] = await Promise.all([loadConfig(), loadSignals()])
  let candidates = []

  if (args.search) {
    const missing = missingXEnv(['X_ACCESS_TOKEN'])
    if (missing.length) {
      console.error(`Missing ${missing.join(', ')}. Use --file mode or run pnpm outreach:oauth`)
      process.exit(1)
    }
    const query = buildSearchQuery(signals)
    console.log(`Searching: ${query.slice(0, 120)}…\n`)
    try {
      const tweets = await searchRecentTweets(query, args.max)
      candidates = tweets.map((t) => ({
        url: t.url,
        text: t.text,
        author: t.authorHandle,
      }))
    } catch (err) {
      console.error(`Search failed: ${err.message}`)
      console.error('Tip: recent search often needs X API Basic tier. Use --file with pasted posts instead.')
      process.exit(1)
    }
  } else if (args.file || !input.isTTY) {
    candidates = await readJsonl(args.file)
  } else {
    console.error('Provide --search or --file <jsonl>')
    process.exit(1)
  }

  console.log(`Found ${candidates.length} candidate(s)\n`)

  let queued = 0
  let skipped = 0

  for (const c of candidates) {
    const { classify, draftText, skipped: skip } = await createDraft(c.text, { config, signals })
    if (skip || !draftText) {
      skipped++
      console.log(`○ skip (${classify.score}/5) ${c.url || c.text.slice(0, 40)}`)
      continue
    }
    const row = newQueueRow({
      postUrl: c.url,
      postText: c.text,
      authorHandle: c.author,
      classify,
      draftText,
    })
    await appendQueue(row)
    queued++
    console.log(`✓ queued ${classify.variant} ${c.url}`)
    console.log(`  ${draftText.slice(0, 90)}${draftText.length > 90 ? '…' : ''}`)
  }

  console.log(`\n${queued} queued, ${skipped} skipped`)
  if (queued) console.log('Run: pnpm outreach:review')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
