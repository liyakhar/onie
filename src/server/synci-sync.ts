import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import type { FinanceCategory } from '#/lib/finance-demo'
import {
  decryptCredential,
  encryptCredential,
  isEncryptedCredential,
} from '#/server/credential-crypto'
import { getDb } from '#/server/db-access.server'
import { getOrCreateFinanceHousehold } from '#/server/household-access.server'

const SYNCI_API_ORIGIN = 'https://api.synci.io'
const REQUEST_TIMEOUT_MS = 20_000
const PAGE_SIZE = 200
const MAX_TRANSACTION_PAGES = 10
const DEFAULT_LOOKBACK_DAYS = 90
const DEFAULT_CONNECTION_LIMIT = 2

type SynciCredential = {
  managedUserId: string
}

type SynciConnectionRecord = {
  id: string
  userId: string
  workspaceId: string
  credential: SynciCredential
}

type ManagedUser = {
  user_id: string
  external_user_id?: string | null
  access_token?: string
}

type SynciAccount = {
  id: number | string
  name?: string | null
  custom_name?: string | null
  display_name?: string | null
  currency?: string | null
  product_name?: string | null
  cash_account_type?: string | null
  details?: string | null
  account_category?: string | null
  transactions_last_synced_at?: string | null
  balances_last_synced_at?: string | null
  balance?: {
    available?: number | string | null
    cleared?: number | string | null
  } | null
  financial_connection?: {
    institution?: { name?: string | null } | null
  } | null
}

type SynciTransaction = {
  id: number | string
  financial_account_id?: number | string | null
  amount: string | number
  currency: string
  booked: boolean
  mapped_fields?: Record<string, unknown> | null
  enriched?: {
    counterparty?: { name?: string | null } | null
    category_general?: string | null
  } | null
  booking_date?: string | null
  booking_datetime?: string | null
  value_date?: string | null
  value_datetime?: string | null
  debtor?: { name?: string | null } | null
  creditor?: { name?: string | null } | null
  remittance_information?: {
    structured?: string | null
    unstructured?: string | null
    structured_array?: string | string[] | null
    unstructured_array?: string | string[] | null
  } | null
  additional_information?: string | null
  external_identifiers?: {
    institution_transaction_id?: string | null
    integrator_transaction_id?: string | null
    entry_reference?: string | null
    end_to_end_id?: string | null
  } | null
}

type PaginatedResponse<T> = {
  data?: T[]
  meta?: { current_page?: number; last_page?: number }
}

export type SynciSnapshot = {
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
      status: 'PENDING' | 'CLEARED' | 'NEEDS_REVIEW'
    }>
  }>
}

export const getSynciStatus = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await requireUser()
    const prisma = await getDb()
    const connection = await prisma.bankConnection.findFirst({
      where: { userId: user.id, provider: 'SYNCI' },
      orderBy: { updatedAt: 'desc' },
      select: {
        status: true,
        lastSyncedAt: true,
        _count: { select: { accounts: true } },
      },
    })

    return {
      configured: hasSynciConfig(),
      openForConnections: isSynciPublicAccessEnabled(),
      registered: Boolean(connection),
      connected: Boolean(connection?._count.accounts),
      syncing: connection?.status === 'SYNCING',
      needsReconnect:
        connection?.status === 'NEEDS_RECONNECT' ||
        connection?.status === 'FAILED',
      lastSynced: formatDate(connection?.lastSyncedAt),
    }
  },
)

export const startSynciConnection = createServerFn({ method: 'POST' }).handler(
  async () => {
    assertSynciAvailable()
    const user = await requireUser()
    const connection = await ensureSynciManagedUser(user)
    const response = await managedRequest<{ data?: { url?: string } }>(
      `/managed/v1/users/${encodeURIComponent(connection.credential.managedUserId)}/portal-sessions`,
      {
        method: 'POST',
        body: JSON.stringify({ return_url: getPortalReturnUrl() }),
      },
    )
    const url = response.data?.url
    if (!url || !isSynciPortalUrl(url)) {
      throw new Error('Synci did not return a valid bank connection page.')
    }
    return { url }
  },
)

