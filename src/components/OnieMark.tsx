import { cn } from '#/lib/utils'

const VARIANTS = {
  display: 'onie-mark--display',
  nav: 'onie-mark--nav',
  rail: 'onie-mark--rail',
  toc: 'onie-mark--toc',
} as const

type OnieMarkProps = {
  variant?: keyof typeof VARIANTS
  className?: string
  as?: 'span' | 'p' | 'h1' | 'div'
}

export function OnieMark({
  variant = 'nav',
  className,
  as: Tag = 'span',
}: OnieMarkProps) {
  return (
    <Tag className={cn('onie-mark', VARIANTS[variant], className)}>
      Onie
    </Tag>
  )
}
