import { motion } from 'framer-motion'
import { ChevronRight, ClipboardList, MessageCircleQuestion, Quote } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Pandastein } from '../../../components/mascot/Pandastein'
import { SpeechBubble } from '../../../components/ui/SpeechBubble'
import { StationBackdrop } from '../../../components/backdrop/StationBackdrop'
import { formatDigits } from '../../../i18n'
import { useGameStore } from '../../../game/store'
import { hasEditorialCaveats, ranger7Story } from '../../../content/storyBible'
import type { Bilingual } from '../../../content/storyBible'
import './briefing.css'

interface BriefingProps {
  onContinue: () => void
}

/**
 * The mission brief between exploring and the quiz: Pandastein explains Ranger 7
 * and the Mission File lists the essentials. Both come straight from the story
 * bible JSON, in whichever language the player chose, and it never hides the
 * fact that the source document has items still to verify.
 */
export function Briefing({ onContinue }: BriefingProps) {
  const { t } = useTranslation()
  const language = useGameStore((s) => s.language)
  const pick = (pair: Bilingual) => (language === 'bn' ? pair.bn : pair.en)
  const question = ranger7Story.pandastein_question
  const atAGlance = pick(ranger7Story.at_a_glance).split('\n').filter((line) => line.trim())

  return (
    <main className="briefing screen story-frame">
      <StationBackdrop station={false} />

      <header className="briefing__top">
        <span className="briefing__eyebrow">
          {t('ranger7.title')} · {formatDigits(1964)}
        </span>
        <h2>{t('ranger7.briefing.title')}</h2>
      </header>

      <div className="briefing__body">
        <motion.section
          className="briefing__explains"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18 }}
        >
          <h3>
            <MessageCircleQuestion size={20} aria-hidden="true" />
            {t('ranger7.briefing.explainsTitle')}
          </h3>
          <SpeechBubble className="briefing__bubble">
            <p>{language === 'bn' ? question.bn : question.en}</p>
          </SpeechBubble>
          <p className="briefing__answer">
            <strong>{t('ranger7.briefing.answer')}:</strong>{' '}
            {language === 'bn' ? question.answer_bn : question.answer_en}
          </p>
          <p className="briefing__aside">{pick(ranger7Story.imagined_voice)}</p>
          <div className="briefing__panda">
            <Pandastein className="briefing__panda-art" />
          </div>
        </motion.section>

        <motion.section
          className="briefing__file"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 150, damping: 18, delay: 0.12 }}
        >
          <h3>
            <ClipboardList size={20} aria-hidden="true" />
            {t('ranger7.briefing.fileTitle')}
          </h3>
          <ul className="briefing__glance">
            {atAGlance.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="briefing__voice">
            <Quote size={16} aria-hidden="true" />
            {pick(ranger7Story.robot_voice_card)}
          </p>
          {hasEditorialCaveats && (
            <p className="briefing__caveat">{t('ranger7.briefing.source')}</p>
          )}
        </motion.section>
      </div>

      <footer className="briefing__dock">
        <button type="button" className="pill-button pill-button--primary" onClick={onContinue}>
          {t('ranger7.briefing.continue')}
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </footer>
    </main>
  )
}
