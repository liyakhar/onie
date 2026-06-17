import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  setTheme,
  type Theme,
} from '#/lib/theme'

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initial = getStoredTheme() ?? getSystemTheme()
    setThemeState(initial)
    applyTheme(initial)
    setReady(true)
  }, [])

  const isDark = theme === 'dark'

  function toggleTheme() {
    const next: Theme = isDark ? 'light' : 'dark'
    setThemeState(next)
    setTheme(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="theme-toggle"
      onClick={toggleTheme}
      disabled={!ready}
    >
      <Sun
        className="theme-toggle__icon"
        data-active={!isDark}
        aria-hidden="true"
      />
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb" />
      </span>
      <Moon
        className="theme-toggle__icon"
        data-active={isDark}
        aria-hidden="true"
      />
    </button>
  )
}
