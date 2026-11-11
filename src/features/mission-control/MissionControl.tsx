import { motion } from 'framer-motion'
import { Map, Rocket } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { StationBackdrop } from '../../components/backdrop/StationBackdrop'
import { Pandastein } from '../../components/mascot/Pandastein'
import { TimeMachine } from '../../components/time-machine/TimeMachine'
import { BigButton } from '../../components/ui/BigButton'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { Logo } from '../../components/ui/Logo'
import { SpeechBubble } from '../../components/ui/SpeechBubble'
import { journey } from '../../content/journey'
import { useGameStore } from '../../game/store'
import { formatYear } from '../../i18n'
import './mission-control.css'

export function MissionControl() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((s) => s.language)
  const launch = useGameStore((s) => s.launch)

  const beginAdventure = () => {
    launch()
    // The adventure begins on the campaign map at once: no warm-up and
    // no jump video in between.
    navigate(ROUTES.ghostsMap)
  }

  return (
    <main className="screen mission">
      <StationBackdrop />

      <header className="mission__top">
        <Logo />
        <LanguageToggle />
      </header>

      <section className="mission__stage">
        <motion.div
          className="mission__machine"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.15 }}
          role="img"
          aria-label={t('missionControl.timeMachineLabel')}
        >
          <TimeMachine />
        </motion.div>

        <motion.div
          className="mission__panda"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 110, damping: 15, delay: 0.4 }}
        >
          <motion.div
            className="mission__bubble"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.9 }}
          >
            <SpeechBubble>
              <p>{t('missionControl.greeting')}</p>
              <p>
                {t('missionControl.prompt', {
                  year: formatYear(journey.destinationYear, language),
                })}
              </p>
            </SpeechBubble>
          </motion.div>
          <Pandastein className="mission__panda-art" />
        </motion.div>
      </section>

      <footer className="mission__dock">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.2 }}
          className="mission__dock-row"
        >
          <BigButton
            onClick={beginAdventure}
            icon={<Rocket size={30} strokeWidth={2.75} aria-hidden="true" />}
          >
            {t('missionControl.start')}
          </BigButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.35 }}
          className="mission__dock-row"
        >
          <button
            type="button"
            className="pill-button mission__map-link"
            onClick={() => navigate(ROUTES.ghostsMap)}
          >
            <Map size={20} strokeWidth={2.75} aria-hidden="true" />
            {t('missionControl.seeGhosts')}
          </button>
        </motion.div>
      </footer>
    </main>
  )
}
