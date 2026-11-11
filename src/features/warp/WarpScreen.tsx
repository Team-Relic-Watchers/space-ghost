import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { StationBackdrop } from '../../components/backdrop/StationBackdrop'
import { Pandastein } from '../../components/mascot/Pandastein'
import { BigButton } from '../../components/ui/BigButton'
import { SpeechBubble } from '../../components/ui/SpeechBubble'
import { journey } from '../../content/journey'
import { useGameStore } from '../../game/store'
import { formatYear } from '../../i18n'
import './warp.css'

export function WarpScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((s) => s.language)
  const hasLaunched = useGameStore((s) => s.hasLaunched)

  // Opening /warp directly, without pressing start, goes back to the home page.
  if (!hasLaunched) return <Navigate to={ROUTES.home} replace />

  const beginMission = () => {
    // The whole Ranger 7 journey lives at /ranger-7: the 3D spacecraft on the
    // left, the mission map and its learning stages on the right. Launch state
    // is kept so this action still works if the player returns here.
    navigate(ROUTES.ranger7)
  }

  return (
    <main className="screen warp">
      <StationBackdrop station={false} />
      <div className="warp__tunnel" aria-hidden="true" />

      <motion.div
        className="warp__year"
        initial={{ opacity: 0, scale: 2.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.1 }}
      >
        <span className="warp__year-label">{t('warp.yearLabel')}</span>
        <span className="warp__year-number" data-testid="warp-year">
          {formatYear(journey.destinationYear, language)}
        </span>
      </motion.div>

      <motion.div
        className="warp__panda"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.5 }}
      >
        <SpeechBubble>
          <p>{t('warp.arrived')}</p>
          <p>{t('warp.arrivedLine')}</p>
        </SpeechBubble>
        <Pandastein className="warp__panda-art" />
      </motion.div>

      <div className="warp__dock">
        <BigButton
          onClick={beginMission}
          icon={<Rocket size={28} strokeWidth={2.75} aria-hidden="true" />}
        >
          {t('warp.begin')}
        </BigButton>
      </div>
    </main>
  )
}
