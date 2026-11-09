import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Pandastein } from '../../components/mascot/Pandastein'
import './ask-panda.css'

interface AskPandaProps {
  /** The question the card shows above Pandastein's head. */
  question: string
}

/**
 * Pandastein stands beside the journey and invites the student in. The
 * question floats above him as a comic panel, so it reads as part of the
 * cartoon rather than as a dialog box.
 */
export function AskPanda({ question }: AskPandaProps) {
  const { t } = useTranslation()

  return (
    <motion.aside
      className="ask-panda"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.2 }}
    >
      <motion.div
        className="ask-panda__card"
        initial={{ opacity: 0, y: 18, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.45 }}
      >
        <p className="ask-panda__question">{question}</p>
        <span className="ask-panda__hint">{t('ghostsMap.askHint')}</span>
      </motion.div>

      <motion.div
        className="ask-panda__figure"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 16, delay: 0.3 }}
      >
        <Pandastein className="ask-panda__art" />
      </motion.div>
    </motion.aside>
  )
}
