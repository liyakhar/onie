const TOKEN_URL = 'https://api.x.com/2/oauth2/token'

export function tweetIdFromUrl(url) {
  const m = url?.match(/status\/(\d+)/)
  return m?.[1] ?? null
}

export function tweetUrl(username, tweetId) {
  return `https://x.com/${username}/status/${tweetId}`
}

export function missingXEnv(keys = ['X_ACCESS_TOKEN']) {
  return keys.filter((k) => !process.env[k]?.trim())
}

export async function refreshAccessToken() {
  const clientId = process.env.X_CLIENT_ID
  const clientSecret = process.env.X_CLIENT_SECRET
  const refreshToken = process.env.X_REFRESH_TOKEN
  if (!clientId || !refreshToken) return null

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  })

  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
  }

  const res = await fetch(TOKEN_URL, { method: 'POST', headers, body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error_description || data.error || `Token refresh failed (${res.status})`)
  }
  return data
}

let cachedToken = process.env.X_ACCESS_TOKEN

export async function getAccessToken() {
  if (cachedToken) return cachedToken
  const refreshed = await refreshAccessToken()
  if (refreshed?.access_token) {
    cachedToken = refreshed.access_token
    return cachedToken
  }
  throw new Error('No X_ACCESS_TOKEN and refresh failed')
}

export async function xFetch(path, options = {}) {
  const token = await getAccessToken()
  const res = await fetch(`https://api.x.com/2${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.detail || data.title || data.errors?.[0]?.message || res.statusText
    throw new Error(`${msg} (HTTP ${res.status})`)
  }
  return data
}

export async function fetchTweet(tweetId) {
  const data = await xFetch(
    `/tweets/${tweetId}?tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username,name`,
  )
  const author = data.includes?.users?.[0]
  return {
    id: data.data.id,
    text: data.data.text,
    authorHandle: author ? `@${author.username}` : null,
    authorName: author?.name ?? null,
    metrics: data.data.public_metrics,
    url: author ? tweetUrl(author.username, data.data.id) : `https://x.com/i/status/${tweetId}`,
  }
}

export async function searchRecentTweets(query, maxResults = 10) {
  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(Math.max(maxResults, 10), 100)),
    'tweet.fields': 'created_at,public_metrics,author_id',
    expansions: 'author_id',
    'user.fields': 'username',
  })
  const data = await xFetch(`/tweets/search/recent?${params}`)
  const users = Object.fromEntries((data.includes?.users ?? []).map((u) => [u.id, u]))
  return (data.data ?? []).map((t) => {
    const u = users[t.author_id]
    return {
      id: t.id,
      text: t.text,
      authorHandle: u ? `@${u.username}` : null,
      metrics: t.public_metrics,
      url: u ? tweetUrl(u.username, t.id) : `https://x.com/i/status/${t.id}`,
    }
  })
}

export async function postTweet(text, inReplyToTweetId = null) {
  const body = { text }
  if (inReplyToTweetId) body.reply = { in_reply_to_tweet_id: inReplyToTweetId }
  const data = await xFetch('/tweets', { method: 'POST', body: JSON.stringify(body) })
  return data.data?.id
}

export function buildSearchQuery(signals) {
  const terms = [...signals.keywords.slice(0, 8), ...signals.hashtags.slice(0, 4)]
  const positive = terms.map((t) => (t.includes(' ') ? `"${t}"` : t)).join(' OR ')
  const negatives = signals.negative.map((n) => `-"${n}"`).join(' ')
  return `(${positive}) ${negatives}`.trim()
}
