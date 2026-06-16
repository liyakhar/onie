import { cn } from '#/lib/utils'

type OnieIconProps = {
  className?: string
  size?: 'sm' | 'md'
}

export function OnieIcon({ className, size = 'md' }: OnieIconProps) {
  return (
    <span
      className={cn('onie-icon', size === 'sm' && 'onie-icon--sm', className)}
      aria-hidden="true"
    >
      O
    </span>
  )
}
