export type StagingAccessConfig = {
  password?: string
  username?: string
}

const railwayProductionUrl = 'https://onie-web-production.up.railway.app'

export async function canonicalAppResponse(
  request: Request,
  canonicalUrl = process.env.CANONICAL_APP_URL || railwayProductionUrl,
): Promise<Response | null> {
  const source = new URL(request.url)
  const isCloudflareDeployment =
    source.hostname === 'wollie.pages.dev' || source.hostname.endsWith('.wollie.pages.dev')

  if (!isCloudflareDeployment) return null

  const target = new URL(canonicalUrl)
  target.pathname = source.pathname
  target.search = source.search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.set('x-forwarded-host', source.host)
  headers.set('x-forwarded-proto', source.protocol.slice(0, -1))
  headers.set('x-wollie-source-host', source.host)

  if (headers.get('origin') === source.origin) {
    headers.set('origin', target.origin)
  }

  const referer = headers.get('referer')
  if (referer?.startsWith(`${source.origin}/`)) {
    headers.set('referer', `${target.origin}${referer.slice(source.origin.length)}`)
  }

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    init.duplex = 'half'
  }

  const upstream = await fetch(new Request(target, init))
  const responseHeaders = new Headers(upstream.headers)
  const location = responseHeaders.get('location')

  if (location) {
    const redirect = new URL(location, target)
    if (redirect.origin === target.origin) {
      redirect.protocol = source.protocol
      redirect.host = source.host
      responseHeaders.set('location', redirect.toString())
    }
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}

export function stagingAccessResponse(
  request: Request,
  config: StagingAccessConfig,
): Response | null {
  const password = config.password?.trim()
  if (!password || isSignedProviderCallback(request)) return null

  const credentials = parseBasicAuthorization(request.headers.get('authorization'))
  const expectedUsername = config.username?.trim() || 'wollie'
  if (
    credentials &&
    constantTimeEqual(credentials.username, expectedUsername) &&
    constantTimeEqual(credentials.password, password)
  ) {
    return null
  }

  return new Response('Private Wollie staging. Sign in with the staging access credentials.', {
    status: 401,
    headers: {
      'cache-control': 'private, no-store',
      'content-type': 'text/plain; charset=utf-8',
      'www-authenticate': 'Basic realm="Wollie staging", charset="UTF-8"',
      'x-robots-tag': 'noindex, nofollow, noarchive',
    },
  })
}

export function parseBasicAuthorization(value: string | null) {
  if (!value?.startsWith('Basic ')) return null
  try {
    const decoded = atob(value.slice(6).trim())
    const separator = decoded.indexOf(':')
    if (separator < 0) return null
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    }
  } catch {
    return null
  }
}

function isSignedProviderCallback(request: Request) {
  const pathname = new URL(request.url).pathname
  return pathname === '/api/stripe/webhook'
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder()
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  const length = Math.max(leftBytes.length, rightBytes.length)
  let mismatch = leftBytes.length ^ rightBytes.length
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0)
  }
  return mismatch === 0
}
