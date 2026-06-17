import { useState } from 'react'
import { POST_KINDS } from '#/lib/kinds'

const DISMISS_KEY = 'onie-kind-explainer-dismissed'

export function KindExplainer() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(DISMISS_KEY) === '1'
  })

  if (dismissed) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <aside className="kind-explainer" aria-label="Workflow types explained">
      <div className="kind-explainer__head">
        <p className="kind-explainer__title">What you&apos;ll find on Onie</p>
        <button type="button" className="kind-explainer__dismiss" onClick={dismiss}>
          Dismiss
        </button>
      </div>
      <ul className="kind-explainer__list">
        {POST_KINDS.filter((k) => k.value !== 'OTHER').slice(0, 5).map((kind) => (
          <li key={kind.value}>
            <span className="kind-explainer__label">{kind.label}</span>
            <span className="kind-explainer__desc">{kind.description}</span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
