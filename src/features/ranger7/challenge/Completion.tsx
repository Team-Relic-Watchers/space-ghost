import { motion } from 'framer-motion'
import { Home, Map, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../../app/routes'
import { StationBackdrop } from '../../../components/backdrop/StationBackdrop'
import { Pandastein } from '../../../components/mascot/Pandastein'
import { formatDigits } from '../../../i18n'
import { quiz } from '../../../content/ranger7/imagery'
import { useGameStore } from '../../../game/store'
import './completion.css'

interface CompletionProps {
  onReplay: () => void
  onHub: () => void
}

/** Mission 1 achievement: the badge reveal, score, and a way back. */
export function MissionComplete({ onReplay, onHub }: CompletionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const bestScore = useGameStore((s) => s.ranger7.bestScore)
  const score = bestScore ?? 0

  return (
    <main className="complete screen story-frame">
      <StationBackdrop station={false} />

      <motion.div
        className="complete__stage"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } } }}
      >
        <motion.span
          className="complete__eyebrow"
          variants={fade}
        >
          {t('ranger7.complete.badgeNote')}
        </motion.span>

        <motion.div className="complete__badge-wrap" variants={pop}>
          <svg className="complete__badge" viewBox="0 0 220 220" role="img" aria-label={t('ranger7.complete.badge')}>
            <defs>
              <radialGradient id="badge-gold" cx="40%" cy="35%" r="70%">
                <stop offset="0" stopColor="#fff6c2" />
                <stop offset="0.45" stopColor="#ffd43b" />
                <stop offset="1" stopColor="#ff8a1f" />
              </radialGradient>
            </defs>
            <g className="complete__rays">
              {Array.from({ length: 16 }, (_, i) => (
                <rect key={i} x="108" y="2" width="4" height="26" rx="2" fill="var(--sun)" transform={`rotate(${i * 22.5} 110 110)`} opacity="0.55" />
              ))}
            </g>
            <circle cx="110" cy="110" r="80" fill="url(#badge-gold)" stroke="var(--ink-deep)" strokeWidth="6" />
            <circle cx="110" cy="110" r="64" fill="none" stroke="var(--ink-deep)" strokeWidth="3" strokeDasharray="3 7" opacity="0.5" />
            <path d="M110 56a12 12 0 0 1 12 12v82a12 12 0 0 1-24 0V68a12 12 0 0 1 12-12z" fill="#fff" stroke="var(--ink-deep)" strokeWidth="4" />
            <path d="M98 74h24l-12 16z" fill="#ff5ca8" stroke="var(--ink-deep)" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="110" cy="104" r="7" fill="#38e1ff" stroke="var(--ink-deep)" strokeWidth="3" />
            <path d="M92 136l-14 20 20-4M128 136l14 20-20-4" fill="#ff5ca8" stroke="var(--ink-deep)" strokeWidth="4" strokeLinejoin="round" />
          </svg>
        </motion.div>

        <motion.h1 variants={fade} className="complete__title">
          {t('ranger7.complete.title')}
        </motion.h1>
        <motion.p variants={fade} className="complete__badge-name">
          {t('ranger7.complete.badge')}
        </motion.p>
        <motion.p variants={fade} className="complete__score">
          {t('ranger7.complete.score', { score: formatDigits(score), total: formatDigits(quiz.length) })}
        </motion.p>

        <motion.div variants={fade} className="complete__panda">
          <Pandastein className="complete__panda-art" />
        </motion.div>

        <motion.div variants={fade} className="complete__actions">
          <button type="button" className="pill-button pill-button--primary" onClick={onHub}>
            <Map size={18} aria-hidden="true" />
            {t('ranger7.complete.backToHub')}
          </button>
          <button type="button" className="pill-button" onClick={onReplay}>
            <RotateCcw size={18} aria-hidden="true" />
            {t('ranger7.complete.replay')}
          </button>
          <button type="button" className="pill-button" onClick={() => navigate(ROUTES.missionControl)}>
            <Home size={18} aria-hidden="true" />
            {t('ranger7.complete.home')}
          </button>
        </motion.div>

        <motion.p variants={fade} className="complete__next">
          {t('ranger7.complete.nextMission')}
        </motion.p>
      </motion.div>
    </main>
  )
}

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }
const pop = { hidden: { opacity: 0, scale: 0.4, rotate: -20 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring' as const, stiffness: 180, damping: 12 } } }
