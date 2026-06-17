import type { PostKind } from '#/generated/prisma/client'
import { POST_KINDS } from '#/lib/kinds'
import { cn } from '#/lib/utils'

const PRIMARY_KINDS: PostKind[] = ['SKILL', 'PROMPT', 'HARNESS', 'WORKFLOW', 'SETUP', 'OTHER']

export function KindPicker({
  value,
  onChange,
}: {
  value: PostKind
  onChange: (kind: PostKind) => void
}) {
  const primary = POST_KINDS.filter((k) => PRIMARY_KINDS.includes(k.value))
  const description = POST_KINDS.find((k) => k.value === value)?.description

  return (
    <div className="kind-picker">
      <div className="kind-picker__grid" role="radiogroup" aria-label="Workflow type">
        {primary.map((item) => (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={value === item.value}
            className={cn('kind-picker__card', value === item.value && 'is-active')}
            onClick={() => onChange(item.value)}
          >
            <span className="kind-picker__label">{item.label}</span>
          </button>
        ))}
      </div>
      {description && <p className="app-form__hint">{description}</p>}
    </div>
  )
}
