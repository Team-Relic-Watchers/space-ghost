import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../components/ui/Logo'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { StationBackdrop } from '../../components/backdrop/StationBackdrop'
import { formatNumber } from '../../i18n'
import { useGameStore } from '../../game/store'
import { machines } from '../../content/ranger7/machines'
import { AskPanda } from './AskPanda'
import { GhostDetail } from './GhostDetail'
import { GhostNode } from './GhostNode'
import { ScrollArrows } from './ScrollArrows'
import { buildDots, getGhostRingSize, getLayout, MIN_STAGE_WIDTH } from './mapLayout'
import './ghosts-map.css'

/** How far one arrow press moves the journey, as a share of the visible height. */
const SCROLL_STEP = 0.8

/**
 * The campaign map: all 17 machines scattered across one journey, each one
 * clickable.
 *
 * The map is the home page for students who want to know what the ghosts are
 * before they fly with one of them. Every ghost carries its number, its name,
 * its year and where it went; clicking opens that machine's detail card.
 *
 * The field is taller than the screen, so the student scrolls down through it.
 * The dotted path links the ghosts in launch order. Pandastein waits at the
 * top and asks the student to come along; he stays put while the journey
 * scrolls under him.
 */
export function GhostsMap() {
  const { t } = useTranslation()
  const language = useGameStore((s) => s.language)
  const [openSequence, setOpenSequence] = useState<number | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [stageWidth, setStageWidth] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  const open = machines.find((m) => m.sequence === openSequence) ?? null

  /** The field reflows (three ghosts per row, two on phones) as width changes. */
  const layout = useMemo(() => getLayout(stageWidth), [stageWidth])

  /**
   * The same ring size feeds the CSS and the flight trail, so a dot chain can
   * never start short of a planet or bury itself under one.
   */
  const ringSize = getGhostRingSize(stageWidth)
  const stageStyle = {
    height: layout.height,
    minWidth: MIN_STAGE_WIDTH,
    '--ghost-size': `${ringSize}px`,
  } as CSSProperties

  /** Keeps the arrow states in step with the scroll position. */
  const syncArrows = useCallback(() => {
    const el = scroller.current
    if (!el) return
    setAtStart(el.scrollTop <= 4)
    setAtEnd(el.scrollTop >= el.scrollHeight - el.clientHeight - 4)
  }, [])

  /** The path is drawn in real pixels, so it needs the measured stage width. */
  const syncWidth = useCallback(() => {
    const el = stage.current
    if (!el) return
    setStageWidth(el.clientWidth)
  }, [])

  useEffect(() => {
    syncArrows()
    const el = scroller.current
    if (!el) return
    el.addEventListener('scroll', syncArrows, { passive: true })
    window.addEventListener('resize', syncArrows)
    return () => {
      el.removeEventListener('scroll', syncArrows)
      window.removeEventListener('resize', syncArrows)
    }
  }, [syncArrows])

  // The stage is measured after layout, so the path is right on the first paint.
  useLayoutEffect(syncWidth, [syncWidth])

  /**
   * Follow the stage's real width, not the window's: a scrollbar appearing or
   * the side gutter changing must move the dots with the planets, or the trail
   * drifts off the rings.
   */
  useEffect(() => {
    const el = stage.current
    if (!el) return
    // jsdom (and a few old browsers) do not ship ResizeObserver.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', syncWidth)
      return () => window.removeEventListener('resize', syncWidth)
    }
    const observer = new ResizeObserver(syncWidth)
    observer.observe(el)
    return () => observer.disconnect()
  }, [syncWidth])

  const scrollBy = (direction: -1 | 1) => {
    const el = scroller.current
    if (!el) return
    el.scrollBy({ top: direction * el.clientHeight * SCROLL_STEP, behavior: 'smooth' })
  }

  return (
    <main className="ghosts-map screen">
      <StationBackdrop />

      <h2 className="ghosts-map__title">{t('ghostsMap.title')}</h2>

      <header className="ghosts-map__top">
        <Logo />
        <p className="ghosts-map__welcome">
          <span className="ghosts-map__welcome-text">{t('ghostsMap.welcome')}</span>
        </p>
        <LanguageToggle />
      </header>

      <div className="ghosts-map__canvas" ref={scroller}>
        <div className="ghosts-map__stage" ref={stage} style={stageStyle}>
          {/* The flight path: candy dots through the ghosts in launch order. */}
          <svg
            className="ghosts-map__path"
            width={stageWidth || undefined}
            height={layout.height}
            viewBox={`0 0 ${stageWidth || 100} ${layout.height}`}
            aria-hidden="true"
          >
            {buildDots(stageWidth, layout).map((dot, i) => (
              <circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={dot.r}
                fill={dot.colour}
                opacity={dot.glow ? 0.18 : 0.95}
              />
            ))}
          </svg>

          {layout.placements.map((placement) => (
            <GhostNode
              key={placement.machine.id}
              placement={placement}
              active={openSequence === placement.machine.sequence}
              onOpen={setOpenSequence}
            />
          ))}
        </div>
      </div>

      {/* Pandastein stays put at the side of the screen while the journey scrolls. */}
      <div className="ghosts-map__panda">
        <AskPanda question={t('ghostsMap.askQuestion')} />
      </div>

      <footer className="ghosts-map__foot">
        <span className="ghosts-map__hint">{t('ghostsMap.hint')}</span>
        <ScrollArrows
          onScrollBy={scrollBy}
          canScrollUp={!atStart}
          canScrollDown={!atEnd}
        />
        <span className="ghosts-map__count">
          {t('ghostsMap.count', { total: formatNumber(machines.length, language) })}
        </span>
      </footer>

      <GhostDetail machine={open} onClose={() => setOpenSequence(null)} />
    </main>
  )
}
