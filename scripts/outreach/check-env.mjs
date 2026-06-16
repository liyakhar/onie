#!/usr/bin/env node
/**
 * Check what's ready for X outreach vs what's still missing.
 */
import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from './lib/config.mjs'
import { readQueue } from './lib/queue.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const CHECKS = [
  { key: 'X_HANDLE', label: 'Your X handle', required: 'before send' },
  { key: 'X_CLIENT_ID', label: 'X OAuth client ID', required: 'oauth + send' },
  { key: 'X_CLIENT_SECRET', label: 'X OAuth client secret', required: 'oauth + send' },
  { key: 'X_ACCESS_TOKEN', label: 'X access token', required: 'send / fetch / search' },
  { key: 'X_REFRESH_TOKEN', label: 'X refresh token', required: 'recommended' },
]

const OPTIONAL = [
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API (better drafts)' },
  { key: 'OPENAI_API_KEY', label: 'OpenAI API (better drafts)' },
]

async function fileExists(rel) {
  try {
    await access(path.join(ROOT, rel))
    return true
  } catch {
    return false
  }
}

async function main() {
  const config = await loadConfig()
  const pending = await readQueue('pending')
  const approved = pending.filter((r) => r.status === 'approved')
  const drafts = pending.filter((r) => r.status === 'pending')

  console.log('\nOnie X outreach — readiness check\n')

  console.log('Scripts:')
  const files = [
    'scripts/outreach/draft.mjs',
    'scripts/outreach/review.mjs',
    'scripts/outreach/discover.mjs',
    'scripts/outreach/oauth.mjs',
    'scripts/outreach/fetch.mjs',
    'scripts/outreach/send.mjs',
    'scripts/outreach/feed.mjs',
    'scripts/outreach/copy.mjs',
  ]
  for (const f of files) console.log(`  ${(await fileExists(f)) ? '✓' : '✗'} ${f}`)

  console.log('\nQueue:')
  console.log(`  ${drafts.length} pending review`)
  console.log(`  ${approved.length} approved (waiting to send)`)
  console.log(`  Site URL: ${config.siteUrl}`)

  console.log('\nX API (.env.local):')
  for (const { key, label, required } of CHECKS) {
    console.log(`  ${process.env[key]?.trim() ? '✓' : '○'} ${label} — ${required}`)
  }

  console.log('\nOptional LLM polish:')
  for (const { key, label } of OPTIONAL) {
    console.log(`  ${process.env[key]?.trim() ? '✓' : '○'} ${label}`)
  }

  console.log('\n── No API needed ──')
  console.log('  pnpm outreach:draft -- --url <url> --text "..."')
  console.log('  pnpm outreach:batch -- outreach/examples/candidates.example.jsonl')
  console.log('  pnpm outreach:review')
  console.log('  pnpm outreach:copy')

  console.log('\n── After X API ──')
  console.log('  pnpm outreach:oauth          # get tokens')
  console.log('  pnpm outreach:fetch -- --url <tweet-url>')
  console.log('  pnpm outreach:discover -- --search')
  console.log('  pnpm outreach:send')
  console.log('')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
