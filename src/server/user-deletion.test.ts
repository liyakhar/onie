import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  billing: vi.fn(),
  partnerCount: vi.fn(),
  revoke: vi.fn(),
  transaction: vi.fn(),
}))

const tx = {
  bankConnection: {
    findMany: vi.fn(async () => []),
    deleteMany: vi.fn(),
  },
  financeTransaction: { deleteMany: vi.fn() },
  financialAccount: { deleteMany: vi.fn() },
  syncRun: { deleteMany: vi.fn() },
}

const prisma = {
  billingSubscription: { findUnique: mocks.billing },
  workspaceMember: {
    count: mocks.partnerCount,
    findMany: vi.fn(async () => []),
  },
  $transaction: mocks.transaction,
}

vi.mock('#/server/db-access.server', () => ({
  getDb: vi.fn(async () => prisma),
}))

vi.mock('#/server/enable-banking-sync', () => ({
  revokeEnableBankingBeforeUserDeletion: mocks.revoke,
}))

import { assertHouseholdDeletionAllowed, prepareUserDeletion } from './user-deletion.server'

describe('account deletion safety', () => {
  beforeEach(() => {
    mocks.billing.mockReset().mockResolvedValue(null)
    mocks.partnerCount.mockReset().mockResolvedValue(0)
    mocks.revoke.mockReset().mockResolvedValue(undefined)
    mocks.transaction.mockReset().mockImplementation(async (callback) => callback(tx))
  })

  it('allows deleting a personal household owner', () => {
    expect(() => assertHouseholdDeletionAllowed(0)).not.toThrow()
  })

  it('blocks owner deletion while another member remains', () => {
    expect(() => assertHouseholdDeletionAllowed(1)).toThrow('Remove your partner')
  })

  it('blocks deletion before bank revocation when subscription renewal is active', async () => {
    mocks.billing.mockResolvedValue({ status: 'active', cancelAtPeriodEnd: false })

    await expect(prepareUserDeletion('user_1')).rejects.toThrow('Cancel subscription renewal')
    expect(mocks.revoke).not.toHaveBeenCalled()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })

  it('revokes bank access and deletes owned bank data after renewal is canceled', async () => {
    mocks.billing.mockResolvedValue({ status: 'active', cancelAtPeriodEnd: true })

    await expect(prepareUserDeletion('user_1')).resolves.toBeUndefined()
    expect(mocks.revoke).toHaveBeenCalledWith('user_1')
    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(tx.bankConnection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { userId: 'user_1' },
    }))
  })
})
