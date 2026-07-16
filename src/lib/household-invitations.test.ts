import { describe, expect, it } from 'vitest'
import {
  createInvitationToken,
  hashInvitationToken,
  normalizeInvitationEmail,
} from './household-invitations'

describe('household invitation tokens', () => {
  it('normalizes invitation emails for exact membership checks', () => {
    expect(normalizeInvitationEmail('  Partner@Example.COM ')).toBe('partner@example.com')
    expect(() => normalizeInvitationEmail('not-an-email')).toThrow('valid email')
  })

  it('creates URL-safe, non-repeating invitation tokens', () => {
    const first = createInvitationToken()
    const second = createInvitationToken()
    expect(first).toMatch(/^[A-Za-z0-9_-]{40,}$/)
    expect(second).not.toBe(first)
  })

  it('hashes the same token deterministically without returning the token', async () => {
    const token = createInvitationToken()
    const hash = await hashInvitationToken(token)
    expect(hash).toBe(await hashInvitationToken(token))
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(hash).not.toContain(token)
  })
})