export const syncSynciConnection = createServerFn({ method: 'POST' }).handler(
  async () => {
    assertSynciAvailable()
    const user = await requireUser()
    const connection = await getSynciConnection(user.id)
    if (!connection) throw new Error('Connect a bank before syncing.')

    try {
      const snapshot = await fetchSynciSnapshot(
        connection.credential.managedUserId,
      )
      await persistSynciSnapshot(connection, snapshot)
      return { synced: true, accounts: snapshot.accounts.length }
    } catch (error) {
      await recordFailedSynciSync(connection, error).catch(() => undefined)
      throw friendlySynciError(error)
    }
  },
)

export const disconnectSynciConnection = createServerFn({
  method: 'POST',
}).handler(async () => {
  const user = await requireUser()
  await revokeSynciBeforeUserDeletion(user.id)
  await deleteSynciConnection(user.id)
  return { disconnected: true }
})

export async function revokeSynciBeforeUserDeletion(userId: string) {
  const connection = await getSynciConnection(userId)
  if (!connection) return
  if (!hasSynciConfig()) {
    throw new Error('Wollie cannot revoke Synci access because the provider is not configured.')
  }

  try {
    await managedRequest(
      `/managed/v1/users/${encodeURIComponent(connection.credential.managedUserId)}`,
      { method: 'DELETE' },
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!/404|not found/i.test(message)) throw error
  }
}

export function isSynciPublicAccessEnabled() {
  return (
    process.env.ENABLE_LIVE_BANK_SYNC === 'true' &&
    process.env.SYNCI_PUBLIC_ACCESS_ENABLED === 'true' &&
    hasSynciConfig()
  )
}

export function buildSynciSnapshot(
  accounts: SynciAccount[],
  transactions: SynciTransaction[],
  syncedAt = new Date(),
): SynciSnapshot {
  const byAccount = new Map<string, SynciTransaction[]>()
  for (const transaction of transactions) {
    const accountId = String(transaction.financial_account_id ?? '')
    if (!accountId) continue
    const list = byAccount.get(accountId) || []
    list.push(transaction)
    byAccount.set(accountId, list)
  }

  return {
    accounts: accounts.map((account) => {
      const providerAccountId = String(account.id)
      const accountTransactions = byAccount.get(providerAccountId) || []
      const lastSyncedAt = safeDate(
        account.transactions_last_synced_at || account.balances_last_synced_at,
        syncedAt,
      )
      return {
        providerAccountId,
        name:
          account.custom_name?.trim() ||
          account.display_name?.trim() ||
          account.name?.trim() ||
          account.product_name?.trim() ||
          'Bank account',
        institution:
          account.financial_connection?.institution?.name?.trim() ||
          'Connected bank',
        accountType: inferAccountType(account),
        balanceMinor: toMinorUnits(
          account.balance?.available ?? account.balance?.cleared ?? 0,
        ),
        currency: account.currency?.trim().toUpperCase() || 'EUR',
        lastSyncedAt,
        transactions: accountTransactions.map((transaction) => {
          const amountMinor = toMinorUnits(transaction.amount)
          const merchantName = synciMerchantName(transaction, amountMinor)
          const postedAt = safeDate(
            transaction.booking_datetime ||
              transaction.booking_date ||
              transaction.value_datetime ||
              transaction.value_date,
            syncedAt,
          )
          return {
            providerTransactionId: synciTransactionId(transaction),
            postedAt,
            description: synciDescription(transaction, merchantName),
            merchantName,
            categoryName: inferCategory(
              merchantName,
              amountMinor,
              transaction.enriched?.category_general,
            ),
            amountMinor,
            currency: transaction.currency?.trim().toUpperCase() || 'EUR',
            status: transaction.booked
              ? shouldReview(merchantName, amountMinor)
                ? 'NEEDS_REVIEW'
                : 'CLEARED'
              : 'PENDING',
          }
        }),
      }
    }),
  }
}

async function ensureSynciManagedUser(user: {
  id: string
  email: string
  name: string
}) {
  const existing = await getSynciConnection(user.id)
  if (existing) return existing

  let managedUser: ManagedUser | undefined
  try {
    managedUser = await managedRequest<ManagedUser>('/managed/v1/users', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        external_user_id: user.id,
        connection_limit: getConnectionLimit(),
      }),
    })
  } catch (error) {
    if (
      !/409|already_registered|external_user_id_taken/i.test(
        errorMessage(error),
      )
    ) {
      throw friendlySynciError(error)
    }
    const query = new URLSearchParams({
      external_user_id: user.id,
      per_page: '1',
    })
    const found = await managedRequest<PaginatedResponse<ManagedUser>>(
      `/managed/v1/users?${query}`,
    )
    managedUser = found.data?.[0]
  }

  if (!managedUser?.user_id) {
    throw new Error('Synci could not register this Wollie account.')
  }
  return saveSynciConnection(user.id, managedUser.user_id)
}

