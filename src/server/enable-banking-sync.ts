import { createServerFn, createServerOnlyFn } from '@tanstack/react-start'
import type { FinanceCategory, FinanceTransaction, FinancialAccount } from '#/lib/finance-demo'
import { decryptCredential, encryptCredential, isEncryptedCredential } from '#/server/credential-crypto'

const API_ORIGIN = 'https://api.enablebanking.com'
const REQUEST_TIMEOUT_MS = 20_000
const MAX_TRANSACTIONS_PER_ACCOUNT = 2_000
const MAX_CONTINUATION_PAGES = 50
const OAUTH_VALUE_MAX_LENGTH = 4_096

type Institution = { name: string; country: string; beta: boolean }
type AccountReference = {
  uid: string
  identification_hash?: string | null
  identifications?: Array<{ identification?: string; scheme_name?: string }>
  currency?: string | null
  cash_account_type?: string | null
  holder?: string | null
  details?: string | null
  product?: string | null
}
type SessionResponse = {
  session_id: string
  aspsp?: { name?: string; country?: string }
  accounts?: AccountReference[]
  access?: { valid_until?: string }
}
type PendingCredential = {
  kind: 'pending'
  state: string
  bankName: string
  country: string
  createdAt: string
}
type SessionCredential = {
  kind: 'session'
  sessionId: string
  bankName: string
  country: string
  validUntil: string | null
  accounts: AccountReference[]
}
type StoredCredential = PendingCredential | SessionCredential
type ConnectionRecord = {
  id: string
  userId: string
  workspaceId: string
  credential: StoredCredential
}
type ProviderBalance = {
  balance_amount?: { amount?: string | number; currency?: string }
  balance_type?: string
  reference_date?: string | null
  name?: string | null
}
type ProviderTransaction = {
  entry_reference?: string | null
  transaction_id?: string | null
  booking_date?: string | null
  value_date?: string | null
  transaction_date?: string | null
  credit_debit_indicator?: string | null
  status?: string | null
  transaction_amount?: { amount?: string | number; currency?: string }
  creditor?: { name?: string | null }
  debtor?: { name?: string | null }
  remittance_information?: string[] | string | null
  bank_transaction_code?: { description?: string | null }
  note?: string | null
}
export type EnableBankingSnapshot = {
  accounts: Array<{
    providerAccountId: string
    name: string
    institution: string
    accountType: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD'
    balanceMinor: number
    currency: string
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

export const getEnableBankingInstitutions = createServerFn({ method: 'GET' })
  .validator((data: { country: string }) => ({ country: normalizeCountry(data?.country) }))
  .handler(async ({ data }) => {
    await requireUser()
    return getProviderInstitutions(data.country)
  })

export const getPublicEnableBankingInstitutions = createServerFn({ method: 'GET' })
  .validator((data: { country: string }) => ({ country: normalizeCountry(data?.country) }))
  .handler(async ({ data }) => {
    return getProviderInstitutions(data.country)
  })

export const startEnableBankingConnection = createServerFn({ method: 'POST' })
  .validator((data: { country: string; bankName: string }) => ({
    country: normalizeCountry(data?.country),
    bankName: normalizeBankName(data?.bankName),
  }))
  .handler(async ({ data }) => {
    assertLiveSyncAllowed()
    const user = await requireUser()
    const available = await providerRequest<{ aspsps?: Array<{ name?: string; country?: string }> }>(
      `/aspsps?country=${encodeURIComponent(data.country)}&psu_type=personal&service=AIS`,
    )
    const official = (available.aspsps || []).find(
      (bank) => bank.name === data.bankName && String(bank.country || '').toUpperCase() === data.country,
    )
    if (!official) throw new Error('That bank is not currently available through Enable Banking.')

    const state = crypto.randomUUID()
    await saveCredential(user.id, {
      kind: 'pending',
      state,
      bankName: data.bankName,
      country: data.country,
      createdAt: new Date().toISOString(),
    }, 'SYNCING')

    const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1_000).toISOString()
    const result = await providerRequest<{ url?: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({
        access: { valid_until: validUntil },
        aspsp: { name: data.bankName, country: data.country },
        state,
        redirect_url: getRedirectUrl(),
        psu_type: 'personal',
      }),
    })
    if (!result.url || !isOfficialAuthorizationUrl(result.url)) {
      throw new Error('Enable Banking did not return a valid authorization page.')
    }
    return { url: result.url }
  })

