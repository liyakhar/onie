#!/usr/bin/env node
/**
 * Batch draft from JSONL file without interactive prompts.
 *
 * File format (one JSON object per line):
 *   {"url":"https://x.com/...","text":"post body","author":"@handle"}
 *
 * Usage: pnpm outreach:batch -- outreach/examples/candidates.example.jsonl
 */
import { readFile } from 'node:fs/promises'
import { loadConfig, loadSignals } from './lib/config.mjs'
import { createDraft } from './lib/draft-core.mjs'
import { appendQueue, newQueueRow } from './lib/queue.mjs'

async function main() {
  const file = process.argv.slice(2).find((a) => a !== '--' && !a.startsWith('-'))
  if (!file || process.argv.includes('--help')) {
    console.log('Usage: pnpm outreach:batch -- <candidates.jsonl>')
    process.exit(file ? 0 : 1)
  }

  const [config, signals] = await Promise.all([loadConfig(), loadSignals()])
  const lines = (await readFile(file, 'utf8'))
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))

  let queued = 0
  for (const line of lines) {
    const c = JSON.parse(line)
    const { classify, draftText, skipped } = await createDraft(c.text, { config, signals })
    if (skipped || !draftText) {
      console.log(`skip ${c.url}`)
      continue
    }
    await appendQueue(
      newQueueRow({
        postUrl: c.url,
        postText: c.text,
        authorHandle: c.author,
        classify,
        draftText,
      }),
    )
    queued++
    console.log(`queued ${c.url}`)
  }
  console.log(`\n${queued} draft(s). Run: pnpm outreach:review`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
