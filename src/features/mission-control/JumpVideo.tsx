import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JUMP_VIDEO_SRC, nextSeekTime } from './jumpClip'

/** The skip control appears after a beat so the jump can establish itself. */
const SKIP_DELAY_MS = 1500

/**
 * Fullscreen time-travel jump. It stays mounted on Mission Control (with
 * `preload="auto"`) so the clip downloads while the intro plays, and takes
 * over the screen once `active` becomes true. Every path — the video ending,
 * the skip control, Escape, a click on the video, or playback failing — hands
 * back to `onDone` exactly once.
 */
export function JumpVideo({ active, onDone }: { active: boolean; onDone: () => void }) {
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

  return (
    <motion.div
      className="jump"
      data-testid="jump-video"
      data-active={active}
      aria-hidden={!active}
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
      {active && showSkip && (
        <button type="button" className="pill-button jump__skip" onClick={finish}>
          {t('common.skip')}
        </button>
      )}
    </motion.div>
  )
}
