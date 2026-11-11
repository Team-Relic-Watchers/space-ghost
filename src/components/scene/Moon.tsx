import { useId } from 'react'

interface MoonProps {
  className?: string
  /** Accessible name for the moon as a picture. */
  label?: string
}

/**
 * The Moon, seen close up: a cratered, blue-grey sphere lit from the upper
 * left. Drawn rather than photographed so the home page carries no artwork
 * dependency.
 */
export function Moon({ className, label = 'The Moon' }: MoonProps) {
  const uid = useId()
  const body = `moon-body-${uid}`
  const shade = `moon-shade-${uid}`

  return (
    <svg className={className} viewBox="0 0 200 200" role="img" aria-label={label}>
      <defs>
        <radialGradient id={body} cx="34%" cy="28%" r="78%">
          <stop offset="0" stopColor="#e9ecff" />
          <stop offset="0.42" stopColor="#b9bdea" />
          <stop offset="0.78" stopColor="#7d80b8" />
          <stop offset="1" stopColor="#4a4c80" />
        </radialGradient>
        <radialGradient id={shade} cx="72%" cy="76%" r="62%">
          <stop offset="0" stopColor="#241a52" stopOpacity="0.72" />
          <stop offset="0.72" stopColor="#241a52" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The soft halo the Moon throws into space */}
      <circle cx="100" cy="100" r="99" fill="#8fa6ff" opacity="0.16" />
      <circle cx="100" cy="100" r="92" fill="#a8bcff" opacity="0.12" />

      <circle cx="100" cy="100" r="84" fill={`url(#${body})`} />

      {/* Craters: a rim, a hollow, and a highlight on the lit side */}
      <g>
        <circle cx="72" cy="62" r="19" fill="#8b8ec4" opacity="0.75" />
        <circle cx="72" cy="62" r="19" fill="none" stroke="#5c5f96" strokeWidth="2.5" />
        <path d="M58 54a19 19 0 0 1 15-8" fill="none" stroke="#dfe3ff" strokeWidth="3" opacity="0.7" />

        <circle cx="126" cy="52" r="11" fill="#9497cb" opacity="0.7" />
        <circle cx="126" cy="52" r="11" fill="none" stroke="#5c5f96" strokeWidth="2" />

        <circle cx="138" cy="106" r="24" fill="#8b8ec4" opacity="0.7" />
        <circle cx="138" cy="106" r="24" fill="none" stroke="#5c5f96" strokeWidth="2.5" />
        <path d="M120 94a24 24 0 0 1 18-8" fill="none" stroke="#dfe3ff" strokeWidth="3" opacity="0.6" />

        <circle cx="60" cy="112" r="13" fill="#9497cb" opacity="0.6" />
        <circle cx="60" cy="112" r="13" fill="none" stroke="#5c5f96" strokeWidth="2" />

        <circle cx="100" cy="146" r="17" fill="#8285bb" opacity="0.65" />
        <circle cx="100" cy="146" r="17" fill="none" stroke="#5c5f96" strokeWidth="2" />

        <circle cx="160" cy="148" r="9" fill="#9497cb" opacity="0.55" />
        <circle cx="46" cy="86" r="7" fill="#9497cb" opacity="0.5" />
        <circle cx="96" cy="30" r="6" fill="#9497cb" opacity="0.45" />
      </g>

      {/* The night side, so the sphere reads as a ball and not a disc */}
      <circle cx="100" cy="100" r="84" fill={`url(#${shade})`} />
    </svg>
  )
}
