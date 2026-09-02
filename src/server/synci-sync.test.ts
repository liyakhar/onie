import { describe, expect, it } from 'vitest'
import { buildSynciSnapshot, isSynciPublicAccessEnabled } from './synci-sync'

describe('Synci managed bank sync helpers', () => {
  it('requires live sync, explicit public access, and managed app credentials', () => {
    const previous = {
      live: process.env.ENABLE_LIVE_BANK_SYNC,
      publicAccess: process.env.SYNCI_PUBLIC_ACCESS_ENABLED,
      clientId: process.env.SYNCI_MANAGED_CLIENT_ID,
      clientSecret: process.env.SYNCI_MANAGED_CLIENT_SECRET,
    }

    try {
      process.env.ENABLE_LIVE_BANK_SYNC = 'true'
      process.env.SYNCI_PUBLIC_ACCESS_ENABLED = 'true'
      process.env.SYNCI_MANAGED_CLIENT_ID = 'client-id'
      process.env.SYNCI_MANAGED_CLIENT_SECRET = 'client-secret'
      expect(isSynciPublicAccessEnabled()).toBe(true)

      process.env.SYNCI_PUBLIC_ACCESS_ENABLED = 'false'
      expect(isSynciPublicAccessEnabled()).toBe(false)
    } finally {
      restoreEnv('ENABLE_LIVE_BANK_SYNC', previous.live)
      restoreEnv('SYNCI_PUBLIC_ACCESS_ENABLED', previous.publicAccess)
      restoreEnv('SYNCI_MANAGED_CLIENT_ID', previous.clientId)
      restoreEnv('SYNCI_MANAGED_CLIENT_SECRET', previous.clientSecret)
    }
  })

  it('normalizes accounts, balances, institutions, and transactions', () => {
    const syncedAt = new Date('2026-08-31T12:00:00.000Z')
    const result = buildSynciSnapshot(
      [
        {
          id: 42,
          display_name: 'Everyday EUR',
          currency: 'eur',
          cash_account_type: 'CACC',
          balance: { available: '1250.55', cleared: '1200' },
          transactions_last_synced_at: '2026-08-31T11:55:00.000Z',
          financial_connection: { institution: { name: 'Wise' } },
        },
      ],
      [
        {
          id: 101,
          financial_account_id: 42,
          amount: '-52.89',
          currency: 'EUR',
          booked: true,
          booking_date: '2026-08-30',
          creditor: { name: 'City Pharmacy' },
          enriched: {
            counterparty: { name: 'City Pharmacy' },
            category_general: 'Health',
          },
        },
        {
          id: 102,
          financial_account_id: 42,
          amount: '4000',
          currency: 'EUR',
          booked: false,
          booking_date: '2026-08-31',
          debtor: { name: 'Payroll' },
        },
      ],
      syncedAt,
    )

    expect(result.accounts[0]).toEqual(
      expect.objectContaining({
        providerAccountId: '42',
        name: 'Everyday EUR',
        institution: 'Wise',
        accountType: 'CHECKING',
        balanceMinor: 125055,
        currency: 'EUR',
      }),
    )
    expect(result.accounts[0]?.transactions).toEqual([
      expect.objectContaining({
        providerTransactionId: '101',
        merchantName: 'City Pharmacy',
        categoryName: 'Health',
        amountMinor: -5289,
        status: 'CLEARED',
      }),
      expect.objectContaining({
        providerTransactionId: '102',
        merchantName: 'Payroll',
        categoryName: 'Income',
        amountMinor: 400000,
        status: 'PENDING',
      }),
    ])
  })

  it('uses stable external transaction identifiers when available', () => {
    const result = buildSynciSnapshot(
      [{ id: 'account-1' }],
      [
        {
          id: 123,
          financial_account_id: 'account-1',
          amount: '-20',
          currency: 'EUR',
          booked: true,
          external_identifiers: { institution_transaction_id: 'bank-txn-1' },
        },
      ],
    )

    expect(result.accounts[0]?.transactions[0]?.providerTransactionId).toBe(
      'bank-txn-1',
    )
  })
})

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}
