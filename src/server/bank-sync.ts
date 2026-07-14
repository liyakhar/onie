import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import {
  type BankSyncStatus,
  type FinanceCategory,
  type FinanceTransaction,
  type FinancialAccount,
} from '#/lib/finance-demo'

export type BankSyncProviderId = 'demo' | 'simplefin' | 'gocardless' | 'plaid'

export type NormalizedBankConnection = {
  provider: BankSyncProviderId
  status: BankSyncStatus
  accounts: FinancialAccount[]
  transactions: FinanceTransaction[]
}

export type BankSyncProvider = {
  id: BankSyncProviderId
  name: string
  isConfigured(): boolean
  getConnection(): Promise<NormalizedBankConnection>
}

type SimpleFinResponse = {
  errlist?: SimpleFinError[]
  accounts?: SimpleFinAccount[]
}

type SimpleFinError = {
  code?: string
  msg?: string
}

type SimpleFinAccount = {
  id?: string
  name?: string
  org?: {
    name?: string
  }
  balance?: string | number
  currency?: string
  ['balance-date']?: number
  transactions?: SimpleFinTransaction[]
}

type SimpleFinTransaction = {
  id?: string
  posted?: number
  amount?: string | number
  description?: string
  payee?: string
  pending?: boolean
}

type SimpleFinConnectionRecord = {
  id: string
  userId: string
  workspaceId: string
  accessUrl: string
}

export type SimpleFinPersistenceSnapshot = {
  accounts: Array<{
    providerAccountId: string
    name: string
    institution: string
    accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD'
    balanceMinor: number
    currency: string
    lastSyncedAt: Date
    transactions: Array<{
      providerTransactionId: string
      postedAt: Date
      description: string
      merchantName: string
      categoryName: FinanceCategory
      amountMinor: number
      currency: string
      status: 'PENDING' | 'CLEARED'
    }>
  }>
}

export const simpleFinProvider: BankSyncProvider = {
  id: 'simplefin',
  name: 'SimpleFIN',
  isConfigured: () => isLiveBankSyncEnabled() && Boolean(getSimpleFinAccessUrl()),
  async getConnection() {
    if (!isLiveBankSyncEnabled()) {
      return {
        provider: 'simplefin',
        status: {
          mode: 'live-disabled',
          label: 'Live sync off',
          description:
            'Live bank sync is disabled. Turn it on only when production credentials are ready.',
          lastSynced: 'Not connected',
          canConnectLive: false,
        },
        accounts: [],
        transactions: [],
      }
    }

    if (!this.isConfigured()) {
      return {
        provider: 'simplefin',
        status: {
          mode: 'live-disabled',
          label: 'Live sync off',
          description: 'Add SimpleFIN credentials before connecting real accounts.',
          lastSynced: 'Not connected',
          canConnectLive: false,
        },
        accounts: [],
        transactions: [],
      }
    }

    try {
      const payload = await fetchSimpleFinAccounts()
      const normalized = normalizeSimpleFinPayload(payload)

      return {
        provider: 'simplefin',
        status: {
          mode: 'live-connected',
          label: 'Live sync',
          description:
            normalized.accounts.length > 0
              ? 'Real accounts are connected through SimpleFIN.'
              : 'SimpleFIN responded, but no accounts were returned.',
          lastSynced: 'Just now',
          canConnectLive: true,
        },
        ...normalized,
      }
    } catch (error) {
      console.error('SimpleFIN sync failed:', error)
      return {
        provider: 'simplefin',
        status: {
          mode: 'live-disabled',
          label: 'Sync needs attention',
          description:
            'SimpleFIN is configured, but Wollie could not load accounts. Check the access URL before launch.',
          lastSynced: 'Sync failed',
          canConnectLive: true,
        },
        accounts: [],
        transactions: [],
      }
    }
  },
}

export const getBankSyncState = createServerFn({ method: 'GET' }).handler(async () => {
  return loadBankSyncState()
})

export const claimSimpleFinConnection = createServerFn({ method: 'POST' })
  .validator((data: { token: string }) => ({
    token: String(data?.token ?? ''),
  }))
  .handler(async ({ data }) => {
    const user = await requireBankSyncUser()
    const token = data.token.trim()

    if (!token) {
      throw new Error('Paste the SimpleFIN token to connect your accounts.')
    }

    const claimUrl = decodeSimpleFinToken(token)
    const response = await fetch(claimUrl, { method: 'POST' })

    if (response.status === 403) {
      throw new Error(
        'That SimpleFIN token was already used or expired. Create a fresh token and try again.',
      )
    }

    if (!response.ok) {
      throw new Error(`SimpleFIN claim failed: ${response.status}`)
    }

    const accessUrl = (await response.text()).trim()
    assertHttpsUrl(accessUrl, 'SimpleFIN Access URL')

    await saveUserSimpleFinAccessUrl(user.id, accessUrl)

    return loadBankSyncState()
  })