async function fetchSynciSnapshot(managedUserId: string) {
  const tokenResponse = await managedRequest<{ access_token?: string }>(
    `/managed/v1/users/${encodeURIComponent(managedUserId)}/tokens`,
    { method: 'POST' },
  )
  if (!tokenResponse.access_token)
    throw new Error('Synci did not issue a data token.')
  const token = tokenResponse.access_token

  const accountQuery = new URLSearchParams({
    omit_sensitive_identifiers: 'true',
    include: 'financial_connection.institution',
    'filter[domain]': 'bank',
    'page[size]': String(PAGE_SIZE),
  })
  const accountResponse = await dataRequest<PaginatedResponse<SynciAccount>>(
    token,
    `/api/v1/finance/accounts?${accountQuery}`,
  )
  const accounts = accountResponse.data || []
  const lookback = new Date(Date.now() - getLookbackDays() * 86_400_000)
    .toISOString()
    .slice(0, 10)
  const transactions = (
    await Promise.all(
      accounts.map((account) =>
        fetchSynciTransactions(token, String(account.id), lookback),
      ),
    )
  ).flat()
  return buildSynciSnapshot(accounts, transactions)
}

async function fetchSynciTransactions(
  token: string,
  accountId: string,
  bookingDateAfter: string,
) {
  const transactions: SynciTransaction[] = []
  for (let page = 1; page <= MAX_TRANSACTION_PAGES; page += 1) {
    const query = new URLSearchParams({
      omit_sensitive_identifiers: 'true',
      'filter[financial_account_id]': accountId,
      'filter[booking_date_after]': bookingDateAfter,
      sort: '-booking_date',
      'page[size]': String(PAGE_SIZE),
      'page[number]': String(page),
    })
    const response = await dataRequest<PaginatedResponse<SynciTransaction>>(
      token,
      `/api/v1/finance/transactions?${query}`,
    )
    transactions.push(...(response.data || []))
    const lastPage = response.meta?.last_page
    if (!response.data?.length || (lastPage && page >= lastPage)) break
  }
  return transactions
}

async function persistSynciSnapshot(
  connection: SynciConnectionRecord,
  snapshot: SynciSnapshot,
) {
  const prisma = await getDb()
  const syncedAt = new Date()
  await prisma.$transaction(
    async (tx) => {
      let transactionsAdded = 0
      for (const account of snapshot.accounts) {
        const savedAccount = await tx.financialAccount.upsert({
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
        const member = await tx.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId: connection.workspaceId,
              userId: connection.userId,
            },
          },
          select: { id: true },
        })
        if (!member)
          throw new Error('Bank connection owner is not a household member.')
        if (
          (await tx.accountOwnership.count({
            where: { accountId: savedAccount.id },
          })) === 0
        ) {
          await tx.accountOwnership.create({
            data: {
              accountId: savedAccount.id,
              memberId: member.id,
              shareBasisPoints: 10_000,
            },
          })
        }

        for (const transaction of account.transactions) {
          const normalizedName = normalizeMerchant(transaction.merchantName)
          const [category, merchant, existing] = await Promise.all([
            tx.transactionCategory.upsert({
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
            tx.merchant.upsert({
              where: {
                workspaceId_normalizedName: {
                  workspaceId: connection.workspaceId,
                  normalizedName,
                },
              },
              create: {
                workspaceId: connection.workspaceId,
                name: transaction.merchantName,
                normalizedName,
              },
              update: { name: transaction.merchantName },
            }),
            tx.financeTransaction.findUnique({
              where: {
                accountId_providerTransactionId: {
                  accountId: savedAccount.id,
                  providerTransactionId: transaction.providerTransactionId,
                },
              },
              select: { id: true },
            }),
          ])
          if (!existing) transactionsAdded += 1
          const rule = await tx.categoryRule.findFirst({
            where: {
              workspaceId: connection.workspaceId,
              merchantId: merchant.id,
            },
            select: { categoryId: true },
          })
          const status =
            transaction.status === 'PENDING'
              ? 'PENDING'
              : rule
                ? 'CLEARED'
                : transaction.status
          await tx.financeTransaction.upsert({
            where: {
              accountId_providerTransactionId: {
                accountId: savedAccount.id,
                providerTransactionId: transaction.providerTransactionId,
              },
            },
            create: {
              workspaceId: connection.workspaceId,
              accountId: savedAccount.id,
              categoryId: rule?.categoryId || category.id,
              merchantId: merchant.id,
              providerTransactionId: transaction.providerTransactionId,
              postedAt: transaction.postedAt,
              description: transaction.description,
              amountMinor: transaction.amountMinor,
              currency: transaction.currency,
              status,
            },
            update: {
              categoryId: rule?.categoryId || category.id,
              merchantId: merchant.id,
              postedAt: transaction.postedAt,
              description: transaction.description,
              amountMinor: transaction.amountMinor,
              currency: transaction.currency,
              status,
            },
          })
        }
      }

      const transactionsSeen = snapshot.accounts.reduce(
        (total, account) => total + account.transactions.length,
        0,
      )
      await Promise.all([
        tx.bankConnection.update({
          where: { id: connection.id },
          data: {
            status: snapshot.accounts.length ? 'CONNECTED' : 'SYNCING',
            lastSyncedAt: syncedAt,
          },
        }),
        tx.syncRun.create({
          data: {
            workspaceId: connection.workspaceId,
            bankConnectionId: connection.id,
            provider: 'SYNCI',
            status: 'SUCCESS',
            startedAt: syncedAt,
            finishedAt: new Date(),
            transactionsSeen,
            transactionsAdded,
          },
        }),
      ])
    },
    { maxWait: 5_000, timeout: 60_000 },
  )
}

