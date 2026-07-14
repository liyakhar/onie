import { describe, expect, it } from 'vitest'
import {
  decryptCredential,
  encryptCredential,
  isEncryptedCredential,
} from './credential-crypto'

const secret = 'test-only-bank-sync-secret-that-is-long-enough'

describe('bank credential encryption', () => {
  it('round trips a credential without storing plaintext', async () => {
    const credential = 'https://user:secret@bridge.simplefin.org/simplefin/access'
    const encrypted = await encryptCredential(credential, secret)

    expect(isEncryptedCredential(encrypted)).toBe(true)
    expect(encrypted).not.toContain('user')
    expect(encrypted).not.toContain('secret')
    await expect(decryptCredential(encrypted, secret)).resolves.toBe(credential)
  })

  it('uses a unique nonce for each encryption', async () => {
    const first = await encryptCredential('same credential', secret)
    const second = await encryptCredential('same credential', secret)

    expect(first).not.toBe(second)
  })

  it('rejects the wrong encryption key and plaintext values', async () => {
    const encrypted = await encryptCredential('credential', secret)

    await expect(
      decryptCredential(encrypted, 'different-test-secret-that-is-long-enough'),
    ).rejects.toThrow()
    await expect(decryptCredential('plaintext', secret)).rejects.toThrow(
      'supported format',
    )
  })
})
