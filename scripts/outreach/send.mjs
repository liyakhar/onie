#!/usr/bin/env node
/**
 * Send approved outreach replies via X API.
 */
import { loadConfig } from './lib/config.mjs'
import { readQueue, appendQueue, writeQueue, countSentToday } from './lib/queue.mjs'
import { missingXEnv, postTweet, tweetIdFromUrl } from './lib/x-api.mjs'

async function main() {
  const missing = missingXEnv(['X_ACCESS_TOKEN', 'X_CLIENT_ID'])
  if (missing.length) {
    console.error(`Missing env: ${missing.join(', ')}`)
    console.error('Run: pnpm outreach:oauth')
    console.error('Or copy manually: pnpm outreach:copy')
    process.exitCode = 1
    return
  }

  const config = await loadConfig()
  const all = await readQueue('pending')
  const approved = all.filter((r) => r.status === 'approved' && !r.sent_at)

  if (!approved.length) {
    console.log('No approved drafts. Run: pnpm outreach:review')
    return
  }

  const sentToday = await countSentToday()
  const isFeed = (r) => r.type === 'feed' || r.classify?.variant === 'feed'
  const replies = approved.filter((r) => !isFeed(r))
  const feeds = approved.filter(isFeed)
  const replyRemaining = config.dailyLimits.replies - sentToday
  const feedRemaining = config.dailyLimits.feed_posts

  if (replyRemaining <= 0 && replies.length) {
    console.log(`Daily reply limit reached (${config.dailyLimits.replies}).`)
  }

  const toSend = [
    ...replies.slice(0, Math.max(0, replyRemaining)),
    ...feeds.slice(0, feedRemaining),
  ]

  if (!toSend.length) {
    console.log('Nothing to send within daily limits.')
    return
  }

  console.log(`Sending ${toSend.length} item(s)…\n`)

  for (const row of toSend) {
    const text = row.approved_text || row.draft_text
    const isFeedPost = isFeed(row)
    const tweetId = isFeedPost ? null : tweetIdFromUrl(row.post_url)

    if (!isFeedPost && !tweetId) {
      console.error(`Skip ${row.id}: could not parse tweet id from ${row.post_url}`)
      continue
    }

    try {
      const replyId = await postTweet(text, tweetId)
      row.sent_at = new Date().toISOString()
      row.reply_id = replyId
      row.status = 'sent'
      await appendQueue(row, 'sent')
      const label = isFeedPost ? 'Feed post' : 'Reply'
      console.log(`✓ ${label} ${replyId}${tweetId ? ` → ${row.post_url}` : ''}`)
    } catch (err) {
      console.error(`✗ Failed ${row.id}: ${err.message}`)
    }
  }

  const sentIds = new Set(toSend.filter((r) => r.sent_at).map((r) => r.id))
  await writeQueue(all.filter((r) => !sentIds.has(r.id)))
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
