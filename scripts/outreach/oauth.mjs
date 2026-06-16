#!/usr/bin/env node
/**
 * OAuth 2.0 PKCE flow — get X_ACCESS_TOKEN and X_REFRESH_TOKEN.
 *
 * Prereqs in .env.local: X_CLIENT_ID, X_CLIENT_SECRET
 * Callback URL in X app settings: http://127.0.0.1:4150/callback
 *
 * Usage: pnpm outreach:oauth
 */
import crypto from 'node:crypto'
import http from 'node:http'
import { URL, URLSearchParams } from 'node:url'

const PORT = Number(process.env.X_OAUTH_PORT || 4150)
const REDIRECT_URI = process.env.X_OAUTH_REDIRECT || `http://127.0.0.1:${PORT}/callback`
const SCOPES = [
  'tweet.read',
  'tweet.write',
  'users.read',
  'offline.access',
].join(' ')

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function parseEnv() {
  const clientId = process.env.X_CLIENT_ID?.trim()
  const clientSecret = process.env.X_CLIENT_SECRET?.trim()
  if (!clientId) {
    console.error('Set X_CLIENT_ID in .env.local first.')
    process.exit(1)
  }
  return { clientId, clientSecret }
}

async function exchangeCode(code, verifier, clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
    client_id: clientId,
  })
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (clientSecret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
  }
  const res = await fetch('https://api.x.com/2/oauth2/token', { method: 'POST', headers, body })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || data.error || res.statusText)
  return data
}

async function fetchMe(accessToken) {
  const res = await fetch('https://api.x.com/2/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || res.statusText)
  return data.data
}

async function main() {
  const { clientId, clientSecret } = parseEnv()
  const verifier = base64url(crypto.randomBytes(32))
  const challenge = base64url(crypto.createHash('sha256').update(verifier).digest())
  const state = base64url(crypto.randomBytes(16))

  const authParams = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  const authUrl = `https://twitter.com/i/oauth2/authorize?${authParams}`

  console.log('\nX OAuth setup\n')
  console.log(`1. Ensure callback URL in your X app: ${REDIRECT_URI}`)
  console.log(`2. Opening browser (or open manually):\n   ${authUrl}\n`)

  const open =
    process.platform === 'darwin'
      ? 'open'
      : process.platform === 'win32'
        ? 'start'
        : 'xdg-open'
  import('node:child_process').then(({ spawn }) => {
    spawn(open, [authUrl], { stdio: 'ignore', detached: true }).unref()
  })

  const tokens = await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
        if (url.pathname !== '/callback') {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        if (url.searchParams.get('state') !== state) throw new Error('State mismatch')
        const code = url.searchParams.get('code')
        if (!code) throw new Error(url.searchParams.get('error_description') || 'No code')

        const tokenData = await exchangeCode(code, verifier, clientId, clientSecret)
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end('<html><body><h1>Authorized</h1><p>You can close this tab and return to the terminal.</p></body></html>')
        server.close()
        resolve(tokenData)
      } catch (err) {
        res.writeHead(500)
        res.end('Authorization failed')
        server.close()
        reject(err)
      }
    })
    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Waiting for callback on ${REDIRECT_URI} …`)
    })
  })

  const me = await fetchMe(tokens.access_token)

  console.log('\n--- Add to .env.local ---\n')
  console.log(`X_ACCESS_TOKEN="${tokens.access_token}"`)
  if (tokens.refresh_token) console.log(`X_REFRESH_TOKEN="${tokens.refresh_token}"`)
  console.log(`X_HANDLE="${me.username}"`)
  console.log('\n--------------------------\n')
  console.log(`Authorized as @${me.username} (${me.name})`)
  console.log('Run: pnpm outreach:check')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exitCode = 1
})
