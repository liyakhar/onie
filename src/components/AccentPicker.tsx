import { useEffect, useState } from 'react'
import {
  ACCENT_PRESETS,
  applyAccentPreset,
  getStoredAccentId,
  setAccentPreset,
  type AccentPresetId,
} from '#/lib/accent-presets'

export default function AccentPicker() {
  const [activeId, setActiveId] = useState<AccentPresetId>('press')

  useEffect(() => {
    const storedId = getStoredAccentId()
    const preset = ACCENT_PRESETS.find((item) => item.id === storedId) ?? ACCENT_PRESETS[0]
    setActiveId(storedId)
    applyAccentPreset(preset)
  }, [])

  function selectAccent(id: AccentPresetId) {
    setActiveId(id)
    setAccentPreset(id)
  }

  return (
    <div className="accent-picker" aria-label="Accent color preview">
      <p className="accent-picker__label">Accent</p>
      <ul className="accent-picker__list">
        {ACCENT_PRESETS.map((preset) => {
          const isActive = preset.id === activeId
          return (
            <li key={preset.id}>
              <button
                type="button"
                className="accent-picker__option"
                data-active={isActive || undefined}
                aria-pressed={isActive}
                onClick={() => selectAccent(preset.id)}
              >
                <span
                  className="accent-picker__swatch"
                  style={{ background: preset.swatch }}
                  aria-hidden
                />
                <span className="accent-picker__name">{preset.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
