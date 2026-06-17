export const ACCENT_IDS = ['rosin', 'dusty', 'brick'] as const

export type AccentId = (typeof ACCENT_IDS)[number]

export const DEFAULT_ACCENT: AccentId = 'rosin'

export const ACCENT_PRESETS: {
  id: AccentId
  label: string
  swatch: string
  description: string
}[] = [
  {
    id: 'rosin',
    label: 'Rosin',
    swatch: 'oklch(72% 0.16 330)',
    description: 'Vivid rosin pink',
  },
  {
    id: 'dusty',
    label: 'Dusty',
    swatch: 'oklch(58% 0.11 330)',
    description: 'Muted dusty rose',
  },
  {
    id: 'brick',
    label: 'Brick',
    swatch: 'oklch(55% 0.13 35)',
    description: 'Warm terracotta',
  },
]

export function isAccentId(value: string | null): value is AccentId {
  return ACCENT_IDS.includes(value as AccentId)
}