export const disconnectSimpleFinConnection = createServerFn({ method: 'POST' }).handler(
  async () => {
    const user = await requireBankSyncUser()
    await deleteUserSimpleFinConnection(user.id)

    return loadBankSyncState()
  },
)

export const loadBankSyncState = createServerOnlyFn(
  async (): Promise<NormalizedBankConnection> => {
    const userConnection = await getUserSimpleFinConnection()

    if (userConnection) {
      return getSimpleFinConnection(
        userConnection.accessUrl,
        { disconnectedDescription: 'Connect a bank or card to start live sync.' },
        userConnection,
      )
    }

    if (isLiveBankSyncEnabled() || getSimpleFinAccessUrl()) {
      return getSimpleFinConnection(getSimpleFinAccessUrl(), {
        disconnectedDescription: 'Add SimpleFIN credentials before connecting real accounts.',
      })
    }

    return getSimpleFinConnection('', {
      disconnectedDescription: 'Connect a bank or card to start live sync.',
    })
  },
)

export function isLiveBankSyncEnabled() {
  return process.env.ENABLE_LIVE_BANK_SYNC === 'true'
}

function getSimpleFinAccessUrl() {
  return (
    process.env.SIMPLEFIN_ACCESS_URL?.trim() ||
    process.env.SIMPLEFIN_BRIDGE_URL?.trim() ||
    ''
  )
}

async function fetchSimpleFinAccounts(): Promise<SimpleFinResponse> {
  return fetchSimpleFinAccountsFromUrl(getSimpleFinAccessUrl())
}

async function fetchSimpleFinAccountsFromUrl(accessUrl: string): Promise<SimpleFinResponse> {
  const request = buildSimpleFinAccountsRequest(accessUrl)
  const response = await fetch(request.url, {
    headers: request.authorization
      ? { Authorization: request.authorization }
      : undefined,
  })

  if (!response.ok) {
    throw new Error(`SimpleFIN request failed: ${response.status}`)
  }

  const payload = (await response.json()) as SimpleFinResponse
  if (payload.errlist?.length) {
    const error = payload.errlist[0]
    throw new Error(error.msg || error.code || 'SimpleFIN returned an account error')
  }

  return payload
}