export const completeEnableBankingConnection = createServerFn({ method: 'POST' })
  .validator((data: { code: string; state: string }) => ({
    code: normalizeOAuthValue(data?.code, 'authorization code'),
    state: normalizeOAuthValue(data?.state, 'connection state'),
  }))
  .handler(async ({ data }) => {
    assertLiveSyncAllowed()
    const user = await requireUser()
    const connection = await getConnection(user.id)
    if (!connection || connection.credential.kind !== 'pending') {
      throw new Error('This bank connection was not started in Wollie. Please try again.')
    }
    if (!timingSafeEqual(connection.credential.state, data.state)) {
      throw new Error('The bank callback could not be verified. Please start again.')
    }
    if (Date.now() - new Date(connection.credential.createdAt).getTime() > 15 * 60 * 1_000) {
      throw new Error('The bank connection expired. Please start again.')
    }

    try {
      const session = await providerRequest<SessionResponse>('/sessions', {
        method: 'POST',
        body: JSON.stringify({ code: data.code }),
      })
      const accounts = session.accounts || []
      if (!session.session_id || !accounts.length) {
        throw new Error('The bank connected, but it did not share any eligible accounts.')
      }
      const credential: SessionCredential = {
        kind: 'session',
        sessionId: session.session_id,
        bankName: session.aspsp?.name || connection.credential.bankName,
        country: session.aspsp?.country || connection.credential.country,
        validUntil: session.access?.valid_until || null,
        accounts,
      }
      await updateCredential(connection.id, credential)
      const snapshot = await fetchSnapshot(credential)
      await persistSnapshot({ ...connection, credential }, snapshot)
      return { connected: true, accounts: snapshot.accounts.length }
    } catch (error) {
      await recordFailedSync(connection, error).catch(() => undefined)
      throw friendlyProviderError(error)
    }
  })

export const syncEnableBanking = createServerFn({ method: 'POST' }).handler(async () => {
  assertLiveSyncAllowed()
  const user = await requireUser()
  const connection = await getConnection(user.id)
  if (!connection || connection.credential.kind !== 'session') {
    throw new Error('Connect a European bank before syncing.')
  }
  try {
    const snapshot = await fetchSnapshot(connection.credential)
    await persistSnapshot(connection, snapshot)
    return { synced: true, accounts: snapshot.accounts.length }
  } catch (error) {
    await recordFailedSync(connection, error).catch(() => undefined)
    throw friendlyProviderError(error)
  }
})

export const disconnectEnableBanking = createServerFn({ method: 'POST' }).handler(async () => {
  const user = await requireUser()
  const connection = await getConnection(user.id)
  if (connection?.credential.kind === 'session') {
    await providerRequest(`/sessions/${encodeURIComponent(connection.credential.sessionId)}`, {
      method: 'DELETE',
    }).catch(() => undefined)
  }
  await deleteConnection(user.id)
  return { disconnected: true }
})

export async function revokeEnableBankingBeforeUserDeletion(userId: string) {
  const connection = await getConnection(userId)
  if (connection?.credential.kind !== 'session') return

  try {
    await providerRequest(`/sessions/${encodeURIComponent(connection.credential.sessionId)}`, {
      method: 'DELETE',
    })
  } catch (error) {
    // A missing or expired provider session is already effectively revoked.
    const message = error instanceof Error ? error.message : ''
    if (!/404|EXPIRED_SESSION|WRONG_SESSION_STATUS|NO_SESSION/i.test(message)) throw error
  }
}

