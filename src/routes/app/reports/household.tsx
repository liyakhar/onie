import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Printer } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { formatMoney } from '#/lib/finance-demo'
import { buildPageMeta } from '#/lib/seo'
import { exportFinanceBackup } from '#/server/account-data'

export const Route = createFileRoute('/app/reports/household')({
  loader: () => exportFinanceBackup(),
  head: () => ({
    meta: buildPageMeta({
      path: '/app/reports/household',
      title: 'Household report',
      description: 'Printable household finance report.',
      noindex: true,
    }).meta,
  }),
  component: HouseholdReportPage,
})

function HouseholdReportPage() {
  const data = Route.useLoaderData()
  const workspace = data.finance.workspace
  const currency = workspace.currency || workspace.accounts[0]?.currency || 'USD'
  const totalBalanceMinor = workspace.accounts.reduce((sum, account) => sum + account.balanceMinor, 0)
  const totalOutflowMinor = workspace.transactions
    .filter((transaction) => transaction.amountMinor < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amountMinor), 0)
  const totalIncomeMinor = workspace.transactions
    .filter((transaction) => transaction.amountMinor > 0)
    .reduce((sum, transaction) => sum + transaction.amountMinor, 0)
  const latestMonth = workspace.budgetMonths[0]

  return (
    <main className="mx-auto grid max-w-5xl gap-8 bg-white px-4 py-6 text-zinc-950 sm:px-8 print:max-w-none print:px-0 print:py-0">
      <style>{printStyles}</style>
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Household report</h1>
          <p className="mt-1 text-sm text-zinc-500">Print this page or save it as a PDF.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/app/household"><ArrowLeft aria-hidden="true" /> Household</Link>
          </Button>
          <Button type="button" className="wollie-primary-action" onClick={() => window.print()}>
            <Printer aria-hidden="true" /> Print / Save PDF
          </Button>
        </div>
      </header>

      <section className="report-page grid gap-8">
        <div className="flex items-start justify-between gap-6 border-b border-zinc-300 pb-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">Wollie household report</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.04em]">{workspace.name}</h2>
            <p className="mt-2 text-sm text-zinc-500">Exported {new Date(data.exportedAt).toLocaleString()}</p>
          </div>
          <div className="text-right text-sm text-zinc-500">
            <p>{workspace.members.length} member{workspace.members.length === 1 ? '' : 's'}</p>
            <p>{workspace.accounts.length} account{workspace.accounts.length === 1 ? '' : 's'}</p>
            <p>{workspace.transactions.length} transaction{workspace.transactions.length === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Current balance" value={formatMoney(totalBalanceMinor / 100, currency)} />
          <Metric label="Money in" value={formatMoney(totalIncomeMinor / 100, currency)} />
          <Metric label="Money out" value={formatMoney(totalOutflowMinor / 100, currency)} />
        </div>

        <ReportSection title="Members">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Shared cost split</th></tr></thead>
            <tbody>
              {workspace.members.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.name}</td>
                  <td>{member.user.email}</td>
                  <td>{member.role}</td>
                  <td>{member.householdShareBasisPoints / 100}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="Accounts and ownership">
          <table>
            <thead><tr><th>Account</th><th>Institution</th><th>Balance</th><th>Last synced</th><th>Ownership</th></tr></thead>
            <tbody>
              {workspace.accounts.map((account) => (
                <tr key={account.id}>
                  <td>{account.name}</td>
                  <td>{account.institution || '-'}</td>
                  <td>{formatMoney(account.balanceMinor / 100, account.currency)}</td>
                  <td>{account.lastSyncedAt ? new Date(account.lastSyncedAt).toLocaleString() : 'Never'}</td>
                  <td>{account.ownershipShares.map((share) => `${share.member.user.name}: ${share.shareBasisPoints / 100}%`).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        {latestMonth && (
          <ReportSection title={`Budget plan - ${latestMonth.month}`}>
            <table>
              <thead><tr><th>Category</th><th>Allocated</th></tr></thead>
              <tbody>
                {latestMonth.allocations.map((allocation) => (
                  <tr key={allocation.category.name}>
                    <td>{allocation.category.name}</td>
                    <td>{formatMoney(allocation.allocatedMinor / 100, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>
        )}

        <ReportSection title="Planned recurring expenses">
          <table>
            <thead><tr><th>Name</th><th>Amount</th><th>Cadence</th><th>Next date</th><th>Category</th></tr></thead>
            <tbody>
              {workspace.recurringPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.name}</td>
                  <td>{formatMoney(payment.amountMinor / 100, payment.currency)}</td>
                  <td>{payment.cadence}</td>
                  <td>{new Date(payment.nextDate).toLocaleDateString()}</td>
                  <td>{payment.category?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 print:rounded-none">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{value}</p>
    </div>
  )
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3">
      <h3 className="text-lg font-semibold tracking-[-0.02em]">{title}</h3>
      <div className="overflow-hidden rounded-lg border border-zinc-200 print:rounded-none">
        {children}
      </div>
    </section>
  )
}

const printStyles = `
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th, td { border-bottom: 1px solid rgb(228 228 231); padding: 0.75rem; text-align: left; vertical-align: top; }
  th { background: rgb(250 250 250); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgb(113 113 122); }
  tr:last-child td { border-bottom: 0; }
  @media print {
    @page { margin: 18mm; }
    body { background: white !important; }
    .report-page { break-inside: auto; }
    section { break-inside: avoid; }
  }
`
