import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WarpField } from './WarpField'
import { playWarpSound } from './warpSound'
import { JUMP_DURATION_MS, REDUCED_JUMP_DURATION_MS, SKIP_DELAY_MS } from './jumpTiming'
import './time-jump.css'

/** Pandastein rides along on every time jump, looping like a gif. */
const PANDA_SRC = '/images/panda-ship.webp'

interface TimeJumpProps {
  /** Takes over the screen once true. */
  active: boolean
  /** Called exactly once when the jump ends, is skipped, or fails. */
  onDone: () => void
  /** Big year reveal, e.g. "1966" — shown when jumping to a ghost. */
  year?: string
  /** Who we are jumping to, e.g. "Surveyor 1". */
  title?: string
  /** One line about the destination, e.g. "went to the Moon". */
  info?: string
}

/**
 * Fullscreen time-travel jump, shared by the Mission Control launch and the
 * per-ghost jumps on the campaign map.
 *
 * The jump is drawn and scored in the browser: a canvas paints the warp
 * tunnel, Web Audio plays the whoosh, and Pandastein rides the middle of it
 * in his ship. Nothing is downloaded, so the jump starts the moment the
 * explorer taps a ghost and never stalls on a slow phone.
 *
 * Every path — the flight finishing, the skip control, Escape, a tap on the
 * screen, or a browser without audio — hands back to `onDone` exactly once.
 */
export function TimeJump({ active, onDone, year, title, info }: TimeJumpProps) {
  const { t } = useTranslation()
  const [showSkip, setShowSkip] = useState(false)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)
  const stopSoundRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    stopSoundRef.current?.()
    stopSoundRef.current = null
    onDoneRef.current()
  }, [])

  // Begin the jump as soon as the overlay activates.
  useEffect(() => {
    if (!active) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const duration = reduceMotion ? REDUCED_JUMP_DURATION_MS : JUMP_DURATION_MS

    doneRef.current = false

    const skipTimer = window.setTimeout(() => setShowSkip(true), SKIP_DELAY_MS)
    const doneTimer = window.setTimeout(() => finish(), duration)
    stopSoundRef.current = playWarpSound(duration)

    return () => {
      window.clearTimeout(skipTimer)
      window.clearTimeout(doneTimer)
      stopSoundRef.current?.()
      stopSoundRef.current = null
    }
  }, [active, finish])

  // Escape skips the jump as well.
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, finish])

  const hasText = Boolean(year || title || info)

  return (
    <motion.div
      className="jump"
      data-testid="time-jump"
      data-active={active}
      aria-hidden={!active}
      aria-label={active ? (year ? t('common.jumpToYear', { year }) : t('common.jumpLabel')) : undefined}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: active ? 0.55 : 0.4, ease: 'easeInOut' }}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      onClick={active ? finish : undefined}
    >
      {/* The warp tunnel: stars painted on a canvas, so the jump needs no
          video file and cannot stall while it loads. */}
      <WarpField active={active} />

      {/* The light of the gate the ship is flying into. */}
      <div className="jump__gate" aria-hidden="true" />

      {/* Pandastein loops over the jump like a gif. Decorative, so screen
          readers hear the jump through the container's label instead. */}
      {active && (
        <img className="jump__panda" src={PANDA_SRC} alt="" aria-hidden="true" />
      )}

      {active && hasText && (
        <div className="jump__text">
          {year && <span className="jump__year">{year}</span>}
          {title && <span className="jump__title">{title}</span>}
          {info && <span className="jump__info">{info}</span>}
        </div>
      )}

      {active && showSkip && (
        <button type="button" className="pill-button jump__skip" onClick={finish}>
          {t('common.skip')}
        </button>
      )}
    </motion.div>
  )
}
