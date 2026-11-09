import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDigits, formatNumber, formatYear } from '../../i18n'
import { useGameStore } from '../../game/store'
import { pick } from '../../content/ranger7/machines'
import { ghostPhotos } from '../../content/ranger7/photos'
import { endingColour } from './art/colours'
import { PlanetArt } from './art/PlanetArt'
import type { GhostPlacement } from './mapLayout'

interface GhostNodeProps {
  placement: GhostPlacement
  /** True when this ghost's card is open. */
  active: boolean
  onOpen: (sequence: number) => void
}

/**
 * One ghost on the map: the world it visited, its number, its name, its year
 * and where it went. Clicking opens the machine's detail.
 */
export function GhostNode({ placement, active, onOpen }: GhostNodeProps) {
  const { t } = useTranslation()
  const language = useGameStore((s) => s.language)
  const { machine } = placement
  const stars = useGameStore((s) => s.quizStars[machine.id] ?? 0)
  const name = pick(machine.name, language)
  const year = formatYear(machine.yearNumber, language)
  const location = pick(machine.location, language)

  return (
    <motion.button
      type="button"
      className="ghost"
      style={{ left: `${placement.x}%`, top: `${placement.y}px` }}
      data-active={active}
      data-destination={machine.destination}
      data-ending={machine.ending}
      onClick={() => onOpen(machine.sequence)}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.05 * machine.sequence }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t('ghostsMap.nodeLabel', {
        name,
        year,
        location,
      })}
    >
      <span className="ghost__ring" style={{ borderColor: endingColour(machine.ending) }}>
        <PlanetArt destination={machine.destination} />
        <img
          className="ghost__photo"
          src={ghostPhotos[machine.slug].cartoon.src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </span>

      <span className="ghost__number">{formatDigits(machine.sequence)}</span>

      {stars > 0 && (
        <span className="ghost__stars" aria-hidden="true">
          <Star size={13} fill="currentColor" />
          {formatNumber(stars, language)}
        </span>
      )}

      <span className="ghost__label">
        <span className="ghost__name">{name}</span>
        <span className="ghost__year">{year}</span>
        <span className="ghost__where">{location}</span>
      </span>
    </motion.button>
  )
}
