import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'
import {
  getStoredTheme,
  getSystemTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from '#/lib/theme'

function getThemeSnapshot(): Theme {
  return getStoredTheme() ?? getSystemTheme()
}

function getServerThemeSnapshot(): Theme {
  return 'dark'
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  )
  const isDark = theme === 'dark'

  function toggleTheme() {
    setTheme(isDark ? 'light' : 'dark')
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
