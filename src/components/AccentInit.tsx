import { useEffect } from 'react'
import { ACCENT_PRESETS, applyAccentPreset, getStoredAccentId } from '#/lib/accent-presets'

export default function AccentInit() {
  useEffect(() => {
    const storedId = getStoredAccentId()
    const preset = ACCENT_PRESETS.find((item) => item.id === storedId) ?? ACCENT_PRESETS[0]
    applyAccentPreset(preset)
  }, [])

  return null
}
