import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  CalendarDays,
  Cpu,
  Flag,
  Gift,
  MapPin,
  Play,
  Route,
  Search,
  Star,
  Target,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatYear } from '../../i18n'
import { useGameStore } from '../../game/store'
import { machineDetails, machines, pick } from '../../content/ranger7/machines'
import type { Machine } from '../../content/ranger7/machines'
import { ghostPhotos } from '../../content/ranger7/photos'
import type { GhostPhoto } from '../../content/ranger7/photos'
import { Pandastein } from '../../components/mascot/Pandastein'
import { Starfield } from '../../components/backdrop/Starfield'
import { LanguageToggle } from '../../components/ui/LanguageToggle'
import { VoiceCard } from '../../components/ui/VoiceCard'
import { isMicrosoftVoice } from '../../audio/microsoftTts'
import { endingColour } from './art/colours'
import { GhostPuzzle } from './GhostPuzzle'
import { StarQuiz } from './StarQuiz'
import { usePandasteinVoice } from './usePandasteinVoice'
import './ghost-story.css'

interface GhostDetailProps {
  machine: Machine | null
  onClose: () => void
  /** Opens another ghost's page, used by the "next ghost" button. */
  onOpenSequence?: (sequence: number) => void
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
export function GhostDetail({ machine, onClose, onOpenSequence }: GhostDetailProps) {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const quizStars = useGameStore((state) => state.quizStars)
  const [quizStarted, setQuizStarted] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  const {
    supported: voiceSupported,
    enabled: voiceEnabled,
    speakingId: voiceSpeakingId,
    voices: voiceVoices,
    voice: currentVoice,
    microsoft: voiceIsMicrosoft,
    microsoftAvailable: voiceMicrosoftAvailable,
    paused: voicePaused,
    missing: voiceMissing,
    noVoices: voiceNoVoices,
    trouble: voiceTrouble,
    speak: speakVoice,
    stop: stopVoice,
    pause: pauseVoice,
    resume: resumeVoice,
    toggle: toggleVoice,
    choose: chooseVoice,
  } = usePandasteinVoice(language)

  /** The Microsoft voices come first in the picker, the rest after them. */
  const microsoftVoices = voiceVoices.filter(isMicrosoftVoice)
  const otherVoices = voiceVoices.filter((candidate) => !isMicrosoftVoice(candidate))

  /** The seven story parts, so the reader's scroll can find them. */
  const partRefs = useRef(new Map<number, HTMLElement>())
  /** The newest voice functions, kept fresh without rebuilding the observer. */
  const speakRef = useRef(speakVoice)
  const languageRef = useRef(language)
  /** The reading only starts when the reader asks for it. */
  const readingRef = useRef(voiceEnabled)
  /** The part the reader is looking at, so the button can start it at once. */
  const activePartRef = useRef<number | null>(null)

  useEffect(() => {
    speakRef.current = speakVoice
  }, [speakVoice])

  useEffect(() => {
    languageRef.current = language
  }, [language])

  useEffect(() => {
    readingRef.current = voiceEnabled
  }, [voiceEnabled])

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Every ghost starts with a fresh page: scrolled to the top, quiz not begun.
  useEffect(() => {
    if (!machine) return
    setQuizStarted(false)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [machine])

  // The voice stops the moment the story page closes.
  useEffect(() => {
    if (!machine) stopVoice()
  }, [machine, stopVoice])

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

  const currentIndex = machine ? machines.findIndex((m) => m.id === machine.id) : -1
  const previousMachine =
    currentIndex >= 0
      ? machines[(currentIndex - 1 + machines.length) % machines.length]
      : undefined
  const nextMachine =
    currentIndex >= 0 ? machines[(currentIndex + 1) % machines.length] : undefined

  const glance = detail ? parseGlance(pick(detail.atAGlance, language)) : []
  const totalParts = detail ? detail.parts.length : 7

  // Pandastein starts talking when the reader reaches a part of the story.
  useEffect(() => {
    if (!machine || !detail) return
    const root = scrollRef.current
    if (!root) return
    if (typeof IntersectionObserver === 'undefined') return

    let timer: number | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const entry = visible[0]
        if (!entry) return

        const id = Number((entry.target as HTMLElement).dataset.part)
        const text = detail.parts.find((part) => part.part === id)?.text
        if (!text) return

        // Scrolling inside one part must not restart its reading.
        const settled = activePartRef.current === id
        activePartRef.current = id
        // Pandastein only reads when the reader has asked him to.
        if (!readingRef.current) return
        if (settled) return

        const spoken = pick(text, languageRef.current)
        // Scrolling quickly must not start every part at once: the last one
        // the reader settled on wins.
        if (timer !== null) window.clearTimeout(timer)
        timer = window.setTimeout(() => speakRef.current(id, spoken), 450)
      },
      { root, threshold: [0.3, 0.7] },
    )

    partRefs.current.forEach((element) => observer.observe(element))

    return () => {
      observer.disconnect()
      if (timer !== null) window.clearTimeout(timer)
    }
  }, [detail, machine])

