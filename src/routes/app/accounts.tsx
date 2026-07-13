import { createFileRoute } from '@tanstack/react-router'
import { formatMoney } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import { getFinanceAccounts } from '#/server/finance'

export const Route = createFileRoute('/app/accounts')({
  loader: async () => getFinanceAccounts(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/accounts',
      title: 'Bank sync',
      description: 'Connected accounts and provider status.',
      noindex: true,
    }).meta,
  }),
  component: AccountsPage,
})

function AccountsPage() {
  const { accounts, syncStatus } = Route.useLoaderData()

  return (
    <main id="main" className="app-page finance-app-page">
      <header className="app-page__head finance-page-head">
        <p className="app-page__eyebrow">Bank sync</p>
        <h1 className="app-page__title">Accounts.</h1>
      </header>

      <section className="finance-sync-callout">
        <div>
          <h2>{syncStatus.label}.</h2>
          <p>{syncStatus.description}</p>
        </div>
        <span>{syncStatus.lastSynced}</span>
      </section>

      <section className="finance-panel">
        <div className="finance-panel__head">
          <div>
            <p>Connected</p>
            <h2>Accounts</h2>
          </div>
          <span className="finance-pill">{syncStatus.mode === 'demo' ? 'Demo' : 'Live'}</span>
        </div>
        <ul className="account-list">
          {accounts.length > 0 ? (
            accounts.map((account) => (
              <li key={account.id}>
                <div>
                  <strong>{account.name}</strong>
                  <span>{account.institution} · {account.type} · synced {account.lastSynced}</span>
                </div>
                <em>{formatMoney(account.balance)}</em>
              </li>
            ))
          ) : (
            <li>
              <div>
                <strong>No accounts loaded</strong>
                <span>Check the bank provider credentials before launching live sync.</span>
              </div>
              <em>—</em>
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}
