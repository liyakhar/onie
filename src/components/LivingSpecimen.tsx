import { useCallback, useState } from 'react'

type Axis = 'wght' | 'wdth' | 'opsz'

const AXES: { id: Axis; label: string; min: number; max: number; default: number }[] = [
  { id: 'wght', label: 'Weight', min: 200, max: 800, default: 320 },
  { id: 'wdth', label: 'Width', min: 75, max: 100, default: 100 },
  { id: 'opsz', label: 'Optical', min: 12, max: 96, default: 96 },
]

export function LivingSpecimen() {
  const [grabbed, setGrabbed] = useState(false)
  const [values, setValues] = useState<Record<Axis, number>>({
    wght: 320,
    wdth: 100,
    opsz: 96,
  })

  const onAxisChange = useCallback((axis: Axis, value: number) => {
    setGrabbed(true)
    setValues((prev) => ({ ...prev, [axis]: value }))
  }, [])

  return (
    <figure
      className="specimen-live reveal"
      style={{ '--i': 4 } as React.CSSProperties}
      data-grabbed={grabbed ? 'true' : undefined}
      aria-labelledby="live-cap"
    >
      <div className="specimen-live__stage">
        <span
          className="specimen-live__word"
          aria-hidden="true"
          style={{
            fontVariationSettings: `'wght' ${values.wght}, 'wdth' ${values.wdth}, 'opsz' ${values.opsz}`,
          }}
        >
          Building
        </span>
      </div>
      <figcaption className="specimen-live__panel" id="live-cap">
        <div className="axis">
          {AXES.map((axis) => (
            <div key={axis.id} className="axis__row">
              <label className="axis__label" htmlFor={`ax-${axis.id}`}>
                {axis.label}
                <span className="axis__val">{values[axis.id]}</span>
              </label>
              <input
                className="axis__range"
                id={`ax-${axis.id}`}
                type="range"
                min={axis.min}
                max={axis.max}
                value={values[axis.id]}
                step={1}
                aria-describedby="axis-help"
                onChange={(e) => onAxisChange(axis.id, Number(e.target.value))}
              />
            </div>
          ))}
          <p className="axis__help" id="axis-help">
            Pull the axes. The word reads <em>Building</em> by design — that is the
            point of a variable workflow.
          </p>
        </div>
      </figcaption>
    </figure>
  )
}
