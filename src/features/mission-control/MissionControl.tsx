import { motion, useReducedMotion } from 'framer-motion'
import { Map, Rocket } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
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
import { JumpVideo } from './JumpVideo'
import './mission-control.css'

const LAUNCH_MS = 1200
const LAUNCH_REDUCED_MS = 200

export function MissionControl() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((s) => s.language)
  const launch = useGameStore((s) => s.launch)
  const reduceMotion = useReducedMotion()
  const [launching, setLaunching] = useState(false)
  const [jumping, setJumping] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const beginAdventure = () => {
    if (launching) return
    setLaunching(true)
    launch()
    timer.current = window.setTimeout(
      () => {
        // Reduced motion skips the jump video: a short fade, then warp.
        // Otherwise the fullscreen time-travel jump takes over and hands
        // off to the warp screen when it finishes (or is skipped).
        if (reduceMotion) navigate(ROUTES.warp)
        else setJumping(true)
      },
      reduceMotion ? LAUNCH_REDUCED_MS : LAUNCH_MS,
    )
  }

  return (
    <>
      <main className="screen mission" data-launching={launching}>
        <StationBackdrop />

        <header className="mission__top">
          <Logo />
          <LanguageToggle />
        </header>

        <section className="mission__stage">
          <motion.div
            className="mission__machine"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              launching
                ? { opacity: 1, scale: reduceMotion ? 1 : 1.35 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ type: 'spring', stiffness: 120, damping: 14, delay: launching ? 0 : 0.15 }}
            role="img"
            aria-label={t('missionControl.timeMachineLabel')}
          >
            <TimeMachine charging={launching} />
          </motion.div>

          <motion.div
            className="mission__panda"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: launching ? 0.0 : 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 110, damping: 15, delay: launching ? 0 : 0.4 }}
          >
            <motion.div
              className="mission__bubble"
              initial={{ opacity: 0, scale: 0.7, y: 12 }}
              animate={{ opacity: launching ? 0 : 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: launching ? 0 : 0.9 }}
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

        <div className="mission__flash" aria-hidden="true" />
      </main>

      {/* The jump is a viewport-sized overlay, so it sits outside the screen
          layout: `.mission > :not(.backdrop)` would otherwise pin it into the
          grid instead of letting it cover the whole page. */}
      <JumpVideo active={jumping} onDone={() => navigate(ROUTES.warp)} />
    </>
  )
}
