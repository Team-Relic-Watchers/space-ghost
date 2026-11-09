import { lazy, Suspense, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../../components/ui/LanguageToggle'
import { useGameStore } from '../../../game/store'
import { ROUTES } from '../../../app/routes'
import { MissionInfo } from './MissionInfo'
import { useIsNarrow } from './useIsNarrow'
import './explorer.css'

/**
 * The 3D inspection lab is code-split so initial application screens never pay
 * for Three.js / R3F.
 */
const InspectLab = lazy(() =>
  import('../inspect/InspectLab').then((m) => ({ default: m.InspectLab })),
)

/** Which half of the screen is showing on a phone. Desktop ignores this. */
export type ExplorerView = 'model' | 'info'

/** Below this width the two columns would be too cramped, so one view shows. */
export const NARROW_BREAKPOINT_PX = 900

/**
 * Mission 1, integrated: the Ranger 7 3D spacecraft explorer and the educational
 * experience are one screen.
 *
 * - Desktop: the 3D spacecraft inspection on the left, the mission info on the right.
 * - Mobile: one view at a time with a two-option bar fixed at the bottom.
 *
 * Both panels stay mounted at every width. Switching views only changes which
 * one is visible and which one the reader can reach (hidden content is `inert`),
 * so the camera keeps its angle and the info keeps its section and scroll.
 */
export function Ranger7Explorer() {
  const { t } = useTranslation()
  const hasLaunched = useGameStore((s) => s.hasLaunched)
  const narrow = useIsNarrow(NARROW_BREAKPOINT_PX)
  const [view, setView] = useState<ExplorerView>('model')

  if (!hasLaunched) return <Navigate to={ROUTES.missionControl} replace />

  const modelActive = !narrow || view === 'model'
  const infoActive = !narrow || view === 'info'

  return (
    <div className="explorer" data-layout={narrow ? 'single' : 'split'} data-view={view}>
      <div className="explorer__model" data-testid="explorer-model" inert={!modelActive}>
        <Suspense fallback={null}>
          <InspectLab active={modelActive} />
        </Suspense>
      </div>

      <div className="explorer__info" data-testid="explorer-info" inert={!infoActive}>
        <MissionInfo />
      </div>

      <div className="ranger7__language">
        <LanguageToggle />
      </div>

      <nav className="explorer__tabs" aria-label={t('ranger7.explorer.title')}>
        <button
          type="button"
          className="explorer__tab"
          data-active={view === 'model'}
          aria-pressed={view === 'model'}
          onClick={() => setView('model')}
        >
          <Box size={20} aria-hidden="true" />
          <span>{t('ranger7.explorer.model')}</span>
        </button>
        <button
          type="button"
          className="explorer__tab"
          data-active={view === 'info'}
          aria-pressed={view === 'info'}
          onClick={() => setView('info')}
        >
          <Info size={20} aria-hidden="true" />
          <span>{t('ranger7.explorer.info')}</span>
        </button>
      </nav>
    </div>
  )
}