export const getEnableBankingStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await requireUser()
  const prisma = await getDb()
  const saved = await prisma.bankConnection.findFirst({
    where: { userId: user.id, provider: 'ENABLE_BANKING' },
    orderBy: { updatedAt: 'desc' },
    select: { status: true, lastSyncedAt: true },
  })
  const connection = await getConnection(user.id)
  const hasSession = connection?.credential.kind === 'session'
  return {
    configured: hasProviderConfig(),
    environment: process.env.ENABLE_BANKING_ENVIRONMENT === 'production' ? 'Live' : 'Sandbox',
    connected: hasSession,
    needsReconnect: hasSession && (saved?.status === 'NEEDS_RECONNECT' || saved?.status === 'FAILED'),
    lastSynced: formatDate(saved?.lastSyncedAt),
  }
})

export const loadEnableBankingData = createServerOnlyFn(async (userId: string) => {
  const prisma = await getDb()
  const connections = await prisma.bankConnection.findMany({
    where: {
      userId,
      provider: 'ENABLE_BANKING',
      status: { in: ['CONNECTED', 'NEEDS_RECONNECT', 'FAILED', 'SYNCING'] },
    },
    select: { id: true, lastSyncedAt: true },
    orderBy: { updatedAt: 'desc' },
  })
  if (!connections.length) return { accounts: [], transactions: [], lastSynced: 'Not connected' }
  const savedAccounts = await prisma.financialAccount.findMany({
    where: { bankConnectionId: { in: connections.map((connection) => connection.id) } },
    include: {
      ownershipShares: true,
      bankConnection: { select: { status: true } },
      transactions: {
        include: { category: true, merchant: true },
        orderBy: { postedAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  const accounts: FinancialAccount[] = savedAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    type: account.type === 'CREDIT_CARD' ? 'Credit card' : account.type === 'SAVINGS' ? 'Savings' : 'Checking',
    balance: account.balanceMinor / 100,
    currency: account.currency,
    institution: account.institution || 'European bank',
    lastSynced: formatDate(account.lastSyncedAt),
    connectionStatus: account.bankConnection?.status || 'NOT_CONNECTED',
    ownership: account.ownershipShares.map((share) => ({
      memberId: share.memberId,
      shareBasisPoints: share.shareBasisPoints,
    })),
  }))
  const transactions: FinanceTransaction[] = savedAccounts.flatMap((account) =>
    account.transactions.map((transaction) => ({
      id: transaction.id,
      accountId: account.id,
      date: transaction.postedAt.toISOString(),
      merchant: displayMerchantName(transaction.merchant?.name || transaction.description),
      account: account.name,
      category: toCategory(transaction.category?.name),
      amount: transaction.amountMinor / 100,
      currency: transaction.currency,
      status: transaction.status === 'PENDING'
        ? 'pending' as const
        : transaction.status === 'NEEDS_REVIEW'
          ? 'needs-review' as const
          : 'cleared' as const,
      recurring: transaction.recurring,
    })),
  )
  return { accounts, transactions, lastSynced: formatDate(connections[0]?.lastSyncedAt) }
})

export function buildEnableBankingSnapshot(
  credential: Pick<SessionCredential, 'bankName' | 'accounts'>,
  data: Map<string, { balances: ProviderBalance[]; transactions: ProviderTransaction[] }>,
): EnableBankingSnapshot {
  return {
    accounts: credential.accounts.map((account) => {
      const accountData = data.get(account.uid) || { balances: [], transactions: [] }
      const balance = chooseBalance(accountData.balances)
      const currency = String(account.currency || balance?.balance_amount?.currency || 'EUR').toUpperCase()
      const identification = account.identifications?.[0]?.identification || ''
      return {
        providerAccountId: account.identification_hash || account.uid,
        name: account.details || account.product || maskIdentification(identification) || 'Bank account',
        institution: credential.bankName,
        accountType: inferAccountType(account.cash_account_type, account.product),
        balanceMinor: toMinorUnits(balance?.balance_amount?.amount),
        currency,
        transactions: accountData.transactions.slice(0, MAX_TRANSACTIONS_PER_ACCOUNT).map((transaction, index) => {
          const amountMinor = signedAmountMinor(transaction)
          const merchantName = transactionMerchant(transaction)
          const categoryName = inferCategory(merchantName, amountMinor)
          const pending = /pending|pdng/i.test(transaction.status || '')
          return {
            providerTransactionId: transaction.entry_reference || fallbackTransactionId(transaction, index),
            postedAt: safeDate(transaction.booking_date || transaction.value_date || transaction.transaction_date),
            description: transactionDescription(transaction, merchantName),
            merchantName,
            categoryName,
            amountMinor,
            currency: String(transaction.transaction_amount?.currency || currency).toUpperCase(),
            status: pending ? 'PENDING' : shouldReview(merchantName, amountMinor) ? 'NEEDS_REVIEW' : 'CLEARED',
          }
        }),
      }
    }),
  }
}

async function fetchSnapshot(credential: SessionCredential) {
  const data = new Map<string, { balances: ProviderBalance[]; transactions: ProviderTransaction[] }>()
  await Promise.all(credential.accounts.map(async (account) => {
    const balances = await providerRequest<{ balances?: ProviderBalance[] }>(
      `/accounts/${encodeURIComponent(account.uid)}/balances`,
    )
    const transactions: ProviderTransaction[] = []
    const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1_000).toISOString().slice(0, 10)
    let continuationKey: string | null = null
    for (let page = 0; page < MAX_CONTINUATION_PAGES; page += 1) {
      const query = new URLSearchParams({ date_from: dateFrom })
      if (continuationKey) query.set('continuation_key', continuationKey)
      const response = await providerRequest<{ transactions?: ProviderTransaction[]; continuation_key?: string | null }>(
        `/accounts/${encodeURIComponent(account.uid)}/transactions?${query}`,
      )
      transactions.push(...(response.transactions || []))
      continuationKey = response.continuation_key || null
      if (!continuationKey || transactions.length >= MAX_TRANSACTIONS_PER_ACCOUNT) break
    }
    data.set(account.uid, { balances: balances.balances || [], transactions })
  }))
  return buildEnableBankingSnapshot(credential, data)
}

async function providerRequest<T = Record<string, unknown>>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await createProviderJwt()}`,
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
    // Cloudflare Workers supports `manual`, but not `error`. We still reject
    // provider redirects below because any 3xx response is not `ok`.
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as { message?: string; error?: string }
    throw new Error(`${payload.error || 'ENABLE_BANKING_ERROR'}: ${payload.message || response.status}`)
  }
  if (response.status === 204) return {} as T
  return await response.json() as T
}

async function getProviderInstitutions(country: string) {
  const response = await providerRequest<{ aspsps?: Array<Record<string, unknown>> }>(
    `/aspsps?country=${encodeURIComponent(country)}&psu_type=personal&service=AIS`,
  )
  return (response.aspsps || [])
    .map((bank) => ({
      name: String(bank.name || '').trim(),
      country: String(bank.country || country).trim().toUpperCase(),
      beta: bank.beta === true,
      logoUrl: typeof bank.logo === 'string' ? bank.logo : null,
    }))
    .filter((bank): bank is Institution & { logoUrl: string | null } => Boolean(bank.name && bank.country && bank.name !== 'Mock ASPSP'))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export async function createProviderJwt(nowSeconds = Math.floor(Date.now() / 1_000)) {
  const { applicationId, privateKey } = getProviderConfig()
  const header = base64UrlJson({ typ: 'JWT', alg: 'RS256', kid: applicationId })
  const payload = base64UrlJson({
    iss: 'enablebanking.com',
    aud: 'api.enablebanking.com',
    iat: nowSeconds,
    exp: nowSeconds + 300,
  })
  const signingInput = `${header}.${payload}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBytes(privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))
  return `${signingInput}.${base64UrlBytes(new Uint8Array(signature))}`
}