  const scrollToPart = (part: number) => {
    if (!machine) return
    const element = document.getElementById(`story-part-${machine.id}-${part}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /**
   * The sound button: the first press lets Pandastein read, and he starts at
   * once — with the part the reader is looking at, or with the first part of
   * the story when none is on the screen yet. The browser insists on hearing
   * a tap before any talking, so the reading begins here, in the tap.
   */
  const handleVoiceToggle = () => {
    const turningOn = !voiceEnabled
    toggleVoice()

    if (!turningOn) return
    const id = activePartRef.current ?? detail?.parts[0]?.part
    if (id === undefined || id === null) return
    activePartRef.current = id
    const part = detail?.parts.find((entry) => entry.part === id)
    if (part) speakVoice(id, pick(part.text, language))
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
          <div className="ghost-story__scroll" ref={scrollRef}>
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

              {voiceSupported && (
                <button
                  type="button"
                  className="ghost-story__voice"
                  onClick={handleVoiceToggle}
                  aria-pressed={voiceEnabled}
                  aria-label={
                    voiceEnabled
                      ? t('ghostStory.voice.turnOff')
                      : t('ghostStory.voice.turnOn')
                  }
                  title={t('ghostStory.voice.label')}
                >
                  {voiceEnabled ? (
                    <Volume2 size={19} aria-hidden="true" />
                  ) : (
                    <VolumeX size={19} aria-hidden="true" />
                  )}
                </button>
              )}

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

                {voiceSupported && (
                  <div className="ghost-story__voice-picker">
                    {voiceNoVoices ? (
                      <>
                        <span className="ghost-story__voice-warning">
                          {t('ghostStory.voice.noVoices')}
                        </span>
                        <span className="ghost-story__voice-hint">
                          {t('ghostStory.voice.noVoicesHint')}
                        </span>
                      </>
                    ) : voiceMissing ? (
                      <>
                        <span className="ghost-story__voice-warning">
                          {t('ghostStory.voice.missing')}
                        </span>
                        {voiceMicrosoftAvailable && (
                          <span className="ghost-story__voice-hint">
                            {t('ghostStory.voice.install')}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <label htmlFor="pandastein-voice">
                          {t('ghostStory.voice.pick')}
                        </label>
                        <select
                          id="pandastein-voice"
                          value={currentVoice?.name ?? ''}
                          onChange={(event) => chooseVoice(event.target.value)}
                        >
                          {microsoftVoices.length > 0 && (
                            <optgroup label={t('ghostStory.voice.microsoftGroup')}>
                              {microsoftVoices.map((candidate) => (
                                <option key={candidate.name} value={candidate.name}>
                                  {candidate.name} · {candidate.lang}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {otherVoices.length > 0 && (
                            <optgroup label={t('ghostStory.voice.otherGroup')}>
                              {otherVoices.map((candidate) => (
                                <option key={candidate.name} value={candidate.name}>
                                  {candidate.name} · {candidate.lang}
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <span
                          className="ghost-story__voice-engine"
                          data-microsoft={voiceIsMicrosoft ? 'true' : 'false'}
                        >
                          {voiceIsMicrosoft
                            ? t('ghostStory.voice.microsoft')
                            : t('ghostStory.voice.otherEngine')}
                        </span>
                        {voiceTrouble && (
                          <>
                            <span className="ghost-story__voice-warning">
                              {t('ghostStory.voice.trouble')}
                            </span>
                            <span className="ghost-story__voice-hint">
                              {t('ghostStory.voice.troubleHint')}
                            </span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {detail.parts.map((part) => {
                  const key = PART_KEYS[part.part - 1] ?? 'introduction'
                  const Icon = PART_ICONS[part.part - 1] ?? BookOpen
                  const photo =
                    part.part === 2
                      ? photos?.design
                      : part.part === 5
                        ? photos?.discovery
                        : undefined
                  const partText = pick(part.text, language)

                  return (
                    <article
                      className="story-part"
                      key={part.part}
                      id={`story-part-${machine.id}-${part.part}`}
                      data-part={part.part}
                      data-speaking={voiceSpeakingId === part.part ? 'true' : 'false'}
                      ref={(element) => {
                        if (element) partRefs.current.set(part.part, element)
                        else partRefs.current.delete(part.part)
                      }}
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
                          <div className="story-part__bubble-head">
                            <span className="story-part__speaker">
                              {t('ghostStory.pandastein')}
                            </span>
                            {voiceSupported && (
                              <VoiceCard
                                className="story-part__voice-card"
                                onPlay={() => speakVoice(part.part, partText)}
                                onPause={pauseVoice}
                                onResume={resumeVoice}
                                talking={voiceSpeakingId === part.part}
                                held={voicePaused}
                                groupLabel={t('ghostStory.voice.label')}
                                playLabel={t('ghostStory.voice.replay', {
                                  part: formatNumber(part.part, language),
                                })}
                                pauseLabel={t('ghostStory.voice.pause')}
                                resumeLabel={t('ghostStory.voice.resume')}
                              />
                            )}
                          </div>
                          <p>{partText}</p>
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

              {quizStarted ? (
                <StarQuiz key={`quiz-${machine.id}`} machine={machine} />
              ) : (
                <section className="star-quiz star-quiz--launch" aria-labelledby="star-quiz-start">
                  <header className="star-quiz__head">
                    <div className="star-quiz__intro">
                      <span className="star-quiz__eyebrow">{t('ghostStory.quiz.eyebrow')}</span>
                      <h3 id="star-quiz-start" className="star-quiz__title">
                        {t('ghostStory.quiz.title')}
                      </h3>
                      <p className="star-quiz__lede">
                        {t('ghostStory.quiz.intro', { name })}
                      </p>
                    </div>
                  </header>
                  <div className="star-quiz__launch">
                    <button
                      type="button"
                      className="ghost-story__action star-quiz__start"
                      onClick={() => setQuizStarted(true)}
                    >
                      <Play size={18} fill="currentColor" aria-hidden="true" />
                      {t('ghostStory.quiz.start')}
                    </button>
                  </div>
                </section>
              )}

              <GhostPuzzle
                key={`puzzle-${machine.id}`}
                name={name}
                image={photos.cartoon ?? hero}
              />

              <footer className="ghost-story__foot">
                {previousMachine && onOpenSequence ? (
                  <button
                    type="button"
                    className="ghost-story__action"
                    onClick={() => onOpenSequence(previousMachine.sequence)}
                    aria-label={t('ghostStory.previousGhostLabel', {
                      name: pick(previousMachine.name, language),
                    })}
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                    {t('ghostStory.previousGhost')}
                  </button>
                ) : (
                  <button type="button" className="ghost-story__action" onClick={onClose}>
                    <ArrowLeft size={18} aria-hidden="true" />
                    {t('ghostStory.back')}
                  </button>
                )}
                <div className="ghost-story__foot-end">
                  {nextMachine && onOpenSequence && (
                    <button
                      type="button"
                      className="ghost-story__next"
                      onClick={() => onOpenSequence(nextMachine.sequence)}
                      aria-label={t('ghostStory.nextGhostLabel', {
                        name: pick(nextMachine.name, language),
                      })}
                    >
                      <ArrowRight size={16} aria-hidden="true" />
                      <span>{t('ghostStory.nextGhost')}</span>
                    </button>
                  )}
                  <span>
                    {t('appName')} · {name}
                  </span>
                </div>
              </footer>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
