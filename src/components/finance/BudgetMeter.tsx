import { formatMoney } from '#/lib/finance-demo'
import type { BudgetEnvelope } from '#/lib/budget-engine'

type BudgetMeterProps = {
  category: BudgetEnvelope
}

export function BudgetMeter({ category }: BudgetMeterProps) {
  const percent = Math.min(category.percentUsed, 100)
  const remaining = category.available
  const state = category.state

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
