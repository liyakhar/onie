#!/usr/bin/env node
/**
 * Print the next blog primary from keywords.csv (guide: one primary = one post).
 *
 * Usage:
 *   pnpm blog:next
 *   pnpm blog:next -- --json
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSV_PATH = path.join(ROOT, 'keywords.csv')
const USED_PATH = path.join(ROOT, 'references/used-keywords.md')
const QUEUE_PATH = path.join(ROOT, 'references/publish-queue.md')

const jsonOut = process.argv.includes('--json')

function curatedOrder() {
  try {
    const text = readFileSync(QUEUE_PATH, 'utf8')
    const inTable = text.includes('## Up next')
    if (!inTable) return []
    const section = text.split('## Up next')[1]?.split('## ')[0] ?? ''
    const order = []
    for (const line of section.split('\n')) {
      if (!line.startsWith('|') || line.includes('Primary') || line.includes('---')) continue
      const cols = line.split('|').map((c) => c.trim())
      const kw = cols[2]
      if (kw && kw !== 'Primary' && !/^\d+$/.test(kw)) order.push(kw.toLowerCase())
    }
    return order
  } catch {
    return []
  }
}

function parseCsv(text) {
  const lines = text.trim().split('\n')
  const header = lines[0].split(',')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = parseCsvLine(lines[i])
    rows.push(Object.fromEntries(header.map((key, idx) => [key, cols[idx] ?? ''])))
  }
  return rows
}

function parseCsvLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (ch === '"') inQuotes = false
      else cur += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out
}

function usedPrimaries() {
  const text = readFileSync(USED_PATH, 'utf8')
  const primaries = new Set()
  for (const line of text.split('\n')) {
    const m = line.match(/^### (.+)$/)
    if (m) primaries.add(m[1].trim().toLowerCase())
  }
  return primaries
}

function score(row) {
  const v = Number(row.Volume) || 0
  const d = Number(row.KD) || 0
  const p = { P1: 0, P2: 1, P3: 2 }[row.Priority] ?? 3
  return p * 1e9 - v / (d + 1)
}

const rows = parseCsv(readFileSync(CSV_PATH, 'utf8'))
const used = usedPrimaries()

const curated = curatedOrder()

const candidates = rows
  .filter((r) => r.Status === 'Queued')
  .filter((r) => r.Intent === 'Informational' || r.Intent === 'Navigational')
  .filter((r) => !used.has(r.Keyword.toLowerCase()))

candidates.sort((a, b) => score(a) - score(b))

let next = null
for (const kw of curated) {
  const row = candidates.find((r) => r.Keyword.toLowerCase() === kw)
  if (row) {
    next = row
    break
  }
}
if (!next) next = candidates[0]

if (!next) {
  console.log('\nNo queued blog primaries left (or all are in used-keywords.md).\n')
  process.exit(0)
}

const payload = {
  keyword: next.Keyword,
  volume: next.Volume || null,
  kd: next.KD || null,
  priority: next.Priority,
  cluster: next.Cluster,
  source: next.Source,
  onieAngle: next.Onie_Angle,
  queuedRemaining: candidates.length,
}

if (jsonOut) {
  console.log(JSON.stringify(payload, null, 2))
} else {
  console.log('\nNext blog primary\n')
  console.log(`  Keyword:  ${payload.keyword}`)
  console.log(`  Volume:   ${payload.volume ?? '(pending)'}`)
  console.log(`  KD:       ${payload.kd ?? '(pending)'}`)
  console.log(`  Priority: ${payload.priority} · ${payload.cluster}`)
  console.log(`  Queued:   ${payload.queuedRemaining} informational primaries left`)
  console.log('\nPrompt: "Write the next SEO blog post for <keyword> using onie-blog skill"\n')
}
