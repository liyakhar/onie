import { describe, expect, it } from 'vitest'
import {
  buildMemberFinanceView,
  combineBasisPointShares,
  validateBasisPointShares,
} from './household-finance'

describe('household finance ownership', () => {
  it('accepts complete integer basis-point splits', () => {
    expect(validateBasisPointShares([
      { memberId: 'owner', shareBasisPoints: 7_000 },
      { memberId: 'partner', shareBasisPoints: 3_000 },
    ])).toEqual([
      { memberId: 'owner', shareBasisPoints: 7_000 },
      { memberId: 'partner', shareBasisPoints: 3_000 },
    ])
  })

  it.each([
    [[{ memberId: 'owner', shareBasisPoints: 9_999 }], 'total 100%'],
    [[{ memberId: 'owner', shareBasisPoints: -1 }, { memberId: 'partner', shareBasisPoints: 10_001 }], 'between 0% and 100%'],
    [[{ memberId: 'owner', shareBasisPoints: 5_000.5 }, { memberId: 'partner', shareBasisPoints: 4_999.5 }], 'whole basis points'],
    [[{ memberId: 'owner', shareBasisPoints: 5_000 }, { memberId: 'owner', shareBasisPoints: 5_000 }], 'only once'],
  ])('rejects invalid splits', (shares, message) => {
    expect(() => validateBasisPointShares(shares)).toThrow(message)
  })

  it('builds exact household-member views from personal and joint accounts', () => {
    const base = {
      members: [
        { id: 'owner', name: 'Alex', role: 'OWNER' as const, householdShareBasisPoints: 7_000 },
        { id: 'partner', name: 'Sam', role: 'MEMBER' as const, householdShareBasisPoints: 3_000 },
      ],
      accounts: [
        {
          id: 'personal',
          name: 'Alex checking',
          type: 'Checking' as const,
          balance: 1_000,
          institution: 'Bank',
          lastSynced: 'Now',
          ownership: [{ memberId: 'owner', shareBasisPoints: 10_000 }],
        },
        {
          id: 'joint',
          name: 'Joint checking',
          type: 'Checking' as const,
          balance: 2_000,
          institution: 'Bank',
          lastSynced: 'Now',
          ownership: [
            { memberId: 'owner', shareBasisPoints: 7_000 },
            { memberId: 'partner', shareBasisPoints: 3_000 },
          ],
        },
      ],
      transactions: [
        { id: 'personal-income', accountId: 'personal', date: '2026-07-01', merchant: 'Payroll', account: 'Alex checking', category: 'Income' as const, amount: 1_000, status: 'cleared' as const },
        { id: 'joint-food', accountId: 'joint', date: '2026-07-02', merchant: 'Market', account: 'Joint checking', category: 'Groceries' as const, amount: -100, status: 'cleared' as const },
      ],
      budget: [{ name: 'Groceries' as const, allocated: 500, spent: 100 }],
      recurringPayments: [{ id: 'rent', merchant: 'Rent', amount: 1_000, cadence: 'monthly' as const, nextDate: '2026-07-20', category: 'Housing' as const, confirmed: true }],
    }

    const owner = buildMemberFinanceView(base, 'owner')
    const partner = buildMemberFinanceView(base, 'partner')

    expect(owner.accounts.map((account) => account.balance)).toEqual([1_000, 1_400])
    expect(partner.accounts.map((account) => account.balance)).toEqual([600])
    expect(owner.transactions.map((transaction) => transaction.amount)).toEqual([1_000, -70])
    expect(partner.transactions.map((transaction) => transaction.amount)).toEqual([-30])
    expect(owner.budget[0]).toEqual(expect.objectContaining({ allocated: 350, spent: 70 }))
    expect(partner.budget[0]).toEqual(expect.objectContaining({ allocated: 150, spent: 30 }))
    expect(owner.recurringPayments[0]?.amount).toBe(700)
    expect(partner.recurringPayments[0]?.amount).toBe(300)
  })

  it('rounds ownership scaling to cents', () => {
    const view = buildMemberFinanceView({
      members: [{ id: 'owner', name: 'Alex', role: 'OWNER', householdShareBasisPoints: 3_333 }],
      accounts: [{ id: 'joint', name: 'Joint', type: 'Checking', balance: 10.01, institution: 'Bank', lastSynced: 'Now', ownership: [{ memberId: 'owner', shareBasisPoints: 3_333 }] }],
      transactions: [],
      budget: [],
      recurringPayments: [],
    }, 'owner')

    expect(view.accounts[0]?.balance).toBe(3.34)
  })

  it('combines departing member ownership into the remaining owner share', () => {
    expect(combineBasisPointShares(5_000, 5_000)).toBe(10_000)
    expect(combineBasisPointShares(undefined, 3_000)).toBe(3_000)
    expect(() => combineBasisPointShares(8_000, 3_000)).toThrow('between 0% and 100%')
  })
})
