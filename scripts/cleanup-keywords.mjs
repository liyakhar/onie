#!/usr/bin/env node
/**
 * Mark off-niche DataForSEO keyword_ideas rows as Skip.
 * Keeps curated serp-* rows and Onie-relevant agent/dev terms.
 *
 * Usage: pnpm seo:keywords:clean
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSV_PATH = path.join(ROOT, 'keywords.csv')

/** Must match at least one seed term for auto-discovered (dataforseo) rows to stay Queued */
const SEED_TERMS_RE = /\b(claude|cursor|mcp|skill|agent)\b/i

const JUNK_RE =
  /\b(blooket|flashpoint|flash point|edhesive|rogue piece|knockout|paradox code|code cake|hypershot|blooket|printful|printify|template strand|coding strand|ninja time|code dig|code pressure|invoke vs evoke|imbedded vs embedded|embedding vs imbedding|duck in amazon|code division multiple|4\.2 code practice|code practice question|ln log rules|shift code)\b/i

function parseCsv(text) {
  const lines = text.trim().split('\n')
  const header = lines[0].split(',')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = parseCsvLine(lines[i])
    rows.push(Object.fromEntries(header.map((key, idx) => [key, cols[idx] ?? ''])))
  }
  return { header, rows }
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

function escapeCsv(value) {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function serializeCsv(header, rows) {
  return `${[header.join(','), ...rows.map((row) => header.map((k) => escapeCsv(row[k])).join(','))].join('\n')}\n`
}

function scorePriority(volume, kd) {
  const v = Number(volume) || 0
  const d = Number(kd) || 0
  return v / (d + 1)
}

function assignPriority(rows) {
  const queued = rows.filter((r) => r.Status === 'Queued')
  const sorted = [...queued].sort((a, b) => scorePriority(b.Volume, b.KD) - scorePriority(a.Volume, a.KD))
  const n = sorted.length
  for (const row of rows) {
    if (row.Status !== 'Queued') continue
    const rank = sorted.findIndex((r) => r.Keyword === row.Keyword)
    if (rank < 0) continue
    const pct = n <= 1 ? 0 : rank / (n - 1)
    row.Priority = pct <= 0.33 ? 'P1' : pct <= 0.66 ? 'P2' : 'P3'
  }
}

const csvText = await readFile(CSV_PATH, 'utf8')
const { header, rows } = parseCsv(csvText)

let skipped = 0
for (const row of rows) {
  if (row.Status === 'Published' || row.Status === 'Skip') continue

  const kw = row.Keyword
  const fromApi = row.Source.startsWith('dataforseo:') && row.SERP_Notes.includes('keyword_ideas')
  const curated = row.Source.startsWith('serp-')

  if (JUNK_RE.test(kw)) {
    row.Status = 'Skip'
    row.Priority = 'P3'
    row.SERP_Notes = `${row.SERP_Notes}; off-niche (cleanup)`.trim()
    skipped++
    continue
  }

  if (fromApi && !curated && !SEED_TERMS_RE.test(kw)) {
    row.Status = 'Skip'
    row.Priority = 'P3'
    row.SERP_Notes = `${row.SERP_Notes}; off-niche (cleanup)`.trim()
    skipped++
  }
}

assignPriority(rows)

rows.sort((a, b) => {
  const statusOrder = { Queued: 0, Published: 1, Skip: 2 }
  const sa = statusOrder[a.Status] ?? 3
  const sb = statusOrder[b.Status] ?? 3
  if (sa !== sb) return sa - sb
  const pa = { P1: 0, P2: 1, P3: 2 }[a.Priority] ?? 3
  const pb = { P1: 0, P2: 1, P3: 2 }[b.Priority] ?? 3
  if (pa !== pb) return pa - pb
  return scorePriority(b.Volume, b.KD) - scorePriority(a.Volume, a.KD)
})

await writeFile(CSV_PATH, serializeCsv(header, rows), 'utf8')
console.log(`\n✓ keywords.csv cleaned — ${skipped} rows marked Skip`)
console.log(`  Queued remaining: ${rows.filter((r) => r.Status === 'Queued').length}\n`)
