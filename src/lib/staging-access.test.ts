import { describe, expect, it } from 'vitest'
import {
  canonicalAppRedirect,
  parseBasicAuthorization,
  stagingAccessResponse,
} from './staging-access'

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

describe('canonical app redirect', () => {
  it('redirects Cloudflare production routes to Railway and preserves the path and query', () => {
    const response = canonicalAppRedirect(
      new Request('https://wollie.pages.dev/app/accounts?state=test'),
    )

    expect(response?.status).toBe(307)
    expect(response?.headers.get('location')).toBe(
      'https://onie-web-production.up.railway.app/app/accounts?state=test',
    )
    expect(response?.headers.get('cache-control')).toBe('no-store')
  })

  it('redirects Cloudflare preview deployments too', () => {
    const response = canonicalAppRedirect(
      new Request('https://75e573a5.wollie.pages.dev/pricing'),
    )

    expect(response?.headers.get('location')).toBe(
      'https://onie-web-production.up.railway.app/pricing',
    )
  })

  it('does not redirect Railway or local requests', () => {
    expect(
      canonicalAppRedirect(
        new Request('https://onie-web-production.up.railway.app/app/accounts'),
      ),
    ).toBeNull()
    expect(
      canonicalAppRedirect(new Request('http://localhost:3000/app/accounts')),
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
