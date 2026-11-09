import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import './big-button.css'

interface BigButtonProps {
  children: ReactNode
  onClick: () => void
  icon?: ReactNode
  variant?: 'go' | 'calm'
}

/** The chunky, glossy, pressable button used for the one obvious action on a screen. */
export function BigButton({ children, onClick, icon, variant = 'go' }: BigButtonProps) {
  return (
    <motion.button
      type="button"
      className={`big-button big-button--${variant}`}
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.95, y: 4 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
    >
      <span className="big-button__shine" aria-hidden="true" />
      <span className="big-button__label">{children}</span>
      {icon && <span className="big-button__icon">{icon}</span>}
    </motion.button>
  )
}
