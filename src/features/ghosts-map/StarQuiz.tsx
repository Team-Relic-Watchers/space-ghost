import { useState } from 'react'
import { Check, RotateCcw, Star, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../i18n'
import { useGameStore } from '../../game/store'
import { machineQuizzes } from '../../content/ranger7/quiz'
import { pick } from '../../content/ranger7/machines'
import type { Machine } from '../../content/ranger7/machines'

interface StarQuizProps {
  machine: Machine
  /**
   * Whether the quiz prints its own title block. The standalone quiz page
   * passes false, because it already carries the heading above the quiz.
   */
  showIntro?: boolean
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

/**
 * Pandastein's ten-question star quiz. One question at a time, a star for every
 * correct answer, and the best score kept per machine so the map remembers how
 * well the explorer did.
 */
export function StarQuiz({ machine, showIntro = true }: StarQuizProps) {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const bestStars = useGameStore((state) => state.quizStars[machine.id] ?? 0)
  const recordQuizStars = useGameStore((state) => state.recordQuizStars)

  const questions = machineQuizzes[machine.id] ?? []
  const total = questions.length
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [finished, setFinished] = useState(false)

  const stars = questions.reduce(
    (score, question, questionIndex) =>
      score + (answers[questionIndex] === question.correctIndex ? 1 : 0),
    0,
  )

  if (total === 0) return null

  const current = questions[index]
  const chosen = answers[index]
  const answered = chosen !== null
  const isCorrect = answered && chosen === current.correctIndex
  const isLast = index === total - 1
  const progress = ((index + (answered ? 1 : 0)) / total) * 100

  const choose = (optionIndex: number) => {
    if (answered) return
    const next = [...answers]
    next[index] = optionIndex
    setAnswers(next)
  }

  const advance = () => {
    if (!answered) return
    if (!isLast) {
      setIndex(index + 1)
      return
    }
    recordQuizStars(machine.id, stars)
    setFinished(true)
  }

  const restart = () => {
    setAnswers(questions.map(() => null))
    setIndex(0)
    setFinished(false)
  }

  const resultMessage =
    stars === total
      ? t('ghostStory.quiz.resultPerfect')
      : stars >= Math.ceil(total * 0.7)
        ? t('ghostStory.quiz.resultGood')
        : t('ghostStory.quiz.resultTry')

  return (
    <section
      className="star-quiz"
      aria-labelledby={showIntro ? 'star-quiz-title' : undefined}
      aria-label={showIntro ? undefined : t('ghostStory.quiz.eyebrow')}
    >
      <header className={`star-quiz__head${showIntro ? '' : ' star-quiz__head--score-only'}`}>
        {showIntro && (
          <div className="star-quiz__intro">
            <span className="star-quiz__eyebrow">{t('ghostStory.quiz.eyebrow')}</span>
            <h3 id="star-quiz-title" className="star-quiz__title">
              {t('ghostStory.quiz.title')}
            </h3>
            <p className="star-quiz__lede">
              {t('ghostStory.quiz.intro', { name: pick(machine.name, language) })}
            </p>
          </div>
        )}
        <div className="star-quiz__score" aria-label={t('ghostStory.quiz.starsLabel')}>
          <Star size={22} fill="currentColor" aria-hidden="true" />
          <strong>
            {formatNumber(stars, language)} / {formatNumber(total, language)}
          </strong>
          <small>
            {t('ghostStory.quiz.best', {
              stars: formatNumber(bestStars, language),
              total: formatNumber(total, language),
            })}
          </small>
        </div>
      </header>

      {finished ? (
        <div className="star-quiz__result" role="status">
          <div className="star-quiz__result-stars" aria-hidden="true">
            {questions.map((question, starIndex) => (
              <Star
                key={question.id}
                size={26}
                className={starIndex < stars ? 'star-quiz__star--won' : 'star-quiz__star--empty'}
                fill={starIndex < stars ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <h4>{t('ghostStory.quiz.resultTitle')}</h4>
          <p className="star-quiz__result-line">
            {t('ghostStory.quiz.resultLine', {
              stars: formatNumber(stars, language),
              total: formatNumber(total, language),
            })}
          </p>
          <p className="star-quiz__result-note">{resultMessage}</p>
          <button type="button" className="ghost-story__action" onClick={restart}>
            <RotateCcw size={18} aria-hidden="true" />
            {t('ghostStory.quiz.tryAgain')}
          </button>
        </div>
      ) : (
        <div className="star-quiz__card">
          <div className="star-quiz__progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>

          <span className="star-quiz__counter">
            {t('ghostStory.quiz.question', {
              current: formatNumber(index + 1, language),
              total: formatNumber(total, language),
            })}
          </span>

          <p className="star-quiz__prompt">{pick(current.prompt, language)}</p>

          <div className="star-quiz__options" role="group" aria-label={t('ghostStory.quiz.question', {
            current: formatNumber(index + 1, language),
            total: formatNumber(total, language),
          })}>
            {current.options.map((option, optionIndex) => {
              const isAnswer = optionIndex === current.correctIndex
              const isChosen = optionIndex === chosen
              const state = answered
                ? isAnswer
                  ? 'correct'
                  : isChosen
                    ? 'wrong'
                    : 'idle'
                : 'idle'
              return (
                <button
                  key={`${current.id}-${optionIndex}`}
                  type="button"
                  className="star-quiz__option"
                  data-state={state}
                  disabled={answered}
                  onClick={() => choose(optionIndex)}
                >
                  <span className="star-quiz__letter" aria-hidden="true">
                    {OPTION_LETTERS[optionIndex] ?? optionIndex + 1}
                  </span>
                  <span className="star-quiz__option-text">{pick(option, language)}</span>
                  {answered && isAnswer && <Check size={20} aria-hidden="true" />}
                  {answered && isChosen && !isAnswer && <X size={20} aria-hidden="true" />}
                </button>
              )
            })}
          </div>

          {answered && (
            <div
              className="star-quiz__feedback"
              data-correct={isCorrect ? 'true' : 'false'}
              aria-live="polite"
            >
              <strong>
                {isCorrect ? t('ghostStory.quiz.correct') : t('ghostStory.quiz.wrong')}
              </strong>
              <p>{pick(current.explain, language)}</p>
            </div>
          )}

          <button
            type="button"
            className="ghost-story__action star-quiz__next"
            onClick={advance}
            disabled={!answered}
          >
            {isLast ? t('ghostStory.quiz.finish') : t('ghostStory.quiz.next')}
          </button>
        </div>
      )}
    </section>
  )
}
