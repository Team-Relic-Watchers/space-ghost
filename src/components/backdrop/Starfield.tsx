import { useMemo } from 'react'
import { mulberry32 } from './random'

interface Star {
  x: number
  y: number
  size: number
  delay: number
  duration: number
  tone: 'white' | 'cyan' | 'pink' | 'sun'
}

const TONES: Star['tone'][] = ['white', 'white', 'white', 'cyan', 'pink', 'sun']

interface StarfieldProps {
  count?: number
  seed?: number
}

export function Starfield({ count = 70, seed = 7 }: StarfieldProps) {
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(seed)
    return Array.from({ length: count }, () => ({
      x: rand() * 100,
      y: rand() * 100,
      size: 2 + rand() * 4,
      delay: rand() * 4,
      duration: 2 + rand() * 3,
      tone: TONES[Math.floor(rand() * TONES.length)],
    }))
  }, [count, seed])

  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star star--${s.tone}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  )
}