async function saveCredential(userId: string, credential: StoredCredential, status: 'SYNCING' | 'CONNECTED') {
  const prisma = await getDb()
  const workspace = await getOrCreateWorkspace(userId)
  const tokenRef = await encryptCredential(JSON.stringify(credential), getEncryptionSecret())
  const existing = await prisma.bankConnection.findFirst({ where: { userId, provider: 'ENABLE_BANKING' } })
  const data = {
    workspaceId: workspace.id,
    providerItemId: `${userId}:enable-banking`,
    tokenRef,
    status,
  } as const
  const connection = existing
    ? await prisma.bankConnection.update({ where: { id: existing.id }, data })
    : await prisma.bankConnection.create({
        data: { userId, provider: 'ENABLE_BANKING', ...data },
      })
  return { id: connection.id, userId, workspaceId: workspace.id, credential }
}

async function updateCredential(connectionId: string, credential: StoredCredential) {
  const prisma = await getDb()
  await prisma.bankConnection.update({
    where: { id: connectionId },
    data: { tokenRef: await encryptCredential(JSON.stringify(credential), getEncryptionSecret()) },
  })
}

async function getConnection(userId: string): Promise<ConnectionRecord | null> {
  const prisma = await getDb()
  const connection = await prisma.bankConnection.findFirst({
    where: { userId, provider: 'ENABLE_BANKING', status: { in: ['CONNECTED', 'SYNCING', 'NEEDS_RECONNECT', 'FAILED'] } },
    orderBy: { updatedAt: 'desc' },
  })
  if (!connection?.tokenRef || !isEncryptedCredential(connection.tokenRef)) return null
  try {
    return {
      id: connection.id,
      userId,
      workspaceId: connection.workspaceId,
      credential: JSON.parse(await decryptCredential(connection.tokenRef, getEncryptionSecret())) as StoredCredential,
    }
  } catch {
    await prisma.bankConnection.update({ where: { id: connection.id }, data: { status: 'NEEDS_RECONNECT' } })
    return null
  }
}

