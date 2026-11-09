import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronRight, Trophy, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { quiz } from '../../../content/ranger7/imagery'
import { StationBackdrop } from '../../../components/backdrop/StationBackdrop'
import { formatDigits } from '../../../i18n'
import { useGameStore } from '../../../game/store'
import './challenge.css'

const LETTERS = ['a', 'b', 'c'] as const

interface ChallengeProps {
  onComplete: () => void
}

/** Part 2.5: four quick questions with instant feedback, then a badge. */
export function Challenge({ onComplete }: ChallengeProps) {
  const { t } = useTranslation()
  const recordChallenge = useGameStore((s) => s.recordChallenge)
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const question = quiz[index]
  const isCorrect = choice === question.correct
  const last = index === quiz.length - 1

  const answer = useCallback(
    (letter: string) => {
      if (choice) return
      setChoice(letter)
      if (letter === question.correct) setScore((s) => s + 1)
    },
    [choice, question.correct],
  )

  const next = () => {
    const finalScore = score
    if (last) {
      recordChallenge(finalScore)
      onComplete()
      return
    }
    setIndex((i) => i + 1)
    setChoice(null)
  }

  const progress = useMemo(() => (index + (choice ? 1 : 0)) / quiz.length, [index, choice])

  return (
    <main className="challenge screen story-frame">
      <StationBackdrop station={false} />
      <header className="challenge__top">
        <span className="challenge__title">{t('ranger7.challenge.title')}</span>
        <span className="challenge__score">
          {t('ranger7.challenge.score')} {formatDigits(score)}
        </span>
      </header>

      <div className="challenge__progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={question.id}
          className="challenge__card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        >
          <span className="challenge__count">
            {t('ranger7.challenge.question', { current: index + 1, total: quiz.length })}
          </span>
          <h2>{t(`ranger7.challenge.questions.${question.id}.question`)}</h2>

          <div className="challenge__answers">
            {LETTERS.map((letter) => {
              const correct = letter === question.correct
              const picked = choice === letter
              const state = !choice ? 'idle' : correct ? 'correct' : picked ? 'wrong' : 'dim'
              return (
                <button
                  key={letter}
                  type="button"
                  className="challenge__answer"
                  data-state={state}
                  onClick={() => answer(letter)}
                  disabled={!!choice}
                >
                  <span className="challenge__letter">{letter.toUpperCase()}</span>
                  <span>{t(`ranger7.challenge.questions.${question.id}.${letter}`)}</span>
                  {choice && correct && <Check size={20} aria-hidden="true" />}
                  {choice && picked && !correct && <X size={20} aria-hidden="true" />}
                </button>
              )
            })}
          </div>

          <AnimatePresence>
            {choice && (
              <motion.div
                className="challenge__feedback"
                data-correct={isCorrect}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <strong>{isCorrect ? t('ranger7.challenge.correct') : t('ranger7.challenge.wrong')}</strong>
                <p>{t(`ranger7.challenge.questions.${question.id}.explain`)}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {choice && (
            <button type="button" className="pill-button pill-button--primary challenge__next" onClick={next}>
              {last ? <Trophy size={18} aria-hidden="true" /> : null}
              {last ? t('ranger7.challenge.finish') : t('ranger7.challenge.next')}
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          )}
        </motion.section>
      </AnimatePresence>
    </main>
  )
}
