import { useId } from 'react'

interface RocketProps {
  className?: string
  /** Accessible name for the rocket as a picture. */
  label?: string
}

/**
 * A rocket lifting off, trailing a flame and a ribbon of smoke.
 * Drawn so the home page needs no photograph of a launch.
 */
export function Rocket({ className, label = 'A rocket lifting off' }: RocketProps) {
  const uid = useId()
  const hull = `rocket-hull-${uid}`
  const flame = `rocket-flame-${uid}`
  const window = `rocket-window-${uid}`

  return (
    <svg className={className} viewBox="0 0 120 300" role="img" aria-label={label}>
      <defs>
        <linearGradient id={hull} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9dcf0" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="0.75" stopColor="#eef0fb" />
          <stop offset="1" stopColor="#b9bcd6" />
        </linearGradient>
        <linearGradient id={flame} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="0.35" stopColor="#ffb020" />
          <stop offset="0.75" stopColor="#ff6a1f" />
          <stop offset="1" stopColor="#ff3d6e" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={window} cx="36%" cy="30%" r="75%">
          <stop offset="0" stopColor="#d6f7ff" />
          <stop offset="0.55" stopColor="#5ec8f0" />
          <stop offset="1" stopColor="#1f6fc4" />
        </radialGradient>
      </defs>

      {/* Exhaust flame */}
      <g className="rocket__flame">
        <path
          d="M60 214c16 26 22 44 20 62-8-8-14-9-20-9s-12 1-20 9c-2-18 4-36 20-62z"
          fill={`url(#${flame})`}
        />
        <path
          d="M60 220c9 16 12 28 11 40-5-5-8-6-11-6s-6 1-11 6c-1-12 2-24 11-40z"
          fill="#fff6cf"
          opacity="0.9"
        />
      </g>

      {/* Fins */}
      <path d="M34 150c-14 16-18 36-16 58 10-6 18-8 24-6z" fill="#e03131" stroke="#170b3a" strokeWidth="4" strokeLinejoin="round" />
      <path d="M86 150c14 16 18 36 16 58-10-6-18-8-24-6z" fill="#e03131" stroke="#170b3a" strokeWidth="4" strokeLinejoin="round" />

      {/* Body */}
      <path
        d="M60 8c20 18 30 44 30 74v132H30V82C30 52 40 26 60 8z"
        fill={`url(#${hull})`}
        stroke="#170b3a"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />

      {/* Nose cone and the stripe around the middle */}
      <path d="M60 8c12 11 21 27 26 45H34c5-18 14-34 26-45z" fill="#ff5ca8" stroke="#170b3a" strokeWidth="4" strokeLinejoin="round" />
      <rect x="30" y="150" width="60" height="16" fill="#ffb020" stroke="#170b3a" strokeWidth="4" />

      {/* Window */}
      <circle cx="60" cy="110" r="19" fill={`url(#${window})`} stroke="#170b3a" strokeWidth="4" />
      <path d="M49 100a19 19 0 0 1 13-9" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.85" />

      {/* Engine bell */}
      <path d="M44 210h32l-6 14H50z" fill="#b9bcd6" stroke="#170b3a" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}
