import { describe, expect, it } from 'vitest'
import { isTransactionalEmailConfigured } from './email.server'

describe('transactional email readiness', () => {
  it('requires both a Resend key and sender address', () => {
    expect(isTransactionalEmailConfigured({ RESEND_API_KEY: 're_test', EMAIL_FROM: 'Wollie <test@example.com>' })).toBe(true)
    expect(isTransactionalEmailConfigured({ RESEND_API_KEY: 're_test', EMAIL_FROM: '' })).toBe(false)
    expect(isTransactionalEmailConfigured({ RESEND_API_KEY: '', EMAIL_FROM: 'test@example.com' })).toBe(false)
  })

  it('treats whitespace-only values as missing', () => {
    expect(isTransactionalEmailConfigured({ RESEND_API_KEY: '  ', EMAIL_FROM: '\n' })).toBe(false)
  })
})
