import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { outreachRoot } from './config.mjs'

export async function loadTemplate(variant) {
  const fileName =
    variant === 'feed-post' || variant === 'dm-follow-up' || variant.startsWith('reply-')
      ? `${variant}.md`
      : `reply-${variant}.md`
  const file = path.join(outreachRoot(), 'templates', fileName)
  const raw = await readFile(file, 'utf8')
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  const body = match ? match[2].trim() : raw.trim()
  return body
}

export function renderTemplate(body, vars) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key]
    return val != null ? String(val) : `{{${key}}}`
  })
}

export function truncateForTweet(text, max = 280) {
  const trimmed = text.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= max) return trimmed
  const cut = trimmed.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const slice = lastSpace > max - 50 ? cut.slice(0, lastSpace) : cut
  return `${slice.trim()}…`
}
