import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const OUTREACH = path.join(ROOT, 'outreach')

export function outreachRoot() {
  return OUTREACH
}

export function repoRoot() {
  return ROOT
}

/** Minimal YAML parser for our flat config files (no nested objects). */
function parseSimpleYaml(text) {
  const result = {}
  let currentKey = null
  let currentList = null

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const listItem = trimmed.match(/^- (.+)$/)
    if (listItem && currentKey) {
      currentList ??= []
      currentList.push(listItem[1].replace(/^["']|["']$/g, ''))
      result[currentKey] = currentList
      continue
    }

    const kv = trimmed.match(/^([a-z_]+):\s*(.*)$/i)
    if (kv) {
      currentKey = kv[1]
      currentList = null
      const raw = kv[2].trim()
      if (!raw) {
        result[currentKey] = []
        currentList = result[currentKey]
      } else if (raw === 'true') result[currentKey] = true
      else if (raw === 'false') result[currentKey] = false
      else if (/^\d+$/.test(raw)) result[currentKey] = Number(raw)
      else result[currentKey] = raw.replace(/^["']|["']$/g, '')
    }
  }

  return result
}

/** Parse nested keys like daily_limits.replies from flat yaml with indentation. */
export async function loadConfig() {
  const text = await readFile(path.join(OUTREACH, 'config.yaml'), 'utf8')
  const flat = parseSimpleYaml(text)

  const daily = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^\s{2}(\w+):\s*(\d+)/)
    if (m && line.includes('daily_limits') === false && text.indexOf('daily_limits') < text.indexOf(line)) {
      // handled below
    }
  }

  const dailyBlock = text.match(/daily_limits:\n((?:\s+.+\n)+)/)
  if (dailyBlock) {
    for (const line of dailyBlock[1].split('\n')) {
      const m = line.match(/^\s{2}(\w+):\s*(\d+)/)
      if (m) daily[m[1]] = Number(m[2])
    }
  }

  return {
    siteUrl: process.env.SITE_URL || flat.site_url || 'https://onie-web-production.up.railway.app',
    replyFrom: flat.reply_from || 'personal',
    brandHandle: flat.brand_handle || '@onie',
    requireApproval: flat.require_approval !== false,
    minClassifyScore: Number(flat.min_classify_score) || 3,
    dailyLimits: {
      replies: daily.replies ?? 10,
      dms: daily.dms ?? 3,
      feed_posts: daily.feed_posts ?? 2,
    },
  }
}

export async function loadSignals() {
  const text = await readFile(path.join(OUTREACH, 'signals.yaml'), 'utf8')
  const parsed = parseSimpleYaml(text)
  return {
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    watchAccounts: Array.isArray(parsed.watch_accounts) ? parsed.watch_accounts : [],
    negative: Array.isArray(parsed.negative) ? parsed.negative : [],
    blocklist: Array.isArray(parsed.blocklist) ? parsed.blocklist : [],
    minEngagement: Number(parsed.min_engagement) || 0,
  }
}

export async function readText(relativePath) {
  return readFile(path.join(OUTREACH, relativePath), 'utf8')
}
