import { describe, expect, it } from 'vitest'
import {
  buildSimpleFinAccountsRequest,
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
})
