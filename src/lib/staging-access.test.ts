import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  canonicalAppResponse,
  parseBasicAuthorization,
  stagingAccessResponse,
} from './staging-access'

afterEach(() => {
  vi.unstubAllGlobals()
})

function request(path = '/', authorization?: string) {
  return new Request(`https://staging.example${path}`, {
    headers: authorization ? { authorization } : undefined,
  })
}

function basic(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`
}

describe('staging access', () => {
  it('does nothing when staging protection is not configured', () => {
    expect(stagingAccessResponse(request(), {})).toBeNull()
  })

  it('rejects missing and incorrect credentials without caching or indexing', () => {
    const missing = stagingAccessResponse(request(), { password: 'a-secure-test-password' })
    const incorrect = stagingAccessResponse(request('/', basic('wollie', 'wrong')), {
      password: 'a-secure-test-password',
    })

    expect(missing?.status).toBe(401)
    expect(missing?.headers.get('cache-control')).toBe('private, no-store')
    expect(missing?.headers.get('x-robots-tag')).toContain('noindex')
    expect(incorrect?.status).toBe(401)
  })

  it('accepts the configured username and password', () => {
    expect(
      stagingAccessResponse(request('/', basic('founder', 'a-secure-test-password')), {
        username: 'founder',
        password: 'a-secure-test-password',
      }),
    ).toBeNull()
  })

  it('leaves Stripe webhooks reachable for signature verification', () => {
    expect(
      stagingAccessResponse(request('/api/stripe/webhook'), {
        password: 'a-secure-test-password',
      }),
    ).toBeNull()
  })
})

describe('canonical app response', () => {
  it('proxies Cloudflare production routes to Railway and preserves the path and query', async () => {
    const fetchMock = vi.fn(async (_request: Request) => new Response('Wollie from Railway'))
    vi.stubGlobal('fetch', fetchMock)

    const response = await canonicalAppResponse(
      new Request('https://wollie.pages.dev/app/accounts?state=test'),
    )

    const upstreamRequest = fetchMock.mock.calls[0]![0]
    expect(upstreamRequest.url).toBe(
      'https://onie-web-production.up.railway.app/app/accounts?state=test',
    )
    expect(upstreamRequest.headers.get('x-forwarded-host')).toBe('wollie.pages.dev')
    expect(await response?.text()).toBe('Wollie from Railway')
  })

  it('rewrites Railway redirects so visitors stay on the Cloudflare address', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(null, {
          status: 302,
          headers: {
            location: 'https://onie-web-production.up.railway.app/login?redirect=%2Fapp',
          },
        }),
      ),
    )

    const response = await canonicalAppResponse(
      new Request('https://wollie.pages.dev/app'),
    )

    expect(response?.headers.get('location')).toBe(
      'https://wollie.pages.dev/login?redirect=%2Fapp',
    )
  })

  it('does not proxy Railway or local requests', async () => {
    expect(
      await canonicalAppResponse(
        new Request('https://onie-web-production.up.railway.app/app/accounts'),
      ),
    ).toBeNull()
    expect(
      await canonicalAppResponse(new Request('http://localhost:3000/app/accounts')),
    ).toBeNull()
  })
})

describe('basic authorization parsing', () => {
  it('keeps colons in the password', () => {
    expect(parseBasicAuthorization(basic('founder', 'pass:word'))).toEqual({
      username: 'founder',
      password: 'pass:word',
    })
  })

  it('rejects malformed authorization', () => {
    expect(parseBasicAuthorization('Bearer token')).toBeNull()
    expect(parseBasicAuthorization('Basic !!!')).toBeNull()
  })
})