async function saveSynciConnection(userId: string, managedUserId: string) {
  const prisma = await getDb()
  const household = await getOrCreateFinanceHousehold(userId, 'EUR')
  const credential: SynciCredential = { managedUserId }
  const tokenRef = await encryptCredential(
    JSON.stringify(credential),
    getEncryptionSecret(),
  )
  const existing = await prisma.bankConnection.findFirst({
    where: { userId, provider: 'SYNCI' },
  })
  const data = {
    workspaceId: household.workspaceId,
    providerItemId: managedUserId,
    tokenRef,
    status: 'SYNCING' as const,
  }
  const saved = existing
    ? await prisma.bankConnection.update({ where: { id: existing.id }, data })
    : await prisma.bankConnection.create({
        data: { userId, provider: 'SYNCI', ...data },
      })
  return {
    id: saved.id,
    userId,
    workspaceId: household.workspaceId,
    credential,
  }
}

const getSynciConnection = createServerOnlyFn(
  async (userId: string): Promise<SynciConnectionRecord | null> => {
    const prisma = await getDb()
    const connection = await prisma.bankConnection.findFirst({
      where: {
        userId,
        provider: 'SYNCI',
        status: { in: ['CONNECTED', 'SYNCING', 'NEEDS_RECONNECT', 'FAILED'] },
      },
      orderBy: { updatedAt: 'desc' },
    })
    if (!connection?.tokenRef || !isEncryptedCredential(connection.tokenRef))
      return null
    try {
      const credential = JSON.parse(
        await decryptCredential(connection.tokenRef, getEncryptionSecret()),
      ) as SynciCredential
      if (!credential.managedUserId)
        throw new Error('Missing Synci managed user ID')
      return {
        id: connection.id,
        userId,
        workspaceId: connection.workspaceId,
        credential,
      }
    } catch {
      await prisma.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'NEEDS_RECONNECT' },
      })
      return null
    }
  },
)

async function deleteSynciConnection(userId: string) {
  const prisma = await getDb()
  await prisma.$transaction(
    async (tx) => {
      const connections = await tx.bankConnection.findMany({
        where: { userId, provider: 'SYNCI' },
        select: { id: true, accounts: { select: { id: true } } },
      })
      const connectionIds = connections.map((connection) => connection.id)
      const accountIds = connections.flatMap((connection) =>
        connection.accounts.map((account) => account.id),
      )
      if (accountIds.length) {
        await tx.financeTransaction.deleteMany({
          where: { accountId: { in: accountIds } },
        })
        await tx.financialAccount.deleteMany({
          where: { id: { in: accountIds } },
        })
      }
      if (connectionIds.length) {
        await tx.syncRun.deleteMany({
          where: { bankConnectionId: { in: connectionIds } },
        })
        await tx.bankConnection.deleteMany({
          where: { id: { in: connectionIds } },
        })
      }
    },
    { maxWait: 5_000, timeout: 30_000 },
  )
}

