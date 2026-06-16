#!/usr/bin/env node
/**
 * Fetch tweet text from URL via X API and draft a reply.
 *
 * Usage:
 *   pnpm outreach:fetch -- --url "https://x.com/user/status/123"
 *   pnpm outreach:fetch -- --url "..." --dry
 */
import { loadConfig, loadSignals } from './lib/config.mjs'
import { createDraft } from './lib/draft-core.mjs'
import { appendQueue, newQueueRow } from './lib/queue.mjs'
import { fetchTweet, missingXEnv, tweetIdFromUrl } from './lib/x-api.mjs'

function parseArgs(argv) {
  const args = { url: null, dry: false, yes: false }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--url') args.url = argv[++i]
    else if (a === '--dry') args.dry = true
    else if (a === '--yes' || a === '-y') args.yes = true
    else if (a === '--help') args.help = true
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv)
  if (args.help || !args.url) {
    console.log('Usage: pnpm outreach:fetch -- --url <tweet-url> [--dry] [-y]')
    process.exit(args.url ? 0 : 1)
  }

  const missing = missingXEnv(['X_ACCESS_TOKEN'])
  if (missing.length) {
    console.error(`Missing ${missing.join(', ')}. Run: pnpm outreach:oauth`)
    process.exit(1)
  }

  const tweetId = tweetIdFromUrl(args.url)
  if (!tweetId) {
    console.error('Could not parse tweet id from URL')
    process.exit(1)
  }

  const tweet = await fetchTweet(tweetId)
  console.log(`\n@${tweet.authorHandle?.replace('@', '') ?? 'unknown'}: ${tweet.text}\n`)

  const [config, signals] = await Promise.all([loadConfig(), loadSignals()])
  const { classify, draftText, skipped } = await createDraft(tweet.text, { config, signals })

  console.log(`Classify: ${classify.score}/5 — ${classify.reason} (${classify.variant})`)
  if (skipped || !draftText) {
    console.log('Skipped — not queued.')
    process.exit(2)
  }

  console.log(`\n--- Draft (${draftText.length} chars) ---\n${draftText}\n`)

  if (args.dry) return

  if (!args.yes) {
    const { createInterface } = await import('node:readline/promises')
    const { stdin, stdout } = await import('node:process')
    const rl = createInterface({ input: stdin, output: stdout })
    const answer = await rl.question('Queue? [Y/n] ')
    rl.close()
    if (answer.toLowerCase() === 'n') return
  }

  const row = newQueueRow({
    postUrl: tweet.url || args.url,
    postText: tweet.text,
    authorHandle: tweet.authorHandle,
    classify,
    draftText,
  })
  await appendQueue(row)
  console.log(`Queued ${row.id}. Run: pnpm outreach:review`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
