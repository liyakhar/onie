import ThemeToggle from '#/components/ThemeToggle'
import { AccentPicker } from '#/components/AccentPicker'

export default function ThemeControls() {
  return (
    <div className="theme-controls">
      <ThemeToggle />
      <AccentPicker />
    </div>
  )
}
