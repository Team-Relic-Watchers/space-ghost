import { ArrowRight, BookOpen, Clock, Gamepad2, Play, Puzzle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../app/routes'
import { Starfield } from '../../components/backdrop/Starfield'
import { Pandastein } from '../../components/mascot/Pandastein'
import { Moon } from '../../components/scene/Moon'
import { Rocket } from '../../components/scene/Rocket'
import { Rover } from '../../components/scene/Rover'
import { ShootingStar } from '../../components/scene/ShootingStar'
import { Logo } from '../../components/ui/Logo'
import { LanguageSwitch } from '../../components/ui/LanguageSwitch'
import { SpeechBubble } from '../../components/ui/SpeechBubble'
import { journey } from '../../content/journey'
import { useGameStore } from '../../game/store'
import { formatYear } from '../../i18n'
import './home.css'

interface FeatureCard {
  id: 'storytelling' | 'timeTravel' | 'learningGames' | 'pandastein'
  Icon: typeof BookOpen
  tone: string
}

/** The four cards along the bottom of the hero. */
const FEATURES: FeatureCard[] = [
  { id: 'storytelling', Icon: BookOpen, tone: 'sun' },
  { id: 'timeTravel', Icon: Clock, tone: 'orange' },
  { id: 'learningGames', Icon: Gamepad2, tone: 'cyan' },
  { id: 'pandastein', Icon: Sparkles, tone: 'pink' },
]

/**
 * The home page: the title, the two ways in, and the four things the app can
 * do. The scene around them is drawn, not photographed, so the page carries no
 * artwork dependency.
 *
 * Every animation here is plain CSS. The page is the first thing every
 * explorer sees, so it must not wait for an animation library to arrive.
 */
export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const language = useGameStore((s) => s.language)
  const launch = useGameStore((s) => s.launch)
  const [greeting, setGreeting] = useState(false)

  /**
   * Start Mission launches the journey: the adventure begins on the campaign
   * map at once, with no warm-up in between.
   */
  const beginAdventure = () => {
    launch()
    navigate(ROUTES.ghostsMap)
  }

  /** What each of the four bottom cards does. */
  const openFeature = (id: FeatureCard['id']) => {
    if (id === 'storytelling') navigate(ROUTES.ghostsMap)
    else if (id === 'timeTravel') beginAdventure()
    else if (id === 'learningGames') navigate(ROUTES.puzzle)
    else setGreeting((current) => !current)
  }

  return (
    <main className="home screen">
      {/* ---- The sky behind everything ---- */}
      <div className="home__sky" aria-hidden="true">
        <div className="home__glow home__glow--pink" />
        <div className="home__glow home__glow--violet" />
        <span className="home__earth" />
        <Starfield count={110} seed={19} />
      </div>

      {/* ---- The rocky ground the scene stands on ---- */}
      <div className="home__ground" aria-hidden="true">
        <span className="home__rock home__rock--one" />
        <span className="home__rock home__rock--two" />
        <span className="home__rock home__rock--three" />
      </div>

      <header className="home__top">
        <Logo as="div" decorative />
        <LanguageSwitch />
      </header>

      <section className="home__hero">
        {/* ---- The words ---- */}
        <div className="home__copy">
          <ShootingStar className="home__shooting-star" />

          <h1 className="home__title">{t('appName')}</h1>

          <p className="home__tagline">
            <span className="home__rule" aria-hidden="true" />
            {t('home.tagline')}
            <span className="home__rule" aria-hidden="true" />
          </p>

          <p className="home__lede">{t('home.lede')}</p>

          <div className="home__actions">
            <button type="button" className="home__start" onClick={beginAdventure}>
              <Play size={30} fill="currentColor" strokeWidth={2.5} aria-hidden="true" />
              <span className="home__start-label">{t('home.start')}</span>
              <ArrowRight size={30} strokeWidth={3} aria-hidden="true" />
            </button>

            <button
              type="button"
              className="home__puzzle"
              onClick={() => navigate(ROUTES.puzzle)}
            >
              <span className="home__spark home__spark--left" aria-hidden="true" />
              <span className="home__puzzle-icon" aria-hidden="true">
                <Puzzle size={30} strokeWidth={0} fill="currentColor" />
              </span>
              <span className="home__puzzle-label">{t('home.puzzle')}</span>
              <span className="home__spark home__spark--right" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ---- Pandastein's greeting, when the reader asks for it ---- */}
        {greeting && (
          <div className="home__greeting">
            <SpeechBubble>
              <p>{t('home.greeting')}</p>
              <p>
                {t('home.prompt', {
                  year: formatYear(journey.destinationYear, language),
                })}
              </p>
            </SpeechBubble>
          </div>
        )}
      </section>

      {/* ---- The cast, placed around the words ---- */}
      <div className="home__panda">
        <Pandastein label={t('home.art.panda')} />
      </div>

      <div className="home__moon">
        <Moon label={t('home.art.moon')} />
      </div>

      <div className="home__rocket">
        <Rocket label={t('home.art.rocket')} />
      </div>

      <div className="home__rover">
        <Rover label={t('home.art.rover')} />
      </div>

      {/* ---- The four things the app can do ---- */}
      <nav className="home__features" aria-label={t('appName')}>
        {FEATURES.map(({ id, Icon, tone }) => (
          <button
            key={id}
            type="button"
            className="home__feature"
            data-tone={tone}
            aria-label={t(`home.features.${id}.label`)}
            onClick={() => openFeature(id)}
          >
            <span className="home__feature-icon" aria-hidden="true">
              <Icon size={30} strokeWidth={2.5} />
            </span>
            <span className="home__feature-text">
              <strong>{t(`home.features.${id}.title`)}</strong>
              <small>{t(`home.features.${id}.text`)}</small>
            </span>
          </button>
        ))}
      </nav>
    </main>
  )
}
