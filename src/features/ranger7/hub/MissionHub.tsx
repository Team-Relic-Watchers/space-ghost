import { CircleCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { formatDigits } from '../../../i18n'
import { stopMeta } from '../stopsMeta'
import type { MissionStopId } from '../stops'
import { useGameStore } from '../../../game/store'
import { Ranger7Cameo } from './Ranger7Cameo'
import './hub.css'

interface MissionHubProps {
  onOpenStop: (stop: MissionStopId) => void
  banner?: string
}
/** Mission 1 overview: a single viewport with fanned, tactile stops. */
export function MissionHub({ onOpenStop, banner }: MissionHubProps) {
  const { t } = useTranslation()
  const progress = useGameStore((s) => s.ranger7)

  return (
    <main className="hub screen">
      <header className="hub__top">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="hub__title">
          <span className="hub__eyebrow">
            {t('ranger7.missionBadge')} · {formatDigits(1964)}
          </span>
          <h1>{t('ranger7.title')}</h1>
        </motion.div>
        <div className="hub__cameo">
          <Ranger7Cameo />
        </div>
      </header>

      {banner && (
        <motion.p
          className="hub__banner"
          role="status"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14 }}
        >
          {banner}
        </motion.p>
      )}

      <nav className="hub__fan" aria-label={t('ranger7.title')}>
        {stopMeta.map(({ id, Icon, tone }, i) => {
          const done = id === 'challenge' ? progress.completed : false
          return (
            <motion.button
              key={id}
              type="button"
              className={`hub__stop hub__stop--${tone}`}
              onClick={() => onOpenStop(id)}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.08 * i, type: 'spring', stiffness: 200, damping: 18 } }}
              whileHover={{ y: -8, scale: 1.06 }}
              whileTap={{ scale: 0.95, y: 4 }}
            >
              <span className="hub__stop-icon" aria-hidden="true">
                <Icon size={32} strokeWidth={2.6} />
              </span>
              <span className="hub__stop-index" aria-hidden="true">
                {i + 1}
              </span>
              <span className="hub__stop-label">
                <span className="hub__stop-title">{t(`ranger7.stops.${id}.title`)}</span>
                <span className="hub__stop-sub">{t(`ranger7.stops.${id}.sub`)}</span>
              </span>
              {done && <CircleCheck className="hub__stop-done" size={24} aria-hidden="true" />}
            </motion.button>
          )
        })}
      </nav>

      <footer className="hub__foot">
        <span>{t('ranger7.hub.note')}</span>
        {progress.bestScore !== null && (
          <span className="hub__score">
            {t('ranger7.challenge.score')}: {formatDigits(progress.bestScore)}/4
          </span>
        )}
      </footer>
    </main>
  )
}
