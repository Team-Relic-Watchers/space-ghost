import { motion } from 'framer-motion'
import { ArrowLeft, Puzzle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { Starfield } from '../../components/backdrop/Starfield'
import { Logo } from '../../components/ui/Logo'
import { LanguageSwitch } from '../../components/ui/LanguageSwitch'
import { machines, pick } from '../../content/ranger7/machines'
import { ghostPhotos } from '../../content/ranger7/photos'
import { useGameStore } from '../../game/store'
import { formatDigits, formatYear } from '../../i18n'
import { GhostPuzzle } from '../ghosts-map/GhostPuzzle'
import './puzzle-screen.css'

/**
 * The puzzle corner of the app: pick any of the 17 machines and rebuild its
 * cartoon, one piece at a time.
 *
 * The jigsaw itself lives in the ghosts-map feature and is shared with the
 * story page; this screen only chooses which machine it works on.
 */
export function PuzzleScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((s) => s.language)
  const [sequence, setSequence] = useState(1)

  const machine = machines.find((m) => m.sequence === sequence) ?? machines[0]
  const photos = ghostPhotos[machine.slug]
  const name = pick(machine.name, language)

  return (
    <main className="puzzle-screen screen">
      <div className="puzzle-screen__sky" aria-hidden="true">
        <Starfield count={70} seed={31} />
      </div>

      <header className="puzzle-screen__top">
        <button
          type="button"
          className="puzzle-screen__back"
          onClick={() => navigate(ROUTES.home)}
        >
          <ArrowLeft size={20} strokeWidth={2.75} aria-hidden="true" />
          <span>{t('puzzleScreen.back')}</span>
        </button>

        <div className="puzzle-screen__brand">
          <Logo as="div" decorative />
        </div>

        <LanguageSwitch />
      </header>

      <section className="puzzle-screen__body">
        <header className="puzzle-screen__head">
          <span className="puzzle-screen__eyebrow">
            <Puzzle size={16} aria-hidden="true" />
            {t('puzzleScreen.eyebrow')}
          </span>
          <h1 className="puzzle-screen__title">{t('puzzleScreen.title')}</h1>
          <p className="puzzle-screen__lede">{t('puzzleScreen.lede')}</p>
        </header>

        {/* The machine picker: all 17 ghosts, one tap each. */}
        <div
          className="puzzle-screen__picker"
          role="group"
          aria-label={t('puzzleScreen.picker')}
        >
          {machines.map((option) => {
            const active = option.sequence === machine.sequence
            return (
              <button
                key={option.id}
                type="button"
                className="puzzle-screen__pick"
                data-active={active}
                aria-pressed={active}
                onClick={() => setSequence(option.sequence)}
              >
                <img
                  src={ghostPhotos[option.slug].cartoon.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <span className="puzzle-screen__pick-label">
                  <span className="puzzle-screen__pick-name">
                    {pick(option.name, language)}
                  </span>
                  <span className="puzzle-screen__pick-year">
                    {formatYear(option.yearNumber, language)}
                  </span>
                </span>
                <span className="puzzle-screen__pick-number" aria-hidden="true">
                  {formatDigits(option.sequence)}
                </span>
              </button>
            )
          })}
        </div>

        <motion.div
          key={machine.id}
          className="puzzle-screen__game"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        >
          <GhostPuzzle name={name} image={photos.cartoon} />
        </motion.div>
      </section>
    </main>
  )
}