async function recordFailedSynciSync(
  connection: SynciConnectionRecord,
  error: unknown,
) {
  const prisma = await getDb()
  const message = errorMessage(error)
  await Promise.all([
    prisma.bankConnection.update({
      where: { id: connection.id },
      data: { status: 'FAILED' },
    }),
    prisma.syncRun.create({
      data: {
        workspaceId: connection.workspaceId,
        bankConnectionId: connection.id,
        provider: 'SYNCI',
        status: 'FAILED',
        finishedAt: new Date(),
        errorCode: 'SYNCI_SYNC_FAILED',
        errorMessage: message.slice(0, 500),
      },
    }),
  ])
}

async function managedRequest<T = Record<string, unknown>>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { clientId, clientSecret } = getSynciConfig()
  return providerRequest<T>(`${SYNCI_API_ORIGIN}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${base64Encode(`${clientId}:${clientSecret}`)}`,
      ...init.headers,
    },
  })
}

async function dataRequest<T>(token: string, path: string): Promise<T> {
  return providerRequest<T>(`${SYNCI_API_ORIGIN}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

async function providerRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string
      message?: string
      hint?: string
    }
    throw new Error(
      `SYNCI_${response.status}: ${body.error || body.message || body.hint || 'Request failed'}`,
    )
  }
  if (response.status === 204) return {} as T
  return (await response.json()) as T
}

function requireUser() {
  return import('#/server/household-access.server').then(
    async ({ requireFinanceHousehold }) =>
      (await requireFinanceHousehold()).user,
  )
}

function getSynciConfig() {
  const clientId = process.env.SYNCI_MANAGED_CLIENT_ID?.trim()
  const clientSecret = process.env.SYNCI_MANAGED_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new Error('Synci bank sync is not configured on the server.')
  }
  return { clientId, clientSecret }
}

function hasSynciConfig() {
  return Boolean(
    process.env.SYNCI_MANAGED_CLIENT_ID?.trim() &&
    process.env.SYNCI_MANAGED_CLIENT_SECRET?.trim(),
  )
}

function assertSynciAvailable() {
  if (!isSynciPublicAccessEnabled()) {
    throw new Error('Bank connections are not available yet.')
  }
}

function getPortalReturnUrl() {
  const fallback = `${String(
    process.env.SITE_URL ||
      process.env.BETTER_AUTH_URL ||
      'http://localhost:3000',
  ).replace(/\/$/, '')}/app/accounts?bank=connected`
  const value = process.env.SYNCI_PORTAL_RETURN_URL?.trim() || fallback
  const url = new URL(value)
  const local =
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname)
  if (
    (!local && url.protocol !== 'https:') ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new Error(
      'SYNCI_PORTAL_RETURN_URL must be HTTPS, or localhost in development.',
    )
  }
  return url.toString()
}

function getConnectionLimit() {
  return boundedInteger(
    process.env.SYNCI_CONNECTION_LIMIT,
    DEFAULT_CONNECTION_LIMIT,
    1,
    20,
  )
}

function getLookbackDays() {
  return boundedInteger(
    process.env.SYNCI_LOOKBACK_DAYS,
    DEFAULT_LOOKBACK_DAYS,
    1,
    730,
  )
}

function boundedInteger(
  value: string | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  const parsed = Number(value)
  return Number.isFinite(parsed)
    ? Math.min(max, Math.max(min, Math.floor(parsed)))
    : fallback
}

function getEncryptionSecret() {
  const secret = process.env.BANK_SYNC_ENCRYPTION_KEY?.trim()
  if (secret) return secret
  if (process.env.NODE_ENV !== 'production') {
    const fallback = process.env.BETTER_AUTH_SECRET?.trim()
    if (fallback) return fallback
  }
  throw new Error('BANK_SYNC_ENCRYPTION_KEY is required for bank sync.')
}

function isSynciPortalUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'app.synci.io'
  } catch {
    return false
  }
}

function inferAccountType(
  account: SynciAccount,
): 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' {
  const text =
    `${account.cash_account_type || ''} ${account.product_name || ''} ${account.name || ''}`.toLowerCase()
  if (/card|crdt|credit|loc/.test(text)) return 'CREDIT_CARD'
  if (/saving|svgs/.test(text)) return 'SAVINGS'
  return 'CHECKING'
}

function synciMerchantName(transaction: SynciTransaction, amountMinor: number) {
  const mapped = transaction.mapped_fields || {}
  const mappedPayee = typeof mapped.payee === 'string' ? mapped.payee : ''
  const counterparty =
    transaction.enriched?.counterparty?.name ||
    mappedPayee ||
    (amountMinor < 0 ? transaction.creditor?.name : transaction.debtor?.name)
  return (
    counterparty?.trim() || synciRemittance(transaction) || 'Unknown merchant'
  )
}

function synciDescription(transaction: SynciTransaction, merchantName: string) {
  const mapped = transaction.mapped_fields || {}
  const mappedDescription =
    typeof mapped.description === 'string' ? mapped.description.trim() : ''
  return (
    mappedDescription ||
    transaction.additional_information?.trim() ||
    synciRemittance(transaction) ||
    merchantName
  )
}

function synciRemittance(transaction: SynciTransaction) {
  const value =
    transaction.remittance_information?.unstructured ||
    transaction.remittance_information?.structured ||
    transaction.remittance_information?.unstructured_array ||
    transaction.remittance_information?.structured_array
  return Array.isArray(value)
    ? value.filter(Boolean).join(' ')
    : String(value || '').trim()
}

function synciTransactionId(transaction: SynciTransaction) {
  const external = transaction.external_identifiers
  return String(
    external?.institution_transaction_id ||
      external?.integrator_transaction_id ||
      external?.entry_reference ||
      external?.end_to_end_id ||
      transaction.id,
  )
}

function inferCategory(
  merchant: string,
  amountMinor: number,
  enrichedCategory?: string | null,
): FinanceCategory {
  const text = `${merchant} ${enrichedCategory || ''}`.toLowerCase()
  if (/transfer|card payment|credit card payment|repayment/.test(text))
    return 'Transfer'
  if (amountMinor > 0) return 'Income'
  if (/rent|mortgage|housing/.test(text)) return 'Housing'
  if (/grocery|groceries|supermarket|food store/.test(text)) return 'Groceries'
  if (/restaurant|dining|cafe|coffee/.test(text)) return 'Dining'
  if (/transport|transit|taxi|uber|lyft|rail|airline/.test(text))
    return 'Transport'
  if (/subscription|spotify|netflix|software/.test(text)) return 'Subscriptions'
  if (/health|medical|pharmacy|doctor/.test(text)) return 'Health'
  return 'Shopping'
}

function shouldReview(merchant: string, amountMinor: number) {
  if (amountMinor >= 0) return false
  if (inferCategory(merchant, amountMinor) !== 'Shopping') return false
  return !/amazon|shop|store|retail|mall/i.test(merchant)
}

function normalizeMerchant(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ') || 'unknown merchant'
}

function toMinorUnits(value: string | number | null | undefined) {
  const amount = typeof value === 'number' ? value : Number(value ?? 0)
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0
}

function safeDate(value: string | null | undefined, fallback: Date) {
  const date = value ? new Date(value) : fallback
  return Number.isNaN(date.getTime()) ? fallback : date
}

function formatDate(value?: Date | null) {
  if (!value) return 'Not synced'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(value)
}

function base64Encode(value: string) {
  if (typeof btoa === 'function') return btoa(value)
  return Buffer.from(value).toString('base64')
}

function errorMessage(value: unknown) {
  return value instanceof Error ? value.message : 'Unknown Synci error'
}

function friendlySynciError(value: unknown) {
  const message = errorMessage(value)
  if (/401|invalid_client/i.test(message)) {
    return new Error('Wollie could not authenticate with its bank provider.')
  }
  if (/402|subscription_required|no_subscription/i.test(message)) {
    return new Error('Bank connection capacity is not active yet.')
  }
  if (
    /capacity_reached|trial_limit_reached|testing_limit_reached/i.test(message)
  ) {
    return new Error(
      'All available bank connection places are currently in use.',
    )
  }
  if (/429/.test(message))
    return new Error('Bank sync is busy. Please try again shortly.')
  return new Error(
    'The bank provider could not complete this request. Please try again.',
  )
}
