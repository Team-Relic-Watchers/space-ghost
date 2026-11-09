import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CalendarDays,
  Cpu,
  Flag,
  Gift,
  MapPin,
  Route,
  Search,
  Star,
  Target,
  X,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatYear } from '../../i18n'
import { useGameStore } from '../../game/store'
import { machineDetails, pick } from '../../content/ranger7/machines'
import type { Machine } from '../../content/ranger7/machines'
import { ghostPhotos } from '../../content/ranger7/photos'
import type { GhostPhoto } from '../../content/ranger7/photos'
import { Pandastein } from '../../components/mascot/Pandastein'
import { Starfield } from '../../components/backdrop/Starfield'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { endingColour } from './art/colours'
import { StarQuiz } from './StarQuiz'
import './ghost-story.css'

interface GhostDetailProps {
  machine: Machine | null
  onClose: () => void
}

const PART_KEYS = [
  'introduction',
  'design',
  'mission',
  'journey',
  'discovery',
  'ending',
  'legacy',
] as const

const PART_ICONS = [BookOpen, Cpu, Target, Route, Search, Flag, Gift] as const

interface GlanceFact {
  label: string
  value: string
}

const parseGlance = (text: string): GlanceFact[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':')
      return colon >= 0
        ? { label: line.slice(0, colon).trim(), value: line.slice(colon + 1).trim() }
        : { label: '', value: line }
    })

interface StoryPhotoProps {
  photo: GhostPhoto
}

/** A story photograph with its title underneath, exactly as the explorer reads it. */
function StoryPhoto({ photo }: StoryPhotoProps) {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const title = pick(photo.title, language)

  return (
    <figure className="story-photo">
      <div className="story-photo__frame" data-fit={photo.fit ?? 'cover'}>
        <img src={photo.src} alt={title} loading="lazy" decoding="async" />
      </div>
      <figcaption className="story-photo__caption">
        <strong>{title}</strong>
        <span>{t('ghostStory.photoCredit', { credit: photo.credit })}</span>
      </figcaption>
    </figure>
  )
}

/**
 * The full story page for one machine: its real photograph, the Mission File,
 * all seven story parts with Pandastein explaining each one, the machine's own
 * robot voice, and the ten-question star quiz.
 */
