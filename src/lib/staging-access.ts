export type StagingAccessConfig = {
  password?: string
  username?: string
}

const railwayProductionUrl = 'https://onie-web-production.up.railway.app'

export function canonicalAppRedirect(
  request: Request,
  canonicalUrl = process.env.CANONICAL_APP_URL || railwayProductionUrl,
): Response | null {
  const source = new URL(request.url)
  const isCloudflareDeployment =
    source.hostname === 'wollie.pages.dev' || source.hostname.endsWith('.wollie.pages.dev')

  if (!isCloudflareDeployment) return null

  const target = new URL(canonicalUrl)
  target.pathname = source.pathname
  target.search = source.search

  return new Response(null, {
    status: 307,
    headers: {
      'cache-control': 'no-store',
      location: target.toString(),
    },
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
