import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Palette } from 'lucide-react'
import { ACCENT_PRESETS, DEFAULT_ACCENT } from '#/lib/accent-presets'
import { getStoredAccent, setAccent, subscribeAccent } from '#/lib/theme'

function getAccentSnapshot() {
  return getStoredAccent()
}

export function AccentPicker() {
  const accent = useSyncExternalStore(
    subscribeAccent,
    getAccentSnapshot,
    () => DEFAULT_ACCENT,
  )
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const active = ACCENT_PRESETS.find((item) => item.id === accent)

  return (
    <div className="light-theme-picker" ref={rootRef}>
      <button
        type="button"
        className="light-theme-picker__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Choose accent color"
        title={active ? `Accent: ${active.label}` : 'Choose accent color'}
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="light-theme-picker__current"
          style={{ background: active?.swatch }}
          aria-hidden="true"
        />
        <Palette className="light-theme-picker__icon" aria-hidden="true" />
      </button>

      {open && (
        <div className="light-theme-picker__menu" role="menu" aria-label="Accent colors">
          {ACCENT_PRESETS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={accent === item.id}
              className="light-theme-picker__option"
              data-active={accent === item.id}
              onClick={() => {
                setAccent(item.id)
                setOpen(false)
              }}
            >
              <span
                className="light-theme-picker__swatch"
                style={{ background: item.swatch }}
                aria-hidden="true"
              />
              <span className="light-theme-picker__copy">
                <span className="light-theme-picker__label">{item.label}</span>
                <span className="light-theme-picker__desc">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
