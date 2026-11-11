interface ShootingStarProps {
  className?: string
}

/**
 * The comet that sweeps over the title: a long fading trail with a bright
 * star at its tip.
 */
export function ShootingStar({ className }: ShootingStarProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 420 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="shooting-star-trail" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="shooting-star-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.5" stopColor="#ffd43b" />
          <stop offset="1" stopColor="#ff9f1c" />
        </radialGradient>
      </defs>

      <path
        d="M20 112C120 108 250 74 336 26"
        fill="none"
        stroke="url(#shooting-star-trail)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g className="shooting-star__glow">
        <circle cx="336" cy="26" r="17" fill="#ffd43b" opacity="0.35" />
      </g>
      <path
        className="shooting-star__star"
        d="M336 2l6.2 17.8L360 26l-17.8 6.2L336 50l-6.2-17.8L312 26l17.8-6.2z"
        fill="url(#shooting-star-core)"
      />
    </svg>
  )
}