async function persistSnapshot(connection: ConnectionRecord, snapshot: EnableBankingSnapshot) {
  const prisma = await getDb()
  const syncedAt = new Date()
  await prisma.$transaction(async (tx) => {
    let transactionsAdded = 0
    for (const account of snapshot.accounts) {
      const savedAccount = await tx.financialAccount.upsert({
        where: { bankConnectionId_providerAccountId: { bankConnectionId: connection.id, providerAccountId: account.providerAccountId } },
        create: {
          workspaceId: connection.workspaceId,
          bankConnectionId: connection.id,
          providerAccountId: account.providerAccountId,
          name: account.name,
          institution: account.institution,
          type: account.accountType,
          currency: account.currency,
          balanceMinor: account.balanceMinor,
          lastSyncedAt: syncedAt,
        },
        update: {
          name: account.name,
          institution: account.institution,
          type: account.accountType,
          currency: account.currency,
          balanceMinor: account.balanceMinor,
          lastSyncedAt: syncedAt,
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
      if (!member) throw new Error('Bank connection owner is not a household member.')
      const ownershipCount = await tx.accountOwnership.count({ where: { accountId: savedAccount.id } })
      if (ownershipCount === 0) {
        await tx.accountOwnership.create({
          data: { accountId: savedAccount.id, memberId: member.id, shareBasisPoints: 10_000 },
        })
      }
      for (const transaction of account.transactions) {
        const normalizedName = normalizeMerchant(transaction.merchantName)
        const [category, merchant, existing] = await Promise.all([
          tx.transactionCategory.upsert({
            where: { workspaceId_name: { workspaceId: connection.workspaceId, name: transaction.categoryName } },
            create: { workspaceId: connection.workspaceId, name: transaction.categoryName, system: true },
            update: {},
          }),
          tx.merchant.upsert({
            where: { workspaceId_normalizedName: { workspaceId: connection.workspaceId, normalizedName } },
            create: { workspaceId: connection.workspaceId, name: transaction.merchantName, normalizedName },
            update: { name: transaction.merchantName },
          }),
          tx.financeTransaction.findUnique({
            where: { accountId_providerTransactionId: { accountId: savedAccount.id, providerTransactionId: transaction.providerTransactionId } },
            select: { id: true },
          }),
        ])
        const rule = await tx.categoryRule.findFirst({
          where: { workspaceId: connection.workspaceId, merchantId: merchant.id },
          select: { categoryId: true },
        })
        if (!existing) transactionsAdded += 1
        await tx.financeTransaction.upsert({
          where: { accountId_providerTransactionId: { accountId: savedAccount.id, providerTransactionId: transaction.providerTransactionId } },
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
            status: rule && transaction.status !== 'PENDING' ? 'CLEARED' : transaction.status,
          },
          update: {
            categoryId: rule?.categoryId || category.id,
            merchantId: merchant.id,
            postedAt: transaction.postedAt,
            description: transaction.description,
            amountMinor: transaction.amountMinor,
            currency: transaction.currency,
            status: rule && transaction.status !== 'PENDING' ? 'CLEARED' : transaction.status,
          },
        })
      }
    }
    const transactionsSeen = snapshot.accounts.reduce((sum, account) => sum + account.transactions.length, 0)
    await Promise.all([
      tx.bankConnection.update({
        where: { id: connection.id },
        data: { status: 'CONNECTED', lastSyncedAt: syncedAt },
      }),
      tx.syncRun.create({
        data: {
          workspaceId: connection.workspaceId,
          bankConnectionId: connection.id,
          provider: 'ENABLE_BANKING',
          status: 'SUCCESS',
          startedAt: syncedAt,
          finishedAt: new Date(),
          transactionsSeen,
          transactionsAdded,
        },
      }),
    ])
  }, { maxWait: 5_000, timeout: 60_000 })
}

async function recordFailedSync(connection: ConnectionRecord, error: unknown) {
  const prisma = await getDb()
  const message = error instanceof Error ? error.message : 'Unknown Enable Banking error'
  await Promise.all([
    prisma.bankConnection.update({ where: { id: connection.id }, data: { status: 'FAILED' } }),
    prisma.syncRun.create({
      data: {
        workspaceId: connection.workspaceId,
        bankConnectionId: connection.id,
        provider: 'ENABLE_BANKING',
        status: 'FAILED',
        finishedAt: new Date(),
        errorCode: 'ENABLE_BANKING_SYNC_FAILED',
        errorMessage: message.slice(0, 500),
      },
    }),
  ])
}

async function deleteConnection(userId: string) {
  const prisma = await getDb()
  await prisma.$transaction(async (tx) => {
    const connections = await tx.bankConnection.findMany({
      where: { userId, provider: 'ENABLE_BANKING' },
      select: { id: true, accounts: { select: { id: true } } },
    })
    const connectionIds = connections.map((connection) => connection.id)
    const accountIds = connections.flatMap((connection) => connection.accounts.map((account) => account.id))
    if (accountIds.length) await tx.financeTransaction.deleteMany({ where: { accountId: { in: accountIds } } })
    if (accountIds.length) await tx.financialAccount.deleteMany({ where: { id: { in: accountIds } } })
    if (connectionIds.length) await tx.syncRun.deleteMany({ where: { bankConnectionId: { in: connectionIds } } })
    await tx.bankConnection.deleteMany({ where: { userId, provider: 'ENABLE_BANKING' } })
  }, { maxWait: 5_000, timeout: 30_000 })
}

function getProviderConfig() {
  const applicationId = process.env.ENABLE_BANKING_APPLICATION_ID?.trim()
  const privateKey = normalizePrivateKey(process.env.ENABLE_BANKING_PRIVATE_KEY || '')
  if (!applicationId || !privateKey) {
    throw new Error('Enable Banking is not configured. Add the application ID and private key on the server.')
  }
  return { applicationId, privateKey }
}
function hasProviderConfig() {
  return Boolean(process.env.ENABLE_BANKING_APPLICATION_ID?.trim() && process.env.ENABLE_BANKING_PRIVATE_KEY?.trim())
}
function getRedirectUrl() {
  const value = process.env.ENABLE_BANKING_REDIRECT_URL?.trim()
    || `${String(process.env.SITE_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000').replace(/\/$/, '')}/app/accounts`
  const url = new URL(value)
  const local = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)
  if ((!local && url.protocol !== 'https:') || url.username || url.password || url.hash) {
    throw new Error('ENABLE_BANKING_REDIRECT_URL must be HTTPS, or localhost during development.')
  }
  return url.toString()
}
function normalizePrivateKey(value: string) {
  return value.trim().replace(/\\n/g, '\n')
}
function pemToBytes(value: string) {
  const encoded = value.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')
  if (!encoded) throw new Error('ENABLE_BANKING_PRIVATE_KEY must be a PKCS#8 PEM private key.')
  try {
    const binary = typeof atob === 'function' ? atob(encoded) : Buffer.from(encoded, 'base64').toString('binary')
    return Uint8Array.from(binary, (character) => character.charCodeAt(0))
  } catch {
    throw new Error('ENABLE_BANKING_PRIVATE_KEY is not valid base64 PEM data.')
  }
}
function base64UrlJson(value: unknown) {
  return base64UrlBytes(new TextEncoder().encode(JSON.stringify(value)))
}
function base64UrlBytes(value: Uint8Array) {
  let binary = ''
  for (const byte of value) binary += String.fromCharCode(byte)
  const encoded = typeof btoa === 'function' ? btoa(binary) : Buffer.from(value).toString('base64')
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
function isOfficialAuthorizationUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'enablebanking.com' || url.hostname.endsWith('.enablebanking.com'))
  } catch { return false }
}
function normalizeCountry(value: unknown) {
  const country = String(value || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) throw new Error('Choose a valid bank country.')
  return country
}
function normalizeBankName(value: unknown) {
  const name = String(value || '').trim()
  if (!name || name.length > 160) throw new Error('Choose a valid bank.')
  return name
}
function normalizeOAuthValue(value: unknown, label: string) {
  const normalized = String(value || '').trim()
  if (!normalized || normalized.length > OAUTH_VALUE_MAX_LENGTH) throw new Error(`The ${label} is invalid.`)
  return normalized
}
function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  return difference === 0
}
function assertLiveSyncAllowed() {
  if (process.env.NODE_ENV !== 'production') return
  if (process.env.ENABLE_LIVE_BANK_SYNC !== 'true') {
    throw new Error('Live bank sync is not enabled in production.')
  }
  const environment = process.env.ENABLE_BANKING_ENVIRONMENT
  if (environment === 'sandbox' && !process.env.STAGING_ACCESS_PASSWORD?.trim()) {
    throw new Error('Enable Banking sandbox access requires private staging protection.')
  }
  if (environment === 'production' && process.env.ENABLE_BANKING_PUBLIC_ACCESS_APPROVED !== 'true') {
    throw new Error('Public Enable Banking access is not approved yet.')
  }
  if (environment !== 'sandbox' && environment !== 'production') {
    throw new Error('Choose the Enable Banking sandbox or production environment explicitly.')
  }
}

