import { useId } from 'react'
import './pandastein.css'

interface PandasteinProps {
  className?: string
  /** Accessible name for the panda as a picture. */
  label?: string
}

/** Prof. Pandastein: an original panda scientist with a lab coat, goggles and a glowing collar. */
export function Pandastein({ className, label = 'Prof. Pandastein' }: PandasteinProps) {
  // Ids must be unique: the panda may be painted in more than one place at
  // once, and duplicated gradient ids would leave one coat unpainted.
  const uid = useId()
  const coat = `pan-coat-${uid}`
  const lens = `pan-lens-${uid}`

  return (
    <svg
      className={`pandastein ${className ?? ''}`}
      viewBox="0 0 260 340"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={coat} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d9ccff" />
        </linearGradient>
        <radialGradient id={lens} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#c8f6ff" />
          <stop offset="1" stopColor="#38e1ff" />
        </radialGradient>
      </defs>
      <ellipse cx="130" cy="326" rx="86" ry="10" fill="#170b3a" opacity="0.4" />
      <g stroke="#170b3a" strokeWidth="5" strokeLinejoin="round">
        <rect x="88" y="268" width="38" height="50" rx="16" fill="#2b1b5a" />
        <rect x="134" y="268" width="38" height="50" rx="16" fill="#2b1b5a" />
        <ellipse cx="104" cy="318" rx="26" ry="12" fill="#ff5ca8" />
        <ellipse cx="156" cy="318" rx="26" ry="12" fill="#ff5ca8" />
      </g>
      <g stroke="#170b3a" strokeWidth="5" strokeLinejoin="round">
        {/* Lab coat */}
        <path
          d="M64 292c-6-52-2-96 16-122 14-14 30-20 50-20s36 6 50 20c18 26 22 70 16 122z"
          fill={`url(#${coat})`}
        />
        <path d="M130 156v136" fill="none" />
        {/* Collar and glowing chest badge */}
        <path d="M96 156l34 36 34-36" fill="#ffffff" />
        <circle cx="168" cy="224" r="13" fill="#7dffb5" />
        <path d="M168 216v16M160 224h16" fill="none" stroke="#170b3a" strokeWidth="4" strokeLinecap="round" />
        {/* Pocket and pens */}
        <path d="M80 238h30v32H80z" fill="#efe9ff" />
        <path d="M88 228v14" stroke="#ff5ca8" strokeWidth="6" strokeLinecap="round" />
        <path d="M98 230v12" stroke="#ffd43b" strokeWidth="6" strokeLinecap="round" />
        {/* Bow tie */}
        <path d="M130 186l-20-10v20zM130 186l20-10v20z" fill="#ff5ca8" />
        <circle cx="130" cy="186" r="6" fill="#ffd43b" />
      </g>
      <g stroke="#170b3a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {/* Left arm rests at his side */}
        <path d="M70 178c-22 22-30 52-26 76" fill="none" stroke="#170b3a" strokeWidth="30" />
        <path d="M70 178c-22 22-30 52-26 76" fill="none" stroke={`url(#${coat})`} strokeWidth="20" />
        <circle cx="44" cy="258" r="15" fill="#2b1b5a" />
        {/* Right arm waves hello; the wrapper is animated in CSS */}
        <g className="pandastein__wave">
          <path d="M190 178c28 4 42-16 46-44" fill="none" stroke="#170b3a" strokeWidth="30" />
          <path d="M190 178c28 4 42-16 46-44" fill="none" stroke={`url(#${coat})`} strokeWidth="20" />
          <circle cx="238" cy="128" r="16" fill="#2b1b5a" />
        </g>
      </g>
      <g className="pandastein__head" stroke="#170b3a" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
        {/* Ears */}
        <circle cx="64" cy="64" r="26" fill="#2b1b5a" />
        <circle cx="196" cy="64" r="26" fill="#2b1b5a" />
        {/* Wild professor hair tufts */}
        <path d="M82 52c-14-14-8-30 6-30 4 8 10 12 18 14z" fill="#efe9ff" />
        <path d="M178 52c14-14 8-30-6-30-4 8-10 12-18 14z" fill="#efe9ff" />
        {/* Face */}
        <ellipse cx="130" cy="98" rx="76" ry="66" fill="#ffffff" />
        {/* Eye patches */}
        <path d="M80 96c-2-22 22-30 34-14 8 12 0 34-16 36-12 1-17-8-18-22z" fill="#2b1b5a" />
        <path d="M180 96c2-22-22-30-34-14-8 12 0 34 16 36 12 1 17-8 18-22z" fill="#2b1b5a" />
        {/* Eyes */}
        <g className="pandastein__eyes" stroke="none">
          <circle cx="98" cy="96" r="11" fill="#ffffff" />
          <circle cx="162" cy="96" r="11" fill="#ffffff" />
          <circle cx="100" cy="97" r="6" fill="#170b3a" />
          <circle cx="164" cy="97" r="6" fill="#170b3a" />
          <circle cx="102" cy="94" r="2.4" fill="#ffffff" />
          <circle cx="166" cy="94" r="2.4" fill="#ffffff" />
        </g>
        {/* Snout, nose, smile */}
        <ellipse cx="130" cy="124" rx="24" ry="17" fill="#efe9ff" />
        <path d="M120 116h20l-10 11z" fill="#2b1b5a" />
        <path d="M112 134q18 18 36 0" fill="#ff5ca8" />
        <circle cx="86" cy="124" r="8" fill="#ff5ca8" opacity="0.5" stroke="none" />
        <circle cx="174" cy="124" r="8" fill="#ff5ca8" opacity="0.5" stroke="none" />
        {/* Goggles pushed up on the forehead */}
        <path d="M70 56q60-22 120 0" fill="none" stroke="#2b1b5a" strokeWidth="12" />
        <circle cx="104" cy="50" r="19" fill={`url(#${lens})`} />
        <circle cx="156" cy="50" r="19" fill={`url(#${lens})`} />
        <path d="M94 44q4-6 12-6" fill="none" stroke="#ffffff" strokeWidth="4" />
        <path d="M146 44q4-6 12-6" fill="none" stroke="#ffffff" strokeWidth="4" />
      </g>
    </svg>
  )
}
