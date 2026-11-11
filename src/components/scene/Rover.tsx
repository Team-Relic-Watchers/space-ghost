import { useId } from 'react'

interface RoverProps {
  className?: string
  /** Accessible name for the rover as a picture. */
  label?: string
}

/**
 * A six-wheeled rover on the red ground of Mars, with a camera mast and a
 * dish antenna. Drawn, so the home page needs no photograph.
 */
export function Rover({ className, label = 'A rover on Mars' }: RoverProps) {
  const uid = useId()
  const body = `rover-body-${uid}`
  const wheel = `rover-wheel-${uid}`

  return (
    <svg className={className} viewBox="0 0 320 200" role="img" aria-label={label}>
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f0e6dd" />
          <stop offset="1" stopColor="#c8b3a4" />
        </linearGradient>
        <radialGradient id={wheel} cx="38%" cy="32%" r="72%">
          <stop offset="0" stopColor="#6a6a78" />
          <stop offset="0.7" stopColor="#3b3b46" />
          <stop offset="1" stopColor="#1c1c24" />
        </radialGradient>
      </defs>

      {/* Mast with the camera head */}
      <rect x="150" y="34" width="10" height="46" fill="#c8b3a4" stroke="#170b3a" strokeWidth="4" />
      <rect x="128" y="10" width="54" height="30" rx="9" fill={`url(#${body})`} stroke="#170b3a" strokeWidth="4" />
      <circle cx="144" cy="25" r="7" fill="#2f8fd0" stroke="#170b3a" strokeWidth="3" />
      <circle cx="168" cy="25" r="7" fill="#2f8fd0" stroke="#170b3a" strokeWidth="3" />

      {/* Dish antenna */}
      <rect x="228" y="56" width="8" height="30" fill="#c8b3a4" stroke="#170b3a" strokeWidth="4" />
      <path d="M204 56a24 16 0 0 1 48 0z" fill="#e8e2f5" stroke="#170b3a" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="232" cy="46" r="4" fill="#ffd43b" stroke="#170b3a" strokeWidth="3" />

      {/* The chassis */}
      <path
        d="M62 82h196a12 12 0 0 1 12 12v40H50V94a12 12 0 0 1 12-12z"
        fill={`url(#${body})`}
        stroke="#170b3a"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <rect x="70" y="60" width="86" height="26" rx="9" fill="#ffb020" stroke="#170b3a" strokeWidth="4" />
      <rect x="176" y="60" width="64" height="26" rx="9" fill="#ff5ca8" stroke="#170b3a" strokeWidth="4" />

      {/* Robotic arm */}
      <path d="M96 134l-16 26 20 12" fill="none" stroke="#c8b3a4" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="80" cy="160" r="6" fill="#ffd43b" stroke="#170b3a" strokeWidth="3" />

      {/* Six wheels: three on the near side, three peeking behind */}
      <g>
        <circle cx="76" cy="146" r="15" fill="none" stroke="#170b3a" strokeWidth="4" opacity="0.45" />
        <circle cx="160" cy="146" r="15" fill="none" stroke="#170b3a" strokeWidth="4" opacity="0.45" />
        <circle cx="244" cy="146" r="15" fill="none" stroke="#170b3a" strokeWidth="4" opacity="0.45" />
      </g>
      <g stroke="#170b3a" strokeWidth="4">
        <circle cx="66" cy="164" r="20" fill={`url(#${wheel})`} />
        <circle cx="66" cy="164" r="7" fill="#8d8da0" />
        <circle cx="152" cy="164" r="20" fill={`url(#${wheel})`} />
        <circle cx="152" cy="164" r="7" fill="#8d8da0" />
        <circle cx="238" cy="164" r="20" fill={`url(#${wheel})`} />
        <circle cx="238" cy="164" r="7" fill="#8d8da0" />
      </g>
    </svg>
  )
}
