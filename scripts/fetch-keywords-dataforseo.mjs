#!/usr/bin/env node
/**
 * Fetch keyword metrics from DataForSEO Labs (SEMrush-guide equivalent).
 *
 * Filters (claude-code-seo-guide Phase 4):
 *   - Intent: informational
 *   - Volume >= 100
 *   - KD <= 30
 *
 * Usage:
 *   pnpm seo:keywords              # merge API results into keywords.csv
 *   pnpm seo:keywords -- --dry-run # preview without writing
 *
 * Requires in .env.local:
 *   DATAFORSEO_LOGIN=...     (API login from app.dataforseo.com/api-access)
 *   DATAFORSEO_PASSWORD=...
 */
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSV_PATH = path.join(ROOT, 'keywords.csv')
const RUN_META_PATH = path.join(ROOT, 'references/keyword-research-last-run.json')

const LOCATION_CODE = 2840 // United States
const LANGUAGE_CODE = 'en'
const MIN_VOLUME = Number(process.env.SEO_MIN_VOLUME || 100)
const MAX_KD = Number(process.env.SEO_MAX_KD || 30)
const IDEAS_LIMIT = Number(process.env.SEO_IDEAS_LIMIT || 80)

/** Seeds aligned with references/keyword-research.md pillars */
const SEEDS = [
  'claude code skills',
  'mcp server setup',
  'cursor rules vs skills',
  'shared prompt library',
  'document ai agent workflows',
  'agent workflow template',
]

const CLUSTER_RULES = [
  { cluster: 'Skills', re: /claude code|cursor|skill|hooks?|rules|skill\.md|agents\.md|subagent/i },
  { cluster: 'MCP', re: /\bmcp\b|model context protocol/i },
  { cluster: 'Team libs', re: /team|share|library|prompt/i },
  { cluster: 'Documentation', re: /document|template|observability|harness|versioning|workflow diagram/i },
  { cluster: 'Field', re: /ux research|literature review|saas mvp/i },
]

/** New API rows must contain a guide seed term (claude, cursor, mcp, skill, agent) */
const SEED_TERMS_RE = /\b(claude|cursor|mcp|skill|agent)\b/i

const dryRun = process.argv.includes('--dry-run')

function credentials() {
  const login = process.env.DATAFORSEO_LOGIN?.trim() || process.env.DATAFORSEO_USERNAME?.trim()
  const password = process.env.DATAFORSEO_PASSWORD?.trim()
  if (!login || !password) {
    throw new Error(
      'Missing DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in environment.\n' +
        'Get API credentials: https://app.dataforseo.com/api-access\n' +
        'Add to .env.local then run: pnpm seo:keywords',
    )
  }
  return Buffer.from(`${login}:${password}`).toString('base64')
}

async function dataForSeoPost(endpoint, body) {
  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`DataForSEO non-JSON response (${res.status}): ${text.slice(0, 200)}`)
  }

  if (!res.ok) {
    throw new Error(`DataForSEO HTTP ${res.status}: ${json.status_message || text.slice(0, 200)}`)
  }

  const task = json.tasks?.[0]
  if (!task) {
    throw new Error(`DataForSEO empty tasks for ${endpoint}`)
  }
  if (task.status_code !== 20000) {
    throw new Error(`DataForSEO task error: ${task.status_message} (${task.status_code})`)
  }

  return { cost: json.cost ?? task.cost ?? 0, result: task.result?.[0] ?? null }
}

function parseCsv(text) {
  const lines = text.trim().split('\n')
  const header = lines[0].split(',')
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const cols = parseCsvLine(lines[i])
    const row = Object.fromEntries(header.map((key, idx) => [key, cols[idx] ?? '']))
    rows.push(row)
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
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
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
  const lines = [header.join(',')]
  for (const row of rows) {
    lines.push(header.map((key) => escapeCsv(row[key])).join(','))
  }
  return `${lines.join('\n')}\n`
}

function inferCluster(keyword) {
  for (const { cluster, re } of CLUSTER_RULES) {
    if (re.test(keyword)) return cluster
  }
  return 'General'
}