export function assertEnableBankingAccessAllowed() {
  assertLiveSyncAllowed()
}
function getEncryptionSecret() {
  const explicit = process.env.BANK_SYNC_ENCRYPTION_KEY?.trim()
  if (explicit) return explicit
  if (process.env.NODE_ENV !== 'production' && process.env.BETTER_AUTH_SECRET?.trim()) return process.env.BETTER_AUTH_SECRET.trim()
  throw new Error('BANK_SYNC_ENCRYPTION_KEY is required for bank sync.')
}
async function requireUser() {
  const { requireFinanceHousehold } = await import('#/server/household-access.server')
  return (await requireFinanceHousehold()).user
}
async function getDb() {
  const { getDb: loadDb } = await import('#/server/db-access.server')
  return loadDb()
}
async function getOrCreateWorkspace(userId: string) {
  const { getOrCreateFinanceHousehold } = await import('#/server/household-access.server')
  const context = await getOrCreateFinanceHousehold(userId, 'EUR')
  return { id: context.workspaceId }
}
function chooseBalance(balances: ProviderBalance[]) {
  return balances.find((balance) => /ITAV|interimAvailable/i.test(balance.balance_type || ''))
    || balances.find((balance) => /ITBD|closingBooked|interimBooked/i.test(balance.balance_type || ''))
    || balances[0]
}
function inferAccountType(type?: string | null, product?: string | null) {
  const value = `${type || ''} ${product || ''}`.toLowerCase()
  if (value.includes('card') || value.includes('credit')) return 'CREDIT_CARD' as const
  if (value.includes('svgs') || value.includes('saving')) return 'SAVINGS' as const
  return 'CHECKING' as const
}
function signedAmountMinor(transaction: ProviderTransaction) {
  const amount = Math.abs(toMinorUnits(transaction.transaction_amount?.amount))
  return /debit|dbit/i.test(transaction.credit_debit_indicator || '') ? -amount : amount
}
function transactionMerchant(transaction: ProviderTransaction) {
  return displayMerchantName(String(
    transaction.creditor?.name
      || transaction.debtor?.name
      || firstRemittance(transaction.remittance_information)
      || transaction.bank_transaction_code?.description
      || transaction.note
      || 'Unknown transaction',
  ).trim())
}
function displayMerchantName(value: string) {
  let name = value.trim()
  const issuedBy = name.match(/\bissued by\s+(.+)$/i)
  if (issuedBy?.[1]) name = issuedBy[1].trim()
  name = name.replace(/^CARD-\d+\s*[·-]\s*/i, '').trim()
  name = name.replace(/\b([\p{L}'-]+)\s+\1$/iu, '$1').trim()
  return name || 'Unknown transaction'
}
function transactionDescription(transaction: ProviderTransaction, fallback: string) {
  return String(firstRemittance(transaction.remittance_information) || transaction.note || fallback).trim()
}
function firstRemittance(value: ProviderTransaction['remittance_information']) {
  return Array.isArray(value) ? value.filter(Boolean).join(' · ') : value || ''
}
function fallbackTransactionId(transaction: ProviderTransaction, index: number) {
  return [transaction.booking_date || transaction.value_date || 'pending', transaction.transaction_amount?.amount || '0', transactionMerchant(transaction), index].join(':').slice(0, 190)
}
function inferCategory(description: string, amountMinor: number): FinanceCategory {
  const value = description.toLowerCase()
  if (amountMinor > 0) return 'Income'
  if (/rent|mortgage|landlord|housing/.test(value)) return 'Housing'
  if (/whole foods|carrefour|grocery|supermarket|market/.test(value)) return 'Groceries'
  if (/restaurant|cafe|coffee|deliveroo|uber eats/.test(value)) return 'Dining'
  if (/train|metro|uber|taxi|fuel|parking/.test(value)) return 'Transport'
  if (/netflix|spotify|subscription|adobe|icloud/.test(value)) return 'Subscriptions'
  if (/electric|water|internet|phone|utility/.test(value)) return 'Housing'
  if (/doctor|pharmacy|health|dental/.test(value)) return 'Health'
  if (/transfer|wise|revolut/.test(value)) return 'Transfer'
  return 'Shopping'
}
function shouldReview(description: string, amountMinor: number) {
  return description === 'Unknown transaction' || (amountMinor < 0 && /^[A-Z0-9*# -]+$/.test(description) && /\d{3,}/.test(description))
}
function toMinorUnits(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? Math.round(number * 100) : 0
}
function safeDate(value?: string | null) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime()) ? new Date() : date
}
function maskIdentification(value: string) {
  const compact = value.replace(/\s/g, '')
  return compact.length > 4 ? `Account •${compact.slice(-4)}` : ''
}
function normalizeMerchant(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().slice(0, 160) || 'unknown transaction'
}
function toCategory(value?: string | null): FinanceCategory {
  const categories: FinanceCategory[] = ['Housing', 'Groceries', 'Dining', 'Transport', 'Subscriptions', 'Health', 'Shopping', 'Transfer', 'Income']
  return categories.includes(value as FinanceCategory) ? value as FinanceCategory : 'Shopping'
}
function formatDate(value?: Date | null) {
  if (!value) return 'Not connected'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(value)
}
function friendlyProviderError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown provider error'
  if (/401|403|AUTHORIZATION_NOT_PROVIDED|ACCESS_DENIED/i.test(message)) return new Error('Enable Banking rejected the application credentials or account access.')
  if (/EXPIRED_SESSION|WRONG_SESSION_STATUS|NO_ACCOUNTS_ADDED/i.test(message)) return new Error('Your bank consent expired or no longer includes this account. Reconnect it.')
  if (/timeout|abort/i.test(message)) return new Error('The bank took too long to respond. Try again.')
  if (/fetch failed|network/i.test(message)) return new Error('Wollie could not reach Enable Banking. Try again.')
  return new Error(`Could not sync the bank: ${message.slice(0, 180)}`)
}
