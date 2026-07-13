import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  filterFinanceTransactions,
  formatMoney,
  getDemoFinanceDashboard,
  type FinanceTransaction,
} from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'

export const Route = createFileRoute('/app/transactions')({
  loader: () => ({
    transactions: filterFinanceTransactions(getDemoFinanceDashboard().transactions, {
      status: 'all',
      category: 'all',
    }),
  }),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/transactions',
      title: 'Transactions',
      description: 'Review synced transactions.',
      noindex: true,
    }).meta,
  }),
  component: TransactionsPage,
})

function TransactionsPage() {
  const { transactions } = Route.useLoaderData()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<FinanceTransaction['status'] | 'all'>('all')

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return transactions.filter((transaction) => {
      const matchesQuery = normalizedQuery
        ? [transaction.merchant, transaction.account, transaction.category]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery)
        : true
      const matchesStatus = status === 'all' || transaction.status === status

      return matchesQuery && matchesStatus
    })
  }, [query, status, transactions])

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">Transaction inbox</p>
        <h1 className="app-page__title">Activity.</h1>
      </header>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <p>July</p>
            <h2>Needs almost no work</h2>
          </div>
          <span className="finance-pill">{filteredTransactions.length} shown</span>
        </div>

        <div className="finance-toolbar" aria-label="Transaction filters">
          <label className="finance-search">
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Merchant, account, category"
            />
          </label>
          <div className="finance-segmented" role="group" aria-label="Status">
            {(['all', 'needs-review', 'pending', 'cleared'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={status === item ? 'is-active' : undefined}
                onClick={() => setStatus(item)}
              >
                {item === 'all' ? 'All' : item.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <ul className="transaction-list transaction-list--large">
          {filteredTransactions.map((transaction) => (
            <li key={transaction.id} className={transaction.status === 'needs-review' ? 'needs-review' : undefined}>
              <div>
                <strong>{transaction.merchant}</strong>
                <span>
                  {transaction.date} · {transaction.account} · {transaction.category}
                  {transaction.recurring ? ' · recurring' : ''}
                </span>
              </div>
              <div className="transaction-list__side">
                <small>{transaction.status.replace('-', ' ')}</small>
                <em className={transaction.amount > 0 ? 'is-positive' : undefined}>
                  {formatMoney(transaction.amount)}
                </em>
              </div>
            </li>
          ))}
        </ul>
        {filteredTransactions.length === 0 && (
          <p className="finance-empty">No transactions match that filter.</p>
        )}
      </section>
    </main>
  )
}
