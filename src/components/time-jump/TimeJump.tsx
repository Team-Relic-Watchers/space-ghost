import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JUMP_VIDEO_SRC, nextSeekTime } from './jumpClip'
import './time-jump.css'

/** The skip control appears after a beat so the jump can establish itself. */
const SKIP_DELAY_MS = 1500

/** Pandastein rides along on every time jump, looping like a gif. */
const PANDA_SRC = '/images/panda-ship.png'

interface TimeJumpProps {
  /** Takes over the screen once true; the clip is preloaded while false. */
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
 * per-ghost jumps on the campaign map. It stays mounted (with
 * `preload="auto"`) so the clip downloads while the page plays, and takes over
 * the screen once `active` becomes true. Every path — the video ending, the
 * skip control, Escape, a click on the video, or playback failing — hands
 * back to `onDone` exactly once.
 *
 * The clip plays its opening seconds, then cuts to its closing seconds (see
 * `nextSeekTime`). Pandastein loops over it like a gif, and the optional
 * year/name/destination lines appear above him.
 */
export function TimeJump({ active, onDone, year, title, info }: TimeJumpProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showSkip, setShowSkip] = useState(false)
  const doneRef = useRef(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    videoRef.current?.pause()
    onDoneRef.current()
  }, [])

  // Begin the jump as soon as the overlay activates.
  useEffect(() => {
    const video = videoRef.current
    if (!active || !video) return

    doneRef.current = false
    setShowSkip(false)
    video.currentTime = 0
    const skipTimer = window.setTimeout(() => setShowSkip(true), SKIP_DELAY_MS)

    // Play with the jump's own sound. If the browser refuses (autoplay
    // policy), retry once muted; if that fails too, hand back immediately so
    // the journey is never blocked by a video.
    const attempt = video.play()
    attempt?.catch?.(() => {
      video.muted = true
      video.play()?.catch?.(() => finish())
    })

    return () => window.clearTimeout(skipTimer)
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

  const handleTimeUpdate = () => {
    if (!active) return
    const video = videoRef.current
    if (!video) return
    const seekTo = nextSeekTime(video.currentTime, video.duration)
    if (seekTo !== null) video.currentTime = seekTo
  }

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
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: active ? 'auto' : 'none' }}
    >
      <video
        ref={videoRef}
        src={JUMP_VIDEO_SRC}
        preload="auto"
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        onClick={active ? finish : undefined}
        onEnded={active ? finish : undefined}
        onError={active ? finish : undefined}
        onTimeUpdate={active ? handleTimeUpdate : undefined}
      />

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
