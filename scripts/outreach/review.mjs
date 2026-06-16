#!/usr/bin/env node
/**
 * Review pending outreach drafts — approve, edit, or skip.
 * No X API required; approved items stay in queue until send.mjs is wired.
 */
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { loadConfig } from './lib/config.mjs'
import { readQueue, writeQueue } from './lib/queue.mjs'

async function main() {
  const config = await loadConfig()
  const pending = (await readQueue('pending')).filter((r) => r.status === 'pending')

  if (!pending.length) {
    console.log('No pending drafts. Run: pnpm outreach:draft -- --url <url> --text "..."')
    return
  }

  console.log(`${pending.length} pending draft(s)\n`)
  const rl = createInterface({ input, output })
  const approved = []
  const remaining = [...pending]

  for (let i = 0; i < pending.length; i++) {
    const row = pending[i]
    console.log(`\n[${i + 1}/${pending.length}] ${row.post_url}`)
    if (row.author_handle) console.log(`Author: ${row.author_handle}`)
    console.log(`Score: ${row.classify?.score}/5 — ${row.classify?.reason}`)
    console.log(`\nPost:\n${row.post_text.slice(0, 300)}${row.post_text.length > 300 ? '…' : ''}`)
    console.log(`\nDraft (${row.draft_text.length} chars):\n${row.draft_text}`)

    const action = (await rl.question('\n[a]pprove / [s]kip / [e]dit / [q]uit? ')).toLowerCase()

    if (action === 'q') break
    if (action === 's') {
      row.status = 'skipped'
      continue
    }
    if (action === 'e') {
      console.log('New reply text (single line):')
      const edited = await rl.question('> ')
      if (edited.trim()) row.draft_text = edited.trim()
      row.status = 'approved'
      row.approved_text = row.draft_text
      approved.push(row)
      continue
    }
    if (action === 'a' || action === '') {
      row.status = 'approved'
      row.approved_text = row.draft_text
      approved.push(row)
    }
  }

  rl.close()

  const stillPending = pending.filter((r) => r.status === 'pending')
  const skipped = pending.filter((r) => r.status === 'skipped')
  const allRows = await readQueue('pending')
  const byId = new Map(allRows.map((r) => [r.id, r]))
  for (const r of [...stillPending, ...skipped, ...approved]) byId.set(r.id, r)
  await writeQueue([...byId.values()])

  console.log(`\nDone: ${approved.length} approved, ${skipped.length} skipped`)
  if (approved.length) {
    console.log('\nApproved drafts are in outreach/queue/pending.jsonl (status: approved).')
  console.log('When X API is ready: pnpm outreach:send')
  console.log(`Daily reply cap: ${config.dailyLimits.replies}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
