#!/usr/bin/env node
/**
 * Export approved drafts for manual posting on X (clipboard-friendly).
 */
import { readQueue } from './lib/queue.mjs'

async function main() {
  const pending = await readQueue('pending')
  const approved = pending.filter((r) => r.status === 'approved')

  if (!approved.length) {
    console.log('No approved drafts. Run: pnpm outreach:review')
    return
  }

  console.log(`${approved.length} approved draft(s)\n`)
  for (const row of approved) {
    const text = row.approved_text || row.draft_text
    console.log('─'.repeat(60))
    console.log(`Reply to: ${row.post_url}`)
    if (row.author_handle) console.log(`Author: ${row.author_handle}`)
    console.log(`\n${text}\n`)
  }
  console.log('─'.repeat(60))
  console.log('\nCopy each reply and post manually, or run: pnpm outreach:send')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
