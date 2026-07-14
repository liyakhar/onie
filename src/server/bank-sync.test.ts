import { describe, expect, it } from 'vitest'
import {
  assertSimpleFinUrl,
  buildSimpleFinAccountsRequest,
  buildSimpleFinPersistenceSnapshot,
  isLiveBankSyncEnabled,
  normalizeSimpleFinPayload,
} from './bank-sync'

describe('SimpleFIN bank sync helpers', () => {
  it('requires an explicit flag before live bank sync is enabled', () => {
    const previous = process.env.ENABLE_LIVE_BANK_SYNC

    try {
      process.env.ENABLE_LIVE_BANK_SYNC = 'false'
      expect(isLiveBankSyncEnabled()).toBe(false)

      process.env.ENABLE_LIVE_BANK_SYNC = 'true'
      expect(isLiveBankSyncEnabled()).toBe(true)
    } finally {
      if (previous === undefined) {
        delete process.env.ENABLE_LIVE_BANK_SYNC
      } else {
        process.env.ENABLE_LIVE_BANK_SYNC = previous
      }
    }
  })

  it('builds a credential-free accounts request with basic auth', () => {
    const request = buildSimpleFinAccountsRequest(
      'https://user:secret@bridge.simplefin.org/simplefin/abc',
    )

    expect(request.url).toContain('https://bridge.simplefin.org/simplefin/abc/accounts')
    expect(request.url).toContain('start-date=')
    expect(request.url).toContain('end-date=')
    expect(request.url).not.toContain('user:secret')
    expect(request.authorization).toBe('Basic dXNlcjpzZWNyZXQ=')
  })

  it('rejects non-SimpleFIN hosts and nonstandard ports', () => {
    expect(() =>
      assertSimpleFinUrl('https://example.com/claim', 'SimpleFIN claim URL'),
    ).toThrow('host is not allowed')
    expect(() =>
      assertSimpleFinUrl(
        'https://bridge.simplefin.org:8443/claim',
        'SimpleFIN claim URL',
      ),
    ).toThrow('standard HTTPS port')
    expect(() =>
      assertSimpleFinUrl(
        'https://bridge.simplefin.org/simplefin/claim/example',
        'SimpleFIN claim URL',
      ),
    ).not.toThrow()
  })

  it('normalizes SimpleFIN accounts and transactions into Wollie data', () => {
    const result = normalizeSimpleFinPayload({
      accounts: [
        {
          id: 'acct-1',
          name: 'Everyday Checking',
          org: { name: 'Test Bank' },
          balance: '2500.25',
          'balance-date': 1783900800,
          transactions: [
            {
              id: 'txn-1',
              posted: 1783900800,
              amount: '-42.50',
              description: 'Whole Foods Market',
            },
            {
              id: 'txn-2',
              posted: 1783987200,
              amount: '4200',
              payee: 'Payroll',
            },
          ],
        },
      ],
    })

    expect(result.accounts).toEqual([
      expect.objectContaining({
        id: 'acct-1',
        name: 'Everyday Checking',
        institution: 'Test Bank',
        type: 'Checking',
        balance: 2500.25,
      }),
    ])
    expect(result.transactions).toEqual([
      expect.objectContaining({
        id: 'txn-1',
        merchant: 'Whole Foods Market',
        amount: -42.5,
        category: 'Groceries',
        status: 'cleared',
      }),
      expect.objectContaining({
        id: 'txn-2',
        merchant: 'Payroll',
        amount: 4200,
        category: 'Income',
      }),
    ])
  })

  it('builds stable, database-ready snapshots in minor currency units', () => {
    const syncedAt = new Date('2026-07-14T12:00:00.000Z')
    const result = buildSimpleFinPersistenceSnapshot(
      {
        accounts: [
          {
            id: 'card-1',
            name: 'Travel Credit Card',
            org: { name: 'Test Bank' },
            balance: '-123.456',
            currency: 'eur',
            transactions: [
              {
                posted: 1783987200,
                amount: '-9.995',
                payee: 'Coffee restaurant',
                pending: true,
              },
            ],
          },
        ],
      },
      syncedAt,
    )

    expect(result.accounts[0]).toEqual(
      expect.objectContaining({
        providerAccountId: 'card-1',
        accountType: 'CREDIT_CARD',
        balanceMinor: -12346,
        currency: 'EUR',
        lastSyncedAt: syncedAt,
      }),
    )
    expect(result.accounts[0]?.transactions[0]).toEqual(
      expect.objectContaining({
        providerTransactionId: 'card-1-1783987200-0',
        merchantName: 'Coffee restaurant',
        categoryName: 'Dining',
        amountMinor: -999,
        currency: 'EUR',
        status: 'PENDING',
      }),
    )
  })

  it('generates distinct fallback ids when SimpleFIN omits identifiers', () => {
    const result = buildSimpleFinPersistenceSnapshot({
      accounts: [
        { transactions: [{ amount: '-1' }] },
        { transactions: [{ amount: '-2' }] },
      ],
    })

    expect(result.accounts.map((account) => account.providerAccountId)).toEqual([
      'simplefin-account-0',
      'simplefin-account-1',
    ])
    expect(result.accounts[0]?.transactions[0]?.providerTransactionId).not.toBe(
      result.accounts[1]?.transactions[0]?.providerTransactionId,
    )
  })

  it('flags uncertain merchants for review and recognizes transfers', () => {
    const result = buildSimpleFinPersistenceSnapshot({
      accounts: [
        {
          id: 'checking',
          transactions: [
            { id: 'unknown', amount: '-20', payee: 'ACME 49382' },
            { id: 'transfer', amount: '-500', payee: 'Internal transfer' },
          ],
        },
      ],
    })

    expect(result.accounts[0]?.transactions[0]).toEqual(
      expect.objectContaining({ categoryName: 'Shopping', status: 'NEEDS_REVIEW' }),
    )
    expect(result.accounts[0]?.transactions[1]).toEqual(
      expect.objectContaining({ categoryName: 'Transfer', status: 'CLEARED' }),
    )
  })
})
