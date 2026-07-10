import { useEffect, useState } from 'react'
import { OnieMark } from '#/components/OnieMark'

const MINIMUM_DURATION = 1100
const FALLBACK_DURATION = 3200
const EXIT_DURATION = 760

export function OnieLoader() {
  const [progress, setProgress] = useState(0)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const startedAt = performance.now()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let target = 88
    let animationFrame = 0
    let finishTimer = 0
    let exitTimer = 0
    let fallbackTimer = 0
    let finished = false

    document.body.dataset.loaderActive = 'true'

    const removeLoader = () => {
      document.body.removeAttribute('data-loader-active')
      setIsVisible(false)
    }

    if (reducedMotion.matches) {
      removeLoader()
      return
    }

    const animateProgress = () => {
      setProgress((current) => {
        const next = current + (target - current) * 0.08
        return Math.abs(target - next) < 0.1 ? target : next
      })
      animationFrame = window.requestAnimationFrame(animateProgress)
    }

    const leave = () => {
      if (finished) return
      finished = true
      target = 100
      setProgress(100)
      finishTimer = window.setTimeout(() => {
        setIsLeaving(true)
        document.body.removeAttribute('data-loader-active')
        exitTimer = window.setTimeout(removeLoader, EXIT_DURATION)
      }, Math.max(0, MINIMUM_DURATION - (performance.now() - startedAt)))
    }

    const onReady = () => {
      void Promise.race([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise<void>((resolve) => window.setTimeout(resolve, 700)),
      ]).then(leave)
    }

    animationFrame = window.requestAnimationFrame(animateProgress)
    fallbackTimer = window.setTimeout(leave, FALLBACK_DURATION)

    if (document.readyState === 'complete') {
      onReady()
    } else {
      window.addEventListener('load', onReady, { once: true })
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.clearTimeout(finishTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(fallbackTimer)
      window.removeEventListener('load', onReady)
      document.body.removeAttribute('data-loader-active')
    }
  }, [])

  if (!isVisible) return null

  const roundedProgress = Math.round(progress)

  return (
    <div
      className={`onie-loader${isLeaving ? ' is-leaving' : ''}`}
      aria-label="Loading Onie"
      role="status"
    >
      <div className="onie-loader__grid" aria-hidden="true" />

      <div className="onie-loader__inner">
        <header className="onie-loader__masthead">
          <OnieMark variant="toc" as="span" />
          <span>Public index / 2026</span>
          <span aria-hidden="true">{String(roundedProgress).padStart(2, '0')}</span>
        </header>

        <div className="onie-loader__content">
          <span className="onie-loader__index">00</span>
          <div className="onie-loader__statement">
            <span className="onie-loader__eyebrow">Preparing the field</span>
            <h1>
              Loading the <em>useful.</em>
            </h1>
            <p>Agent workflows from people doing the work.</p>
          </div>
        </div>

        <div
          className="onie-loader__progress"
          role="progressbar"
          aria-label="Loading Onie"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedProgress}
          style={{ '--loader-progress': `${progress}%` } as React.CSSProperties}
        >
          <span className="onie-loader__progress-fill" />
          <i className="onie-loader__progress-bead" />
        </div>

        <div className="onie-loader__bottom">
          <span>Reading prompts, skills, and setups</span>
          <span>Onie / workflows by field</span>
        </div>
      </div>
    </div>
  )
}
