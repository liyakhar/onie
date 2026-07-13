import type { ReactNode } from 'react'

type FinanceCardProps = {
  eyebrow?: string
  title: string
  value?: string
  note?: string
  children?: ReactNode
}

export function FinanceCard({ eyebrow, title, value, note, children }: FinanceCardProps) {
  return (
    <article className="finance-card">
      {eyebrow && <p className="finance-card__eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {value && <p className="finance-card__value">{value}</p>}
      {note && <p className="finance-card__note">{note}</p>}
      {children}
    </article>
  )
}
