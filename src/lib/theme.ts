import { DEFAULT_ACCENT, isAccentId, type AccentId } from '#/lib/accent-presets'

export type Theme = 'light' | 'dark'

const themeListeners = new Set<() => void>()
const accentListeners = new Set<() => void>()

export function subscribeTheme(listener: () => void) {
  themeListeners.add(listener)
  return () => {
    themeListeners.delete(listener)
  }
}

export function subscribeAccent(listener: () => void) {
  accentListeners.add(listener)
  return () => {
    accentListeners.delete(listener)
  }
}

function notifyThemeChange() {
  themeListeners.forEach((listener) => listener())
}

function notifyAccentChange() {
  accentListeners.forEach((listener) => listener())
}

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem('theme')
  return stored === 'light' || stored === 'dark' ? stored : null
}

export function getStoredAccent(): AccentId {
  if (typeof window === 'undefined') return DEFAULT_ACCENT
  const stored =
    window.localStorage.getItem('accent') ??
    window.localStorage.getItem('light-accent') ??
    window.localStorage.getItem('light-theme')
  return isAccentId(stored) ? stored : DEFAULT_ACCENT
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function resolveTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyAccent(accent: AccentId) {
  document.documentElement.setAttribute('data-accent', accent)
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(theme)
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
  applyAccent(getStoredAccent())
}

export function setTheme(theme: Theme) {
  applyTheme(theme)
  window.localStorage.setItem('theme', theme)
  notifyThemeChange()
}

export function setAccent(accent: AccentId) {
  window.localStorage.setItem('accent', accent)
  applyAccent(accent)
  notifyAccentChange()
}

export const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='light'?'light':t==='dark'?'dark':(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(d);document.documentElement.setAttribute('data-theme',d);document.documentElement.style.colorScheme=d;var v=localStorage.getItem('accent')||localStorage.getItem('light-accent')||localStorage.getItem('light-theme');var ids=['rosin','dusty','brick'];document.documentElement.setAttribute('data-accent',ids.indexOf(v)>-1?v:'rosin');}catch(e){}})();`