export function GhostDetail({ machine, onClose }: GhostDetailProps) {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const quizStars = useGameStore((state) => state.quizStars)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!machine) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [machine])

  const detail = machine ? machineDetails[machine.id] : null
  const photos = machine ? ghostPhotos[machine.slug] : undefined
  const hero = photos?.hero
  const voicePhoto = photos?.cartoon ?? photos?.design ?? photos?.hero
  const totalStars = Object.values(quizStars).reduce((sum, stars) => sum + stars, 0)
  const name = machine ? pick(machine.name, language) : ''

  const glance = detail ? parseGlance(pick(detail.atAGlance, language)) : []
  const totalParts = detail ? detail.parts.length : 7

  const scrollToPart = (part: number) => {
    if (!machine) return
    const element = document.getElementById(`story-part-${machine.id}-${part}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AnimatePresence>
      {machine && detail && hero && (
        <motion.aside
          key={machine.id}
          className="ghost-story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          role="dialog"
          aria-modal="true"
          aria-label={t('ghostStory.dialogLabel', { name })}
        >
          <div className="ghost-story__starfield">
            <Starfield count={110} seed={machine.sequence} />
          </div>
          <div className="ghost-story__scroll">
            <header className="ghost-story__bar">
              <button
                type="button"
                className="ghost-story__back"
                onClick={onClose}
                aria-label={t('ghostStory.back')}
              >
                <ArrowLeft size={20} aria-hidden="true" />
                <span>{t('ghostStory.back')}</span>
              </button>

              <div className="ghost-story__bar-title">
                <strong>{name}</strong>
                <small>
                  {t('ghostStory.mission', {
                    current: formatNumber(machine.sequence, language),
                    total: formatNumber(17, language),
                  })}
                </small>
              </div>

              <div className="ghost-story__bar-stars">
                <Star size={18} fill="currentColor" aria-hidden="true" />
                <span>
                  {t('ghostStory.quiz.starsTotal', {
                    count: formatNumber(totalStars, language),
                  })}
                </span>
              </div>

              <LanguageToggle />

              <button
                ref={closeRef}
                type="button"
                className="ghost-story__close"
                onClick={onClose}
                aria-label={t('common.close')}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </header>

            <div className="ghost-story__inner">
              <section className="ghost-story__hero">
                <figure className="ghost-story__hero-figure">
                  <div className="ghost-story__hero-frame">
                    <img
                      src={hero.src}
                      alt={pick(hero.title, language)}
                      fetchPriority="high"
                    />
                  </div>
                  <figcaption>
                    <strong>{pick(hero.title, language)}</strong>
                    <span>{t('ghostStory.photoCredit', { credit: hero.credit })}</span>
                  </figcaption>
                </figure>

                <div className="ghost-story__identity">
                  <span className="ghost-story__eyebrow">
                    {t('ghostStory.mission', {
                      current: formatNumber(machine.sequence, language),
                      total: formatNumber(17, language),
                    })}
                  </span>
                  <h2 className="ghost-story__name">{name}</h2>

                  <div className="ghost-story__chips">
                    <span className="ghost-story__chip">
                      <CalendarDays size={17} aria-hidden="true" />
                      <small>{t('ghostStory.year')}</small>
                      <strong>{formatYear(machine.yearNumber, language)}</strong>
                    </span>
                    <span className="ghost-story__chip">
                      <MapPin size={17} aria-hidden="true" />
                      <small>{t('ghostStory.destination')}</small>
                      <strong>{pick(machine.location, language)}</strong>
                    </span>
                    <span
                      className="ghost-story__chip ghost-story__chip--ending"
                      style={{ borderColor: endingColour(machine.ending) }}
                    >
                      <Flag size={17} aria-hidden="true" />
                      <small>{t('ghostStory.ending')}</small>
                      <strong>{pick(machine.status, language)}</strong>
                    </span>
                  </div>

                  {glance.length > 0 && (
                    <div className="ghost-story__glance-block">
                      <div className="ghost-story__glance-head">
                        <strong>{t('ghostStory.atAGlance')}</strong>
                        <span>{t('ghostStory.atAGlanceHint')}</span>
                      </div>
                      <dl className="ghost-story__glance">
                        {glance.map((fact) => (
                          <div className="ghost-story__fact" key={`${fact.label}-${fact.value}`}>
                            {fact.label && <dt>{fact.label}</dt>}
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              </section>

              {photos && (
                <section
                  className="ghost-story__gallery"
                  aria-labelledby={`ghost-gallery-${machine.id}`}
                >
                  <header className="ghost-story__gallery-head">
                    <h3 id={`ghost-gallery-${machine.id}`}>
                      {t('ghostStory.photoGalleryTitle')}
                    </h3>
                    <p>{t('ghostStory.photoGalleryNote')}</p>
                  </header>
                  <div className="ghost-story__gallery-grid">
                    {[photos.hero, photos.cartoon, photos.design, photos.discovery]
                      .filter((photo): photo is GhostPhoto => photo !== undefined)
                      .map((photo) => (
                        <StoryPhoto key={photo.src} photo={photo} />
                      ))}
                  </div>
                </section>
              )}

              <nav className="ghost-story__nav" aria-label={t('ghostStory.jump')}>
                <span className="ghost-story__nav-label">{t('ghostStory.jump')}</span>
                <div className="ghost-story__nav-links">
                  {detail.parts.map((part) => {
                    const key = PART_KEYS[part.part - 1] ?? 'introduction'
                    return (
                      <button
                        key={part.part}
                        type="button"
                        onClick={() => scrollToPart(part.part)}
                      >
                        <span aria-hidden="true">{formatNumber(part.part, language)}</span>
                        {t(`ghostStory.parts.${key}`)}
                      </button>
                    )
                  })}
                </div>
              </nav>

              <section className="ghost-story__story" aria-labelledby="ghost-story-title">
                <header className="ghost-story__story-head">
                  <h3 id="ghost-story-title">
                    {t('ghostStory.storyTitle', { name })}
                  </h3>
                  <p>{t('ghostStory.storyNote')}</p>
                </header>

                {detail.parts.map((part) => {
                  const key = PART_KEYS[part.part - 1] ?? 'introduction'
                  const Icon = PART_ICONS[part.part - 1] ?? BookOpen
                  const photo =
                    part.part === 2
                      ? photos?.design
                      : part.part === 5
                        ? photos?.discovery
                        : undefined

                  return (
                    <article
                      className="story-part"
                      key={part.part}
                      id={`story-part-${machine.id}-${part.part}`}
                    >
                      <div className="story-part__type">
                        <span className="story-part__type-icon">
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <span className="story-part__type-text">
                          <strong>{t(`ghostStory.parts.${key}`)}</strong>
                          <small>
                            {t('ghostStory.partCaption', {
                              current: formatNumber(part.part, language),
                              total: formatNumber(totalParts, language),
                            })}
                          </small>
                        </span>
                      </div>

                      <div className="story-part__say">
                        <div className="story-part__panda">
                          <Pandastein />
                        </div>
                        <div className="story-part__bubble">
                          <span className="story-part__speaker">
                            {t('ghostStory.pandastein')}
                          </span>
                          <p>{pick(part.text, language)}</p>
                        </div>
                      </div>

                      {photo && <StoryPhoto photo={photo} />}
                    </article>
                  )
                })}
              </section>

              <section className="ghost-voice" aria-labelledby="ghost-voice-title">
                <div className="ghost-voice__stage">
                  {voicePhoto && (
                    <img
                      className="ghost-voice__portrait"
                      src={voicePhoto.src}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  )}
                  <div className="ghost-voice__shade" aria-hidden="true" />
                  <div className="ghost-voice__card">
                    <span className="ghost-voice__eyebrow">
                      <Bot size={18} aria-hidden="true" />
                      {t('ghostStory.robotVoiceTitle')}
                    </span>
                    <h3 id="ghost-voice-title">{name}</h3>
                    <p className="ghost-voice__text">{pick(detail.voice, language)}</p>
                    <span className="ghost-voice__hint">
                      {t('ghostStory.robotVoiceHint')}
                    </span>
                  </div>
                </div>
              </section>

              <StarQuiz key={machine.id} machine={machine} />

              <footer className="ghost-story__foot">
                <button type="button" className="ghost-story__action" onClick={onClose}>
                  <ArrowLeft size={18} aria-hidden="true" />
                  {t('ghostStory.back')}
                </button>
                <span>
                  {t('appName')} · {name}
                </span>
              </footer>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