export function buildSimpleFinAccountsRequest(accessUrl: string) {
  if (!accessUrl) {
    throw new Error('SIMPLEFIN_ACCESS_URL is not set')
  }

  const url = new URL(accessUrl)
  const username = decodeURIComponent(url.username)
  const password = decodeURIComponent(url.password)
  url.username = ''
  url.password = ''

  if (!url.pathname.endsWith('/accounts')) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/accounts`
  }

  const nowSeconds = Math.floor(Date.now() / 1000)
  const lookbackDays = Number(process.env.SIMPLEFIN_LOOKBACK_DAYS || 90)
  const startSeconds = nowSeconds - Math.max(1, lookbackDays) * 24 * 60 * 60

  if (!url.searchParams.has('start-date')) {
    url.searchParams.set('start-date', String(startSeconds))
  }
  if (!url.searchParams.has('end-date')) {
    url.searchParams.set('end-date', String(nowSeconds))
  }

  return {
    url: url.toString(),
    authorization:
      username || password
        ? `Basic ${base64Encode(`${username}:${password}`)}`
        : undefined,
  }
}

export function normalizeSimpleFinPayload(payload: SimpleFinResponse): {
  accounts: FinancialAccount[]
  transactions: FinanceTransaction[]
} {
  const accounts = payload.accounts ?? []

  return {
    accounts: accounts.map(normalizeSimpleFinAccount),
    transactions: accounts.flatMap((account) =>
      (account.transactions ?? []).map((transaction, index) =>
        normalizeSimpleFinTransaction(account, transaction, index),
      ),
    ),
  }
}

export function buildSimpleFinPersistenceSnapshot(
  payload: SimpleFinResponse,
  syncedAt = new Date(),
): SimpleFinPersistenceSnapshot {
  return {
    accounts: (payload.accounts ?? []).map((account, accountIndex) => {
      const providerAccountId =
        account.id?.trim() || account.name?.trim() || `simplefin-account-${accountIndex}`
      const accountType = inferAccountType(account)

      return {
        providerAccountId,
        name: account.name?.trim() || 'Bank account',
        institution: account.org?.name?.trim() || 'Connected bank',
        accountType:
          accountType === 'Credit card'
            ? 'CREDIT_CARD'
            : accountType === 'Savings'
              ? 'SAVINGS'
              : 'CHECKING',
        balanceMinor: Math.round(toAmount(account.balance) * 100),
        currency: account.currency?.trim().toUpperCase() || 'USD',
        lastSyncedAt: account['balance-date']
          ? new Date(account['balance-date'] * 1000)
          : syncedAt,
        transactions: (account.transactions ?? []).map((transaction, index) => {
          const amount = toAmount(transaction.amount)
          const merchantName = normalizeMerchant(transaction)

          return {
            providerTransactionId:
              transaction.id?.trim() ||
              `${providerAccountId}-${transaction.posted || 'pending'}-${index}`,
            postedAt: transaction.posted
              ? new Date(transaction.posted * 1000)
              : syncedAt,
            description: transaction.description?.trim() || merchantName,
            merchantName,
            categoryName: inferCategory(merchantName, amount),
            amountMinor: Math.round(amount * 100),
            currency: account.currency?.trim().toUpperCase() || 'USD',
            status: transaction.pending ? 'PENDING' : 'CLEARED',
          }
        }),
      }
    }),
  }
}

function normalizeSimpleFinAccount(account: SimpleFinAccount): FinancialAccount {
  const balanceDate = formatSimpleFinDate(account['balance-date'])

  return {
    id: account.id || account.name || 'simplefin-account',
    name: account.name || 'Bank account',
    type: inferAccountType(account),
    balance: toAmount(account.balance),
    institution: account.org?.name || 'Connected bank',
    lastSynced: balanceDate || 'Just now',
  }
}

function normalizeSimpleFinTransaction(
  account: SimpleFinAccount,
  transaction: SimpleFinTransaction,
  index: number,
): FinanceTransaction {
  const amount = toAmount(transaction.amount)
  const merchant = normalizeMerchant(transaction)

  return {
    id: transaction.id || `${account.id || 'simplefin'}-${transaction.posted || index}`,
    date: formatSimpleFinDate(transaction.posted) || 'Pending',
    merchant,
    account: account.name || 'Bank account',
    category: inferCategory(merchant, amount),
    amount,
    status: transaction.pending ? 'pending' : 'cleared',
  }
}

function inferAccountType(account: SimpleFinAccount): FinancialAccount['type'] {
  const name = `${account.name ?? ''} ${account.org?.name ?? ''}`.toLowerCase()
  if (name.includes('credit') || name.includes('card')) return 'Credit card'
  if (name.includes('saving')) return 'Savings'
  return 'Checking'
}

function inferCategory(merchant: string, amount: number): FinanceCategory {
  const text = merchant.toLowerCase()
  if (amount > 0) return 'Income'
  if (text.includes('rent') || text.includes('mortgage')) return 'Housing'
  if (text.includes('whole foods') || text.includes('market') || text.includes('grocery')) {
    return 'Groceries'
  }
  if (text.includes('uber') || text.includes('lyft') || text.includes('transit')) {
    return 'Transport'
  }
  if (text.includes('figma') || text.includes('spotify') || text.includes('netflix')) {
    return 'Subscriptions'
  }
  if (text.includes('restaurant') || text.includes('cafe') || text.includes('coffee')) {
    return 'Dining'
  }
  return 'Shopping'
}

function normalizeMerchant(transaction: SimpleFinTransaction) {
  return (
    transaction.payee?.trim() ||
    transaction.description?.trim() ||
    'Unknown merchant'
  )
}

function toAmount(value: string | number | undefined) {
  const amount = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(amount) ? amount : 0
}

function formatSimpleFinDate(value?: number) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value * 1000))
}

function base64Encode(value: string) {
  if (typeof btoa === 'function') return btoa(value)
  return Buffer.from(value).toString('base64')
}

async function getSimpleFinConnection(
  accessUrl: string,
  options: { disconnectedDescription: string },
  connection?: SimpleFinConnectionRecord,
): Promise<NormalizedBankConnection> {
  if (!isLiveBankSyncEnabled() && !accessUrl) {
    return {
      provider: 'simplefin',
      status: {
        mode: 'live-disabled',
        label: 'Live sync off',
        description:
          'Live bank sync is disabled. Turn it on only when production credentials are ready.',
        lastSynced: 'Not connected',
        canConnectLive: true,
      },
      accounts: [],
      transactions: [],
    }
  }

  if (!accessUrl) {
    return {
      provider: 'simplefin',
      status: {
        mode: 'live-disabled',
        label: 'Not connected',
        description: options.disconnectedDescription,
        lastSynced: 'Not connected',
        canConnectLive: true,
      },
      accounts: [],
      transactions: [],
    }
  }

  try {
    const payload = await fetchSimpleFinAccountsFromUrl(accessUrl)
    const normalized = normalizeSimpleFinPayload(payload)

    if (connection) {
      await persistSimpleFinSnapshot(connection, payload)
    }

    return {
      provider: 'simplefin',
      status: {
        mode: 'live-connected',
        label: 'Live sync',
        description:
          normalized.accounts.length > 0
            ? 'Real accounts are connected through SimpleFIN.'
            : 'SimpleFIN responded, but no accounts were returned.',
        lastSynced: 'Just now',
        canConnectLive: true,
      },
      ...normalized,
    }
  } catch (error) {
    console.error('SimpleFIN sync failed:', error)
    const persisted = connection
      ? await loadPersistedSimpleFinSnapshot(connection).catch(() => ({
          accounts: [],
          transactions: [],
        }))
      : { accounts: [], transactions: [] }

    if (connection) {
      await recordFailedSimpleFinSync(connection, error).catch((recordError) => {
        console.error('Could not record SimpleFIN sync failure:', recordError)
      })
    }

    return {
      provider: 'simplefin',
      status: {
        mode: 'live-disabled',
        label: 'Sync needs attention',
        description: persisted.accounts.length
          ? 'SimpleFIN could not refresh. Showing your last successful sync.'
          : 'SimpleFIN is connected, but Wollie could not load accounts. Reconnect with a fresh token.',
        lastSynced: persisted.accounts.length ? 'Last saved sync' : 'Sync failed',
        canConnectLive: true,
      },
      ...persisted,
    }
  }
}

const requireBankSyncUser = createServerOnlyFn(async () => {
  const { getSessionUser } = await import('#/server/session.server')
  const user = await getSessionUser()
  if (!user) {
    throw new Error('Sign in before connecting a bank.')
  }
  return user
})

const getUserSimpleFinConnection = createServerOnlyFn(async () => {
  const [{ getDb }, { getSessionUser }] = await Promise.all([
    import('#/server/db-access.server'),
    import('#/server/session.server'),
  ])
  const user = await getSessionUser()
  if (!user) return null

  const prisma = await getDb()
  const connection = await prisma.bankConnection.findFirst({
    where: {
      userId: user.id,
      provider: 'SIMPLEFIN',
      status: { in: ['CONNECTED', 'SYNCING', 'NEEDS_RECONNECT', 'FAILED'] },
    },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, userId: true, workspaceId: true, tokenRef: true },
  })

  if (!connection?.tokenRef) return null

  return {
    id: connection.id,
    userId: connection.userId,
    workspaceId: connection.workspaceId,
    accessUrl: connection.tokenRef,
  } satisfies SimpleFinConnectionRecord
})

const persistSimpleFinSnapshot = createServerOnlyFn(
  async (connection: SimpleFinConnectionRecord, payload: SimpleFinResponse) => {
    const { getDb } = await import('#/server/db-access.server')
    const prisma = await getDb()
    const syncedAt = new Date()
    const snapshot = buildSimpleFinPersistenceSnapshot(payload, syncedAt)
    let transactionsAdded = 0

    for (const account of snapshot.accounts) {
      const savedAccount = await prisma.financialAccount.upsert({
        where: {
          bankConnectionId_providerAccountId: {
            bankConnectionId: connection.id,
            providerAccountId: account.providerAccountId,
          },
        },
        create: {
          workspaceId: connection.workspaceId,
          bankConnectionId: connection.id,
          providerAccountId: account.providerAccountId,
          name: account.name,
          institution: account.institution,
          type: account.accountType,
          currency: account.currency,
          balanceMinor: account.balanceMinor,
          lastSyncedAt: account.lastSyncedAt,
        },
        update: {
          name: account.name,
          institution: account.institution,
          type: account.accountType,
          currency: account.currency,
          balanceMinor: account.balanceMinor,
          lastSyncedAt: account.lastSyncedAt,
        },
      })

      for (const transaction of account.transactions) {
        const normalizedMerchantName = normalizeMerchantName(transaction.merchantName)
        const [category, merchant, existingTransaction] = await Promise.all([
          prisma.transactionCategory.upsert({
            where: {
              workspaceId_name: {
                workspaceId: connection.workspaceId,
                name: transaction.categoryName,
              },
            },
            create: {
              workspaceId: connection.workspaceId,
              name: transaction.categoryName,
              system: true,
            },
            update: {},
          }),
          prisma.merchant.upsert({
            where: {
              workspaceId_normalizedName: {
                workspaceId: connection.workspaceId,
                normalizedName: normalizedMerchantName,
              },
            },
            create: {
              workspaceId: connection.workspaceId,
              name: transaction.merchantName,
              normalizedName: normalizedMerchantName,
            },
            update: { name: transaction.merchantName },
          }),
          prisma.financeTransaction.findUnique({
            where: {
              accountId_providerTransactionId: {
                accountId: savedAccount.id,
                providerTransactionId: transaction.providerTransactionId,
              },
            },
            select: { id: true },
          }),
        ])

        if (!existingTransaction) transactionsAdded += 1

        await prisma.financeTransaction.upsert({
          where: {
            accountId_providerTransactionId: {
              accountId: savedAccount.id,
              providerTransactionId: transaction.providerTransactionId,
            },
          },
          create: {
            workspaceId: connection.workspaceId,
            accountId: savedAccount.id,
            categoryId: category.id,
            merchantId: merchant.id,
            providerTransactionId: transaction.providerTransactionId,
            postedAt: transaction.postedAt,
            description: transaction.description,
            amountMinor: transaction.amountMinor,
            currency: transaction.currency,
            status: transaction.status,
          },
          update: {
            categoryId: category.id,
            merchantId: merchant.id,
            postedAt: transaction.postedAt,
            description: transaction.description,
            amountMinor: transaction.amountMinor,
            currency: transaction.currency,
            status: transaction.status,
          },
        })
      }
    }

    const transactionsSeen = snapshot.accounts.reduce(
      (total, account) => total + account.transactions.length,
      0,
    )

    await Promise.all([
      prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'CONNECTED', lastSyncedAt: syncedAt },
      }),
      prisma.syncRun.create({
        data: {
          workspaceId: connection.workspaceId,
          bankConnectionId: connection.id,
          provider: 'SIMPLEFIN',
          status: 'SUCCESS',
          startedAt: syncedAt,
          finishedAt: new Date(),
          transactionsSeen,
          transactionsAdded,
        },
      }),
    ])
  },
)

const loadPersistedSimpleFinSnapshot = createServerOnlyFn(
  async (connection: SimpleFinConnectionRecord) => {
    const { getDb } = await import('#/server/db-access.server')
    const prisma = await getDb()
    const savedAccounts = await prisma.financialAccount.findMany({
      where: { bankConnectionId: connection.id },
      include: {
        transactions: {
          include: { category: true, merchant: true },
          orderBy: { postedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const accounts: FinancialAccount[] = savedAccounts.map((account) => ({
      id: account.providerAccountId || account.id,
      name: account.name,
      type:
        account.type === 'CREDIT_CARD'
          ? 'Credit card'
          : account.type === 'SAVINGS'
            ? 'Savings'
            : 'Checking',
      balance: account.balanceMinor / 100,
      institution: account.institution || 'Connected bank',
      lastSynced: formatSavedDate(account.lastSyncedAt),
    }))

    const transactions: FinanceTransaction[] = savedAccounts
      .flatMap((account) =>
        account.transactions.map((transaction) => ({
          id: transaction.providerTransactionId || transaction.id,
          date: formatSavedDate(transaction.postedAt),
          merchant: transaction.merchant?.name || transaction.description,
          account: account.name,
          category: toFinanceCategory(transaction.category?.name),
          amount: transaction.amountMinor / 100,
          status:
            transaction.status === 'PENDING'
              ? ('pending' as const)
              : transaction.status === 'NEEDS_REVIEW'
                ? ('needs-review' as const)
                : ('cleared' as const),
          recurring: transaction.recurring,
        })),
      )

    return { accounts, transactions }
  },
)

const recordFailedSimpleFinSync = createServerOnlyFn(
  async (connection: SimpleFinConnectionRecord, error: unknown) => {
    const { getDb } = await import('#/server/db-access.server')
    const prisma = await getDb()
    const message = error instanceof Error ? error.message : 'Unknown SimpleFIN error'

    await Promise.all([
      prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'FAILED' },
      }),
      prisma.syncRun.create({
        data: {
          workspaceId: connection.workspaceId,
          bankConnectionId: connection.id,
          provider: 'SIMPLEFIN',
          status: 'FAILED',
          finishedAt: new Date(),
          errorCode: 'SIMPLEFIN_REFRESH_FAILED',
          errorMessage: message.slice(0, 500),
        },
      }),
    ])
  },
)

function normalizeMerchantName(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  return normalized || 'unknown merchant'
}

function formatSavedDate(value?: Date | null) {
  if (!value) return 'Not synced'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

function toFinanceCategory(value?: string | null): FinanceCategory {
  const categories: FinanceCategory[] = [
    'Income',
    'Housing',
    'Groceries',
    'Transport',
    'Dining',
    'Subscriptions',
    'Shopping',
    'Savings',
    'Health',
  ]
  return categories.includes(value as FinanceCategory)
    ? (value as FinanceCategory)
    : 'Shopping'
}

const saveUserSimpleFinAccessUrl = createServerOnlyFn(
  async (userId: string, accessUrl: string) => {
    const { getDb } = await import('#/server/db-access.server')
    const prisma = await getDb()
    const workspace = await getOrCreateFinanceWorkspace(userId)
    const providerItemId = `${userId}:simplefin`
    const existing = await prisma.bankConnection.findFirst({
      where: {
        userId,
        provider: 'SIMPLEFIN',
      },
    })

    if (existing) {
      await prisma.bankConnection.update({
        where: { id: existing.id },
        data: {
          workspaceId: workspace.id,
          providerItemId,
          tokenRef: accessUrl,
          status: 'CONNECTED',
          lastSyncedAt: new Date(),
        },
      })
      return
    }

    await prisma.bankConnection.create({
      data: {
        userId,
        workspaceId: workspace.id,
        provider: 'SIMPLEFIN',
        providerItemId,
        tokenRef: accessUrl,
        status: 'CONNECTED',
        lastSyncedAt: new Date(),
      },
    })
  },
)

const deleteUserSimpleFinConnection = createServerOnlyFn(async (userId: string) => {
  const { getDb } = await import('#/server/db-access.server')
  const prisma = await getDb()

  const connections = await prisma.bankConnection.findMany({
    where: { userId, provider: 'SIMPLEFIN' },
    select: {
      id: true,
      accounts: { select: { id: true } },
    },
  })
  const connectionIds = connections.map((connection) => connection.id)
  const accountIds = connections.flatMap((connection) =>
    connection.accounts.map((account) => account.id),
  )

  if (accountIds.length) {
    await prisma.financeTransaction.deleteMany({
      where: { accountId: { in: accountIds } },
    })
    await prisma.financialAccount.deleteMany({
      where: { id: { in: accountIds } },
    })
  }

  if (connectionIds.length) {
    await prisma.syncRun.deleteMany({
      where: { bankConnectionId: { in: connectionIds } },
    })
  }

  await prisma.bankConnection.deleteMany({
    where: {
      userId,
      provider: 'SIMPLEFIN',
    },
  })
})

const getOrCreateFinanceWorkspace = createServerOnlyFn(async (userId: string) => {
  const { getDb } = await import('#/server/db-access.server')
  const prisma = await getDb()
  const workspace = await prisma.budgetWorkspace.findFirst({
    where: { userId, demo: false },
    orderBy: { createdAt: 'asc' },
  })

  if (workspace) return workspace

  return prisma.budgetWorkspace.create({
    data: {
      userId,
      name: 'Personal budget',
      currency: 'USD',
      demo: false,
    },
  })
})

function decodeSimpleFinToken(token: string) {
  let decoded = ''

  try {
    decoded =
      typeof atob === 'function'
        ? atob(token)
        : Buffer.from(token, 'base64').toString('utf8')
  } catch {
    throw new Error('That SimpleFIN token is not valid.')
  }

  assertHttpsUrl(decoded, 'SimpleFIN claim URL')
  return decoded
}

function assertHttpsUrl(value: string, label: string) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') {
      throw new Error(`${label} must use HTTPS.`)
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('HTTPS')) {
      throw error
    }
    throw new Error(`${label} is not a valid URL.`)
  }
}
