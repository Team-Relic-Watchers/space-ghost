import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ScrollArrowsProps {
  onScrollBy: (direction: -1 | 1) => void
  /** True when the journey cannot scroll any further up. */
  canScrollUp: boolean
  /** True when the journey cannot scroll any further down. */
  canScrollDown: boolean
}

/**
 * The scroll controls for the journey. The field is taller than the screen,
 * so the student needs a way to move down through it.
 */
export function ScrollArrows({ onScrollBy, canScrollUp, canScrollDown }: ScrollArrowsProps) {
  const { t } = useTranslation()

  return (
    <div className="ghosts-map__arrows">
      <button
        type="button"
        className="pill-button ghosts-map__arrow"
        onClick={() => onScrollBy(-1)}
        disabled={!canScrollUp}
        aria-label={t('ghostsMap.scrollUp')}
      >
        <ChevronUp size={24} strokeWidth={3} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="pill-button ghosts-map__arrow"
        onClick={() => onScrollBy(1)}
        disabled={!canScrollDown}
        aria-label={t('ghostsMap.scrollDown')}
      >
        <ChevronDown size={24} strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  )
}
