export type AccentPresetId =
  | 'press'
  | 'claude'
  | 'dust'
  | 'chartreuse'
  | 'lime'
  | 'rosin'

export type AccentPreset = {
  id: AccentPresetId
  label: string
  swatch: string
  accent: string
  accent2: string
  accentInk: string
  focus: string
  proofAccent: string
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'press',
    label: 'Press',
    swatch: 'oklch(62% 0.22 25)',
    accent: 'oklch(62% 0.22 25)',
    accent2: 'oklch(62% 0.23 18)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(68% 0.21 25)',
    proofAccent: 'oklch(48% 0.20 25)',
  },
  {
    id: 'claude',
    label: 'Claude',
    swatch: 'oklch(66% 0.13 42)',
    accent: 'oklch(66% 0.13 42)',
    accent2: 'oklch(66% 0.14 36)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(72% 0.12 42)',
    proofAccent: 'oklch(50% 0.11 42)',
  },
  {
    id: 'dust',
    label: 'Dust',
    swatch: 'oklch(66% 0.07 245)',
    accent: 'oklch(66% 0.07 245)',
    accent2: 'oklch(66% 0.08 238)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(72% 0.08 245)',
    proofAccent: 'oklch(46% 0.06 245)',
  },
  {
    id: 'chartreuse',
    label: 'Chartreuse',
    swatch: 'oklch(87% 0.23 102)',
    accent: 'oklch(87% 0.23 102)',
    accent2: 'oklch(87% 0.24 96)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(91% 0.21 102)',
    proofAccent: 'oklch(54% 0.17 102)',
  },
  {
    id: 'lime',
    label: 'Lime',
    swatch: 'oklch(86% 0.26 118)',
    accent: 'oklch(86% 0.26 118)',
    accent2: 'oklch(86% 0.27 112)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(90% 0.24 118)',
    proofAccent: 'oklch(52% 0.19 118)',
  },
  {
    id: 'rosin',
    label: 'Rosin',
    swatch: 'oklch(72% 0.16 330)',
    accent: 'oklch(72% 0.16 330)',
    accent2: 'oklch(72% 0.17 322)',
    accentInk: 'oklch(17% 0.024 32)',
    focus: 'oklch(78% 0.15 330)',
    proofAccent: 'oklch(48% 0.14 330)',
  },
]

const STORAGE_KEY = 'onie-accent'

export function getStoredAccentId(): AccentPresetId {
  if (typeof window === 'undefined') return 'press'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (ACCENT_PRESETS.some((preset) => preset.id === stored)) {
    return stored as AccentPresetId
  }
  return 'press'
}

export function applyAccentPreset(preset: AccentPreset) {
  const root = document.documentElement
  root.style.setProperty('--color-accent', preset.accent)
  root.style.setProperty('--color-accent-2', preset.accent2)
  root.style.setProperty('--color-accent-ink', preset.accentInk)
  root.style.setProperty('--color-focus', preset.focus)
  root.style.setProperty('--proof-accent', preset.proofAccent)
  root.dataset.accent = preset.id
}

export function setAccentPreset(id: AccentPresetId) {
  const preset = ACCENT_PRESETS.find((item) => item.id === id)
  if (!preset) return
  applyAccentPreset(preset)
  window.localStorage.setItem(STORAGE_KEY, id)
}
