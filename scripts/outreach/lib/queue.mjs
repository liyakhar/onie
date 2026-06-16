import { appendFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { outreachRoot } from './config.mjs'

const QUEUE_DIR = path.join(outreachRoot(), 'queue')

export async function ensureQueueDir() {
  await mkdir(QUEUE_DIR, { recursive: true })
}

function queuePath(name) {
  return path.join(QUEUE_DIR, `${name}.jsonl`)
}

export async function appendQueue(row, file = 'pending') {
  await ensureQueueDir()
  await appendFile(queuePath(file), `${JSON.stringify(row)}\n`, 'utf8')
}

export async function readQueue(file = 'pending') {
  try {
    const text = await readFile(queuePath(file), 'utf8')
    return text
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

export async function writeQueue(rows, file = 'pending') {
  await ensureQueueDir()
  const body = rows.length ? `${rows.map((r) => JSON.stringify(r)).join('\n')}\n` : ''
  const { writeFile } = await import('node:fs/promises')
  await writeFile(queuePath(file), body, 'utf8')
}

export function newQueueRow({ postUrl, postText, authorHandle, classify, draftText }) {
  return {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    status: 'pending',
    post_url: postUrl,
    post_text: postText,
    author_handle: authorHandle || null,
    classify,
    draft_text: draftText,
    approved_text: null,
    sent_at: null,
    reply_id: null,
  }
}

export async function countSentToday() {
  const sent = await readQueue('sent')
  const today = new Date().toISOString().slice(0, 10)
  return sent.filter((r) => r.sent_at?.startsWith(today)).length
}
