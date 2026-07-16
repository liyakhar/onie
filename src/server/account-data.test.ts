import { describe, expect, it } from 'vitest'
import { buildAccountOwnershipCsv, buildTransactionsCsv } from './account-data'

const backup = {
  finance: {
    currentMemberId: 'member_1',
    workspace: {
      members: [{ id: 'member_1', user: { name: 'Liya' } }],
      accounts: [{
        id: 'account_1',
        name: 'Joint current',
        institution: 'Test Bank',
        type: 'CHECKING',
        currency: 'EUR',
        balanceMinor: 12_345,
        lastSyncedAt: new Date('2026-07-16T10:00:00Z'),
        ownershipShares: [{
          memberId: 'member_1',
          shareBasisPoints: 6_000,
          member: { role: 'OWNER', user: { name: 'Liya', email: 'liya@example.test' } },
        }],
      }],
      transactions: [{
        accountId: 'account_1',
        postedAt: new Date('2026-07-15T12:00:00Z'),
        account: { name: 'Joint current', institution: 'Test Bank' },
        description: 'Market, "weekly"',
        merchant: { name: 'Test Market' },
        category: { name: 'Groceries' },
        status: 'CLEARED',
        recurring: false,
        amountMinor: -10_000,
        currency: 'EUR',
        notes: null,
      }],
    },
  },
} as unknown as Parameters<typeof buildTransactionsCsv>[0]

describe('account data export', () => {
  it('exports only the current member share for personal transactions', () => {
    const csv = buildTransactionsCsv(backup, 'personal')

    expect(csv).toContain('-60.00,EUR,Liya')
    expect(csv).toContain('"Market, ""weekly"""')
    expect(csv).not.toContain('-100.00')
  })

  it('exports ownership percentages and account metadata', () => {
    const csv = buildAccountOwnershipCsv(backup)

    expect(csv).toContain('Joint current,Test Bank,CHECKING,EUR,123.45')
    expect(csv).toContain('liya@example.test,OWNER,60')
  })
})
