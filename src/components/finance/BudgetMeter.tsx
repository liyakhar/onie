import { formatMoney, type BudgetCategory } from '#/lib/finance-demo'

type BudgetMeterProps = {
  category: BudgetCategory
}

export function BudgetMeter({ category }: BudgetMeterProps) {
  const percent =
    'percentUsed' in category
      ? Math.min(category.percentUsed, 100)
      : Math.min(Math.round((category.spent / category.allocated) * 100), 100)
  const remaining = 'available' in category ? category.available : category.allocated - category.spent
  const state = 'state' in category ? category.state : remaining < 0 ? 'over' : percent >= 85 ? 'watch' : 'good'

  return (
    <div className={`budget-meter budget-meter--${state}`}>
      <div className="budget-meter__row">
        <span>{category.name}</span>
        <strong>{remaining < 0 ? `${formatMoney(Math.abs(remaining))} over` : `${formatMoney(remaining)} left`}</strong>
      </div>
      <div className="budget-meter__track" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="budget-meter__row budget-meter__row--muted">
        <span>{formatMoney(category.spent)} spent</span>
        <span>{formatMoney(category.allocated)} planned</span>
      </div>
    </div>
  )
}
