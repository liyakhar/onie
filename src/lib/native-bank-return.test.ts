import { describe, expect, it } from 'vitest'
import { bankReturnHandoffResponse, nativeBankReturnPath } from './native-bank-return'

describe('native bank return', () => {
  it('accepts the configured bank callback on either production host', () => {
    expect(nativeBankReturnPath('https://wollie.pages.dev/app/accounts?code=abc&state=xyz'))
      .toBe('/app/accounts?code=abc&state=xyz&return=app')
    expect(nativeBankReturnPath('https://onie-web-production.up.railway.app/app/accounts?bank=connected'))
      .toBe('/app/accounts?bank=connected&return=app')
  })

  it('accepts the fallback custom URL scheme', () => {
    expect(nativeBankReturnPath('wollie://bank-return?code=abc&state=xyz'))
      .toBe('/app/accounts?code=abc&state=xyz&return=app')
  })

  it('rejects unrelated links and incomplete callbacks', () => {
    expect(nativeBankReturnPath('https://attacker.example/app/accounts?code=abc&state=xyz')).toBeNull()
    expect(nativeBankReturnPath('https://wollie.pages.dev/app/accounts?code=abc')).toBeNull()
    expect(nativeBankReturnPath('wollie://settings?bank=connected')).toBeNull()
    expect(nativeBankReturnPath('https://wollie.pages.dev/app/accounts')).toBeNull()
  })

  it('hands iPhone callbacks to the app without requiring a browser session', async () => {
    const response = bankReturnHandoffResponse(new Request(
      'https://onie-web-production.up.railway.app/app/accounts?code=a%26b&state=xyz',
      { headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' } },
    ))
    expect(response?.status).toBe(200)
    expect(response?.headers.get('cache-control')).toBe('no-store')
    expect(response?.headers.get('referrer-policy')).toBe('no-referrer')
    const html = await response?.text()
    expect(html).toContain('wollie://bank-return?code=a%26b&amp;state=xyz')
    expect(html).toContain('return=web')
  })

  it('keeps desktop and completed browser callbacks in the web flow', () => {
    const request = new Request('https://wollie.pages.dev/app/accounts?bank=connected')
    const response = bankReturnHandoffResponse(request)
    expect(response?.status).toBe(302)
    expect(response?.headers.get('location'))
      .toBe('https://wollie.pages.dev/app/accounts?bank=connected&return=web')
    expect(bankReturnHandoffResponse(new Request(`${request.url}&return=app`))).toBeNull()
    expect(bankReturnHandoffResponse(new Request(`${request.url}&return=web`))).toBeNull()
  })

  it('preserves the Pages origin when its proxy reaches Railway', () => {
    const response = bankReturnHandoffResponse(new Request(
      'https://onie-web-production.up.railway.app/app/accounts?bank=connected',
      { headers: { 'x-wollie-source-host': 'wollie.pages.dev' } },
    ))
    expect(response?.headers.get('location'))
      .toBe('https://wollie.pages.dev/app/accounts?bank=connected&return=web')
  })
})
