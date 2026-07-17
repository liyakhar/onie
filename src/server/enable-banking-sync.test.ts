import { afterEach, describe, expect, it } from 'vitest'
import {
  assertEnableBankingAccessAllowed,
  buildEnableBankingSnapshot,
  createProviderJwt,
} from './enable-banking-sync'

const originalApplicationId = process.env.ENABLE_BANKING_APPLICATION_ID
const originalPrivateKey = process.env.ENABLE_BANKING_PRIVATE_KEY
const originalNodeEnv = process.env.NODE_ENV
const originalLiveSync = process.env.ENABLE_LIVE_BANK_SYNC
const originalEnvironment = process.env.ENABLE_BANKING_ENVIRONMENT
const originalPublicAccess = process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED
const originalRestrictedTesting = process.env.ENABLE_BANKING_RESTRICTED_TESTING
const originalStagingPassword = process.env.STAGING_ACCESS_PASSWORD

afterEach(() => {
  restoreEnv('ENABLE_BANKING_APPLICATION_ID', originalApplicationId)
  restoreEnv('ENABLE_BANKING_PRIVATE_KEY', originalPrivateKey)
  restoreEnv('NODE_ENV', originalNodeEnv)
  restoreEnv('ENABLE_LIVE_BANK_SYNC', originalLiveSync)
  restoreEnv('ENABLE_BANKING_ENVIRONMENT', originalEnvironment)
  restoreEnv('ENABLE_BANKING_PUBLIC_ACCESS_APPROVED', originalPublicAccess)
  restoreEnv('ENABLE_BANKING_RESTRICTED_TESTING', originalRestrictedTesting)
  restoreEnv('STAGING_ACCESS_PASSWORD', originalStagingPassword)
})

describe('Enable Banking sync helpers', () => {
  it('normalizes balances and signed transactions into Wollie data', () => {
    const account = {
      uid: 'session-account-1',
      identification_hash: 'stable-account-1',
      identifications: [{ identification: 'BE12345678901234', scheme_name: 'IBAN' }],
      currency: 'EUR',
      cash_account_type: 'CACC',
      details: 'Everyday account',
    }
    const snapshot = buildEnableBankingSnapshot(
      { bankName: 'ING', accounts: [account] },
      new Map([[
        account.uid,
        {
          balances: [{ balance_type: 'ITAV', balance_amount: { amount: '1234.56', currency: 'EUR' } }],
          transactions: [{
            entry_reference: 'entry-1',
            booking_date: '2026-07-14',
            credit_debit_indicator: 'DBIT',
            status: 'BOOK',
            transaction_amount: { amount: '42.50', currency: 'EUR' },
            creditor: { name: 'Carrefour Market' },
          }],
        },
      ]]),
    )

    expect(snapshot.accounts[0]).toEqual(expect.objectContaining({
      providerAccountId: 'stable-account-1',
      name: 'Everyday account',
      institution: 'ING',
      balanceMinor: 123456,
      currency: 'EUR',
    }))
    expect(snapshot.accounts[0]?.transactions[0]).toEqual(expect.objectContaining({
      providerTransactionId: 'entry-1',
      merchantName: 'Carrefour Market',
      amountMinor: -4250,
      categoryName: 'Groceries',
      status: 'CLEARED',
    }))
  })

  it('turns Wise card descriptions into readable merchant names', () => {
    const account = { uid: 'wise-eur', currency: 'EUR', details: 'EUR' }
    const snapshot = buildEnableBankingSnapshot(
      { bankName: 'Wise', accounts: [account] },
      new Map([[
        account.uid,
        {
          balances: [],
          transactions: [{
            entry_reference: 'card-1',
            booking_date: '2026-07-10',
            credit_debit_indicator: 'DBIT',
            transaction_amount: { amount: '11.20', currency: 'EUR' },
            remittance_information: ['CARD-4037956791', 'Card transaction of 11.20 EUR issued by Mac Donald Chinon CHINON'],
          }],
        },
      ]]),
    )

    expect(snapshot.accounts[0]?.transactions[0]?.merchantName).toBe('Mac Donald Chinon')
  })

  it('creates an RS256 JWT that verifies with the matching public key', async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
      true,
      ['sign', 'verify'],
    )
    const privateBytes = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey))
    process.env.ENABLE_BANKING_APPLICATION_ID = 'test-application-id'
    process.env.ENABLE_BANKING_PRIVATE_KEY = toPem(privateBytes)

    const token = await createProviderJwt(1_800_000_000)
    const [header, payload, signature] = token.split('.')
    const decodedHeader = JSON.parse(Buffer.from(header!, 'base64url').toString('utf8'))
    const decodedPayload = JSON.parse(Buffer.from(payload!, 'base64url').toString('utf8'))
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      pair.publicKey,
      Buffer.from(signature!, 'base64url'),
      new TextEncoder().encode(`${header}.${payload}`),
    )

    expect(decodedHeader).toEqual({ typ: 'JWT', alg: 'RS256', kid: 'test-application-id' })
    expect(decodedPayload).toEqual(expect.objectContaining({
      iss: 'enablebanking.com',
      aud: 'api.enablebanking.com',
      iat: 1_800_000_000,
      exp: 1_800_000_300,
    }))
    expect(verified).toBe(true)
  })

  it('allows sandbox bank sync in production only behind private staging access', () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_LIVE_BANK_SYNC = 'true'
    process.env.ENABLE_BANKING_ENVIRONMENT = 'sandbox'
    delete process.env.STAGING_ACCESS_PASSWORD

    expect(() => assertEnableBankingAccessAllowed()).toThrow('private staging')
    process.env.STAGING_ACCESS_PASSWORD = 'private-staging-password'
    expect(() => assertEnableBankingAccessAllowed()).not.toThrow()
  })

  it('blocks public bank sync until unrestricted provider access is approved', () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_LIVE_BANK_SYNC = 'true'
    process.env.ENABLE_BANKING_ENVIRONMENT = 'production'
    process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED = 'false'
    process.env.ENABLE_BANKING_RESTRICTED_TESTING = 'false'

    expect(() => assertEnableBankingAccessAllowed()).toThrow('not approved')
    process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED = 'true'
    expect(() => assertEnableBankingAccessAllowed()).not.toThrow()
  })

  it('allows production bank sync for restricted tester mode without public access approval', () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_LIVE_BANK_SYNC = 'true'
    process.env.ENABLE_BANKING_ENVIRONMENT = 'production'
    process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED = 'false'
    process.env.ENABLE_BANKING_RESTRICTED_TESTING = 'true'

    expect(() => assertEnableBankingAccessAllowed()).not.toThrow()
  })
})

function toPem(value: Uint8Array) {
  const encoded = Buffer.from(value).toString('base64').match(/.{1,64}/g)?.join('\n') || ''
  return `-----BEGIN PRIVATE KEY-----\n${encoded}\n-----END PRIVATE KEY-----`
}

function restoreEnv(name: string, value?: string) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}
