import { createServerFn } from '@tanstack/react-start'
import {
  demoAccounts,
  demoTransactions,
  demoSyncStatus,
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

export const demoBankSyncProvider: BankSyncProvider = {
  id: 'demo',
  name: 'Demo bank',
  isConfigured: () => true,
  async getConnection() {
    return {
        provider: 'demo',
        status: demoSyncStatus,
        accounts: demoAccounts,
        transactions: demoTransactions,
      }
  },
}

type SimpleFinResponse = {
  accounts?: SimpleFinAccount[]
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
  if (isLiveBankSyncEnabled() || getSimpleFinAccessUrl()) {
    return simpleFinProvider.getConnection()
  }

  return demoBankSyncProvider.getConnection()
})

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
  const request = buildSimpleFinAccountsRequest(getSimpleFinAccessUrl())
  const response = await fetch(request.url, {
    headers: request.authorization
      ? { Authorization: request.authorization }
      : undefined,
  })

  if (!response.ok) {
    throw new Error(`SimpleFIN request failed: ${response.status}`)
  }

  return response.json() as Promise<SimpleFinResponse>
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
