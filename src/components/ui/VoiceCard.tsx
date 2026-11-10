import { Pause, Play, RotateCw } from 'lucide-react'
import './voice-card.css'

interface VoiceCardProps {
  /** Reads the part aloud from the first word. */
  onPlay: () => void
  /** Holds the voice where it is. */
  onPause: () => void
  /** Carries the voice on from where it stopped. */
  onResume: () => void
  /** True while the voice is talking. */
  talking: boolean
  /** True while the reader holds the voice. */
  held: boolean
  /** The name of the card itself. */
  groupLabel: string
  /** The name of the play button. */
  playLabel: string
  /** The name of the pause button. */
  pauseLabel: string
  /** The name of the resume button. */
  resumeLabel: string
  /** The class of the card, so every screen can style it its own way. */
  className?: string
}

/**
 * The little card of buttons that sits in the corner of Pandastein's card:
 * play, pause and resume.
 *
 * The reader can start the story of a part, hold it for a moment, and carry
 * it on without leaving the page.
 */
export function VoiceCard({
  onPlay,
  onPause,
  onResume,
  talking,
  held,
  groupLabel,
  playLabel,
  pauseLabel,
  resumeLabel,
  className,
}: VoiceCardProps) {
  return (
    <div
      className={className ? `voice-card ${className}` : 'voice-card'}
      role="group"
      aria-label={groupLabel}
      data-state={held ? 'held' : talking ? 'talking' : 'idle'}
    >
      <button
        type="button"
        onClick={onPlay}
        aria-label={playLabel}
        title={playLabel}
        data-active={talking && !held ? 'true' : 'false'}
      >
        <Play size={15} fill="currentColor" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onPause}
        disabled={!talking || held}
        aria-label={pauseLabel}
        title={pauseLabel}
      >
        <Pause size={15} fill="currentColor" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onResume}
        disabled={!held}
        aria-label={resumeLabel}
        title={resumeLabel}
      >
        <RotateCw size={15} aria-hidden="true" />
      </button>
    </div>
  )
}
