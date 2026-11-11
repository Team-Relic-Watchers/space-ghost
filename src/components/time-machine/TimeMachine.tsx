import './time-machine.css'

interface TimeMachineProps {
  className?: string
}

/** The Time Machine: a chunky pod inside a spinning, glowing portal ring. */
export function TimeMachine({ className }: TimeMachineProps) {
  return (
    <svg
      className={`time-machine ${className ?? ''}`}
      viewBox="0 0 400 400"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="tm-portal" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#38e1ff" />
          <stop offset="0.75" stopColor="#8f4bf0" />
          <stop offset="1" stopColor="#2b1170" />
        </radialGradient>
        <linearGradient id="tm-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="1" stopColor="#ff8a1f" />
        </linearGradient>
        <linearGradient id="tm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5ca8" />
          <stop offset="0.5" stopColor="#ffd43b" />
          <stop offset="1" stopColor="#38e1ff" />
        </linearGradient>
      </defs>
      <circle className="time-machine__glow" cx="200" cy="190" r="190" fill="#38e1ff" opacity="0.16" />
      <circle cx="200" cy="190" r="150" fill="#8f4bf0" opacity="0.22" />
      <g className="time-machine__ring">
        <circle cx="200" cy="190" r="140" fill="none" stroke="#170b3a" strokeWidth="46" />
        <circle cx="200" cy="190" r="140" fill="none" stroke="url(#tm-ring)" strokeWidth="32" />
        <circle
          cx="200"
          cy="190"
          r="140"
          fill="none"
          stroke="#170b3a"
          strokeWidth="32"
          strokeDasharray="4 34"
          opacity="0.55"
        />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <circle
            key={deg}
            cx="200"
            cy="50"
            r="8"
            fill={deg % 90 === 0 ? '#ffffff' : '#170b3a'}
            transform={`rotate(${deg} 200 190)`}
          />
        ))}
      </g>
      <circle cx="200" cy="190" r="118" fill="url(#tm-portal)" stroke="#170b3a" strokeWidth="6" />
      <g className="time-machine__swirl" fill="none" strokeLinecap="round">
        <path d="M200 190m-20 0a20 20 0 1 1 20 20" stroke="#ffffff" strokeWidth="6" opacity="0.9" />
        <path d="M200 190m-48 0a48 48 0 1 1 48 48" stroke="#ffffff" strokeWidth="5" opacity="0.6" />
        <path d="M200 190m-80 0a80 80 0 1 1 80 80" stroke="#c8f6ff" strokeWidth="4" opacity="0.45" />
      </g>
      {/* Pedestal the ring stands on */}
      <g stroke="#170b3a" strokeWidth="6" strokeLinejoin="round">
        <path d="M120 330h160l24 44H96z" fill="url(#tm-hull)" />
        <rect x="150" y="318" width="100" height="20" rx="10" fill="#6a2bd1" />
        <circle cx="140" cy="352" r="6" fill="#170b3a" stroke="none" />
        <circle cx="200" cy="352" r="6" fill="#170b3a" stroke="none" />
        <circle cx="260" cy="352" r="6" fill="#170b3a" stroke="none" />
      </g>
      {/* Sparkles orbiting the portal */}
      <g className="time-machine__sparkles" fill="#ffffff">
        <path className="time-machine__sparkle" d="M60 90l5 14 14 5-14 5-5 14-5-14-14-5 14-5z" />
        <path className="time-machine__sparkle" d="M340 120l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
        <path className="time-machine__sparkle" d="M330 290l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
        <path className="time-machine__sparkle" d="M70 280l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
      </g>
    </svg>
  )
}