function capitalizeIntent(mainIntent) {
  if (!mainIntent) return 'Informational'
  return mainIntent.charAt(0).toUpperCase() + mainIntent.slice(1)
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

function extractMetrics(item) {
  const keyword = item.keyword?.trim()
  if (!keyword) return null

  const info = item.keyword_info ?? {}
  const props = item.keyword_properties ?? {}
  const intent = item.search_intent_info?.main_intent ?? item.keyword_intent?.label

  const volume = info.search_volume ?? props.search_volume ?? null
  const kd = props.keyword_difficulty ?? info.keyword_difficulty ?? null

  return {
    keyword,
    volume: volume == null ? '' : String(volume),
    kd: kd == null ? '' : String(kd),
    intent: capitalizeIntent(intent),
  }
}

async function fetchKeywordIdeas() {
  const filters = [
    ['keyword_info.search_volume', '>=', MIN_VOLUME],
    'and',
    ['keyword_properties.keyword_difficulty', '<=', MAX_KD],
    'and',
    ['search_intent_info.main_intent', '=', 'informational'],
  ]

  const { cost, result } = await dataForSeoPost('dataforseo_labs/google/keyword_ideas/live', [
    {
      keywords: SEEDS,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      include_serp_info: true,
      closely_variants: true,
      filters,
      order_by: ['keyword_info.search_volume,desc', 'keyword_properties.keyword_difficulty,asc'],
      limit: IDEAS_LIMIT,
    },
  ])

  const items = result?.items ?? []
  const metrics = []
  for (const item of items) {
    const m = extractMetrics(item)
    if (m) metrics.push(m)
  }
  return { cost, metrics, total: result?.total_count ?? metrics.length }
}

async function fetchKeywordOverview(keywords) {
  if (keywords.length === 0) return { cost: 0, metrics: [] }

  const unique = [...new Set(keywords.map((k) => k.toLowerCase()))]
  const { cost, result } = await dataForSeoPost('dataforseo_labs/google/keyword_overview/live', [
    {
      keywords: unique,
      location_code: LOCATION_CODE,
      language_code: LANGUAGE_CODE,
      include_clickstream_data: true,
      include_serp_info: true,
    },
  ])

  const items = result?.items ?? []
  const metrics = []
  for (const item of items) {
    const m = extractMetrics(item)
    if (m) metrics.push(m)
  }
  return { cost, metrics }
}

function mergeRows(existingRows, apiMetrics, validatedDate) {
  const byKey = new Map(existingRows.map((r) => [r.Keyword.toLowerCase(), r]))
  let added = 0
  let updated = 0

  for (const m of apiMetrics) {
    const key = m.keyword.toLowerCase()
    const prev = byKey.get(key)

    if (prev) {
      if (prev.Status !== 'Published' && m.intent !== 'Informational' && m.intent !== 'Navigational') {
        continue
      }
      if (m.volume) prev.Volume = m.volume
      if (m.kd) prev.KD = m.kd
      if (m.intent) prev.Intent = m.intent
      prev.Source = `dataforseo:${validatedDate}`
      if (!prev.SERP_Notes.includes('DataForSEO validated')) {
        prev.SERP_Notes = prev.SERP_Notes
          ? `${prev.SERP_Notes}; DataForSEO validated ${validatedDate}`
          : `DataForSEO validated ${validatedDate}`
      }
      updated++
      continue
    }

    if (m.intent !== 'Informational') continue
    const vol = Number(m.volume)
    const kd = Number(m.kd)
    if (vol < MIN_VOLUME || kd > MAX_KD) continue
    if (!SEED_TERMS_RE.test(m.keyword)) continue

    const row = {
      Keyword: m.keyword,
      Volume: m.volume,
      KD: m.kd,
      Intent: m.intent,
      Status: 'Queued',
      Priority: 'P2',
      Cluster: inferCluster(m.keyword),
      Source: `dataforseo:${validatedDate}`,
      SERP_Notes: `Discovered via keyword_ideas; vol ${m.volume}, KD ${m.kd}`,
      Onie_Angle: 'Review cluster fit before /blog',
    }
    existingRows.push(row)
    byKey.set(key, row)
    added++
  }

  assignPriority(existingRows)
  return { added, updated }
}

async function main() {
  console.log('\nOnie — DataForSEO keyword fetch\n')
  console.log(`Filters: informational, volume >= ${MIN_VOLUME}, KD <= ${MAX_KD}`)
  console.log(`Seeds: ${SEEDS.join(' | ')}\n`)

  const csvText = await readFile(CSV_PATH, 'utf8')
  const { header, rows } = parseCsv(csvText)

  let totalCost = 0

  console.log('▶ keyword_ideas/live …')
  const ideas = await fetchKeywordIdeas()
  totalCost += ideas.cost
  console.log(`  ${ideas.metrics.length} ideas (total pool ~${ideas.total}), cost $${ideas.cost}`)

  const existingKeywords = rows.map((r) => r.Keyword).filter(Boolean)
  console.log('▶ keyword_overview/live (existing CSV keywords) …')
  const overview = await fetchKeywordOverview(existingKeywords)
  totalCost += overview.cost
  console.log(`  ${overview.metrics.length} refreshed, cost $${overview.cost}`)

  const allMetrics = new Map()
  for (const m of [...ideas.metrics, ...overview.metrics]) {
    allMetrics.set(m.keyword.toLowerCase(), m)
  }

  const validatedDate = new Date().toISOString().slice(0, 10)
  const { added, updated } = mergeRows(rows, [...allMetrics.values()], validatedDate)

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

  const meta = {
    runAt: new Date().toISOString(),
    filters: { minVolume: MIN_VOLUME, maxKd: MAX_KD, intent: 'informational' },
    seeds: SEEDS,
    apiCostUsd: totalCost,
    ideasReturned: ideas.metrics.length,
    overviewRefreshed: overview.metrics.length,
    rowsAdded: added,
    rowsUpdated: updated,
    totalRows: rows.length,
  }

  if (dryRun) {
    console.log('\n[dry-run] Top 10 queued by score:')
    for (const row of rows.filter((r) => r.Status === 'Queued').slice(0, 10)) {
      console.log(
        `  ${row.Priority}  vol=${row.Volume}  KD=${row.KD}  ${row.Keyword}`,
      )
    }
    console.log(`\n[dry-run] Would write ${rows.length} rows. API cost ~$${totalCost.toFixed(4)}`)
    return
  }

  await writeFile(CSV_PATH, serializeCsv(header, rows), 'utf8')
  await writeFile(RUN_META_PATH, JSON.stringify(meta, null, 2), 'utf8')

  console.log(`\n✓ keywords.csv updated (+${added} new, ${updated} refreshed)`)
  console.log(`✓ Run meta: references/keyword-research-last-run.json`)
  console.log(`  Estimated API cost: $${totalCost.toFixed(4)}`)
  console.log('\nNext: pick top P1 Queued row → /blog or pnpm … onie-blog skill\n')
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}\n`)
  process.exitCode = 1
})
