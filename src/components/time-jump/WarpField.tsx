import { useEffect, useRef } from 'react'

interface WarpFieldProps {
  /** The tunnel only flies while the jump is on screen. */
  active: boolean
}

interface Streak {
  /** Direction of the streak, in radians. */
  angle: number
  /** How far out it is, from 0 (centre) to 1 (edge of the screen). */
  radius: number
  /** How fast it flies outwards. */
  speed: number
  /** How long the streak is drawn. */
  length: number
  /** Colour of the streak. */
  tone: string
}

const TONES = [
  '255, 255, 255',
  '255, 255, 255',
  '255, 255, 255',
  '56, 225, 255',
  '143, 75, 240',
  '255, 212, 59',
]

/**
 * The warp tunnel the explorer flies through, drawn on a canvas.
 *
 * Nothing is downloaded: the stars are painted here, streaking out of the
 * middle of the screen. A canvas is used rather than hundreds of DOM nodes
 * because it stays smooth on the older phones, where a big animated video
 * used to stall.
 */
export function WarpField({ active }: WarpFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let width = 0
    let height = 0
    let frame = 0
    let last = 0
    const streaks: Streak[] = []

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const seed = () => {
      streaks.length = 0
      const count = width < 640 ? 150 : 260
      for (let index = 0; index < count; index += 1) {
        streaks.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.random(),
          speed: 0.35 + Math.random() * 0.75,
          length: 0.03 + Math.random() * 0.1,
          tone: TONES[Math.floor(Math.random() * TONES.length)],
        })
      }
    }

    /** The swirling gate the ship is flying into. */
    const drawGate = (cx: number, cy: number, radius: number, time: number) => {
      const spin = time * 0.0016
      const arcs: [number, string, number][] = [
        [spin, 'rgba(56, 225, 255, 0.55)', 5],
        [spin + 2.1, 'rgba(143, 75, 240, 0.5)', 7],
        [spin + 4.2, 'rgba(255, 212, 59, 0.35)', 3],
      ]
      for (const [offset, colour, lineWidth] of arcs) {
        context.strokeStyle = colour
        context.lineWidth = lineWidth
        context.beginPath()
        context.arc(cx, cy, radius, offset, offset + Math.PI * 1.1)
        context.stroke()
      }
    }

    const draw = (time: number) => {
      const cx = width / 2
      const cy = height * 0.54
      const reach = Math.hypot(width, height) * 0.62

      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'lighter'

      for (const streak of streaks) {
        const inner = streak.radius * reach
        const outer = Math.min(
          reach,
          inner + streak.length * reach * (0.3 + streak.radius * 1.4),
        )
        const alpha = Math.min(1, streak.radius * 2.2) * 0.8
        context.strokeStyle = `rgba(${streak.tone}, ${alpha.toFixed(3)})`
        context.lineWidth = 1 + streak.radius * 2.4
        context.beginPath()
        context.moveTo(
          cx + Math.cos(streak.angle) * inner,
          cy + Math.sin(streak.angle) * inner,
        )
        context.lineTo(
          cx + Math.cos(streak.angle) * outer,
          cy + Math.sin(streak.angle) * outer,
        )
        context.stroke()
      }

      drawGate(cx, cy, reach * 0.16, time)
      context.globalCompositeOperation = 'source-over'
    }

    resize()
    seed()

    if (!active) {
      // Idle: paint one quiet frame so the overlay is not a black hole.
      draw(0)
      return
    }

    if (reduceMotion) {
      // A still starfield: the jump is announced, not performed.
      draw(0)
      return
    }

    const tick = (time: number) => {
      const delta = last ? Math.min(0.05, (time - last) / 1000) : 0
      last = time
      for (const streak of streaks) {
        streak.radius += streak.speed * delta * (0.35 + streak.radius * 2.4)
        if (streak.radius > 1.05) {
          streak.radius = 0
          streak.angle = Math.random() * Math.PI * 2
        }
      }
      draw(time)
      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="jump__field"
      data-testid="warp-field"
      aria-hidden="true"
    />
  )
}
