import { ArrowLeft, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { Starfield } from '../../components/backdrop/Starfield'
import { Logo } from '../../components/ui/Logo'
import { LanguageSwitch } from '../../components/ui/LanguageSwitch'
import { machines, pick } from '../../content/ranger7/machines'
import { useGameStore } from '../../game/store'
import { StarQuiz } from '../ghosts-map/StarQuiz'
import '../ghosts-map/ghost-story.css'
import './ghost-quiz.css'

/**
 * One machine's star quiz as a page of its own, opened from the story page.
 *
 * The quiz itself is shared with the story page. This screen only wraps it in
 * its own heading and a way back; the back button returns to the campaign map
 * and asks it to reopen the same ghost, so the explorer lands where they left.
 */
export function GhostQuizPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((state) => state.language)
  const { sequence } = useParams()

  const machine = machines.find((candidate) => String(candidate.sequence) === sequence)

  if (!machine) return <Navigate to={ROUTES.ghostsMap} replace />

  const name = pick(machine.name, language)

  return (
    <main className="ghost-quiz screen">
      <div className="ghost-quiz__sky" aria-hidden="true">
        <Starfield count={70} seed={47} />
      </div>

      <header className="ghost-quiz__top">
        <button
          type="button"
          className="ghost-quiz__back"
          onClick={() =>
            navigate(ROUTES.ghostsMap, { state: { openSequence: machine.sequence } })
          }
        >
          <ArrowLeft size={20} strokeWidth={2.75} aria-hidden="true" />
          <span>{t('ghostStory.quiz.back')}</span>
        </button>

        <div className="ghost-quiz__brand">
          <Logo as="div" decorative />
        </div>

        <LanguageSwitch />
      </header>

      <section className="ghost-quiz__body">
        <header className="ghost-quiz__head">
          <span className="ghost-quiz__eyebrow">
            <Star size={16} aria-hidden="true" />
            {t('ghostStory.quiz.eyebrow')}
          </span>
          <h1 className="ghost-quiz__title">
            {t('ghostStory.quiz.pageTitle', { name })}
          </h1>
          <p className="ghost-quiz__lede">
            {t('ghostStory.quiz.intro', { name })}
          </p>
        </header>

        <StarQuiz key={machine.id} machine={machine} showIntro={false} />
      </section>
    </main>
  )
}
