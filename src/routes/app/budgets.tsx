import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { FINANCE_CATEGORIES, formatMoney } from '#/lib/finance-demo'
import { getFinanceBudget, updateFinanceBudgetAllocation } from '#/server/finance'

const PLANNABLE = FINANCE_CATEGORIES.filter((category) => !['Income', 'Transfer'].includes(category))

export const Route = createFileRoute('/app/budgets')({
  loader: () => getFinanceBudget(),
  component: BudgetPage,
})

function BudgetPage() {
  const data = Route.useLoaderData()
  const router = useRouter()
  const currency = data.currency
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(PLANNABLE.map((name) => [name, String(data.budget.find((item) => item.name === name)?.allocated ?? 0)])))
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const hasPlan = data.budget.some((item) => item.allocated > 0)

  async function savePlan() {
    const categories = PLANNABLE.filter((category) => Number(values[category] || 0) > 0 || data.budget.some((item) => item.name === category))
    if (categories.length === 0) {
      setMessage('Add at least one monthly limit.')
      return
    }
    setSaving('plan')
    setMessage('')
    try {
      for (const category of categories) {
        await updateFinanceBudgetAllocation({ data: { category, allocated: Number(values[category] || 0) } })
      }
      await router.invalidate()
      setMessage('Monthly plan saved.')
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Could not update the plan.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <main id="main" className="mx-auto grid w-full max-w-7xl gap-5 bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <header className="border-b border-zinc-200 pb-5">
        <p className="text-sm text-zinc-500">{data.month}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Monthly plan</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">Set limits only for the categories you want to control.</p>
      </header>

      {hasPlan && <section aria-label="Plan totals" className="grid overflow-hidden rounded-lg border border-zinc-200 sm:grid-cols-3">
        <Total label="Planned" value={formatMoney(data.budgetPlan.allocated, currency)} />
        <Total label="Used" value={formatMoney(data.budgetPlan.spent, currency)} />
        <Total label="Flexible left" value={formatMoney(data.budgetPlan.flexibleAvailable, currency)} dark />
      </section>}

      <section aria-labelledby="category-plan-heading" className="overflow-hidden rounded-lg border border-zinc-200">
        <div className="border-b border-zinc-200 px-4 py-4 sm:px-5"><h2 id="category-plan-heading" className="font-semibold">Category limits</h2></div>
        <ul className="divide-y divide-zinc-200">
          {PLANNABLE.map((category) => {
            const item = data.budget.find((candidate) => candidate.name === category)
            const spent = item?.spent ?? 0
            return (
              <li key={category} className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-end sm:px-5">
                <div>
                  <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{category}</h3><span className="text-xs text-zinc-500">{formatMoney(spent, currency)} used</span></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-zinc-950" style={{ width: `${Math.min(100, spent / Math.max(Number(values[category]) || 1, 1) * 100)}%` }} /></div>
                </div>
                <label className="grid gap-1 text-xs text-zinc-500">Monthly limit<Input name={`budget-${category}`} inputMode="decimal" value={values[category]} onChange={(event) => setValues((current) => ({ ...current, [category]: event.target.value }))} className="min-h-11 border-zinc-200 bg-white text-sm text-zinc-950" /></label>
              </li>
            )
          })}
        </ul>
      </section>
      <div className="flex justify-end">
        <Button className="wollie-primary-action min-h-11" disabled={saving === 'plan'} onClick={() => void savePlan()}>{saving === 'plan' ? 'Saving…' : 'Save monthly plan'}</Button>
      </div>
      <p className="min-h-5 text-sm text-zinc-600" aria-live="polite">{message}</p>
    </main>
  )
}

function Total({ dark = false, label, value }: { dark?: boolean; label: string; value: string }) {
  return <div className={`border-b border-zinc-200 p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${dark ? 'bg-zinc-950 text-white' : ''}`}><p className={`text-xs uppercase tracking-[0.1em] ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div>
}
