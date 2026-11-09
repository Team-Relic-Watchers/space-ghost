import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pandastein } from '../../../components/mascot/Pandastein'
import { SpeechBubble } from '../../../components/ui/SpeechBubble'
import { StationBackdrop } from '../../../components/backdrop/StationBackdrop'
import { formatDigits } from '../../../i18n'
import './narrative.css'

type StoryStep = 'what' | 'goal' | 'date' | 'why' | 'next'
const STEPS: StoryStep[] = ['what', 'goal', 'date', 'why', 'next']

interface StoryIntroProps {
  onExplore: () => void
}

/** Part 2.1: five illustrated story beats (max ~30 words each), then the mission hub. */
export function StoryIntro({ onExplore }: StoryIntroProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const step = STEPS[index]
  const last = index === STEPS.length - 1

  const go = (delta: number) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, index + delta))
    if (next === index) return
    setDirection(delta)
    setIndex(next)
  }

  return (
    <main className="story screen story-frame">
      <StationBackdrop station={false} />

      <header className="story__top">
        <ol className="story__dots" aria-label={t('ranger7.narrative.stepLabel', { current: index + 1, total: STEPS.length })}>
          {STEPS.map((s, i) => (
            <li key={s} data-active={i === index} data-done={i < index} aria-current={i === index ? 'step' : undefined}>
              <span />
            </li>
          ))}
        </ol>
        <span className="story__counter">
          {t('ranger7.narrative.stepLabel', { current: index + 1, total: STEPS.length })}
        </span>
      </header>

      <div className="story__content">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.section
            key={step}
            className="story__panel"
            custom={direction}
            initial={{ opacity: 0, x: direction * 60, rotate: direction * 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: direction * -60, rotate: direction * -1.5 }}
            transition={{ type: 'spring', stiffness: 160, damping: 20 }}
          >
            <span className="story__badge">{t('ranger7.title')} · {formatDigits(1964)}</span>
            <h2>{t(`ranger7.narrative.steps.${step}.title`)}</h2>
            <p>{t(`ranger7.narrative.steps.${step}.body`)}</p>
          </motion.section>
        </AnimatePresence>
      </div>

      <div className="story__panda">
        <SpeechBubble>
          <p>{t(`ranger7.narrative.steps.${step}.title`)}</p>
        </SpeechBubble>
        <Pandastein className="story__panda-art" />
      </div>

      <footer className="story__dock">
        <button type="button" className="pill-button" onClick={() => go(-1)} disabled={index === 0} aria-label={t('common.back')}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        {last ? (
          <button type="button" className="pill-button pill-button--primary story__cta" onClick={onExplore}>
            {t('ranger7.complete.backToHub')}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        ) : (
          <button type="button" className="pill-button pill-button--primary story__cta" onClick={() => go(1)}>
            {t('common.continue')}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        )}
      </footer>
    </main>
  )
}
