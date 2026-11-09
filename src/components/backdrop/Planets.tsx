/** Cartoon Earth with a soft atmosphere glow. */
export function Earth({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="earth-sea" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#7be8ff" />
          <stop offset="0.55" stopColor="#2f8dff" />
          <stop offset="1" stopColor="#2a2bb8" />
        </radialGradient>
        <clipPath id="earth-clip">
          <circle cx="100" cy="100" r="82" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="#38e1ff" opacity="0.22" />
      <circle cx="100" cy="100" r="82" fill="url(#earth-sea)" />
      <g clipPath="url(#earth-clip)" stroke="#170b3a" strokeWidth="3">
        <path
          d="M40 70c14-22 40-26 52-12 8 10-6 20-4 32 2 12-14 18-24 10-10-8-34-8-24-30z"
          fill="#7dffb5"
        />
        <path
          d="M120 110c16-10 40-4 44 14 3 16-14 38-30 40-14 2-12-16-20-24-8-8-6-22 6-30z"
          fill="#7dffb5"
        />
        <path d="M60 150c14-4 24 4 18 12-8 8-26 2-18-12z" fill="#7dffb5" />
        <path d="M108 38c14-4 30 0 34 8-12 4-26 6-34-8z" fill="#fff" />
        <path d="M30 118c10-6 22-4 24 4-10 6-20 6-24-4z" fill="#fff" />
      </g>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#170b3a" strokeWidth="5" />
      <ellipse cx="72" cy="58" rx="16" ry="9" fill="#fff" opacity="0.5" transform="rotate(-30 72 58)" />
    </svg>
  )
}

/** Small ringed planet for depth. */
export function RingedPlanet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 140" aria-hidden="true">
      <defs>
        <radialGradient id="ringed-body" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffb3dc" />
          <stop offset="0.6" stopColor="#ff5ca8" />
          <stop offset="1" stopColor="#a02a8f" />
        </radialGradient>
      </defs>
      <path d="M12 82C20 54 90 36 160 52" fill="none" stroke="#170b3a" strokeWidth="16" strokeLinecap="round" />
      <path d="M12 82C20 54 90 36 160 52" fill="none" stroke="#ffd43b" strokeWidth="8" strokeLinecap="round" />
      <circle cx="100" cy="70" r="44" fill="url(#ringed-body)" stroke="#170b3a" strokeWidth="5" />
      <path d="M60 72C80 96 128 102 156 78" fill="none" stroke="#170b3a" strokeWidth="16" strokeLinecap="round" />
      <path d="M60 72C80 96 128 102 156 78" fill="none" stroke="#ffd43b" strokeWidth="8" strokeLinecap="round" />
      <circle cx="86" cy="54" r="7" fill="#fff" opacity="0.45" />
    </svg>
  )
}
