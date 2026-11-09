import { machines } from '../../content/ranger7/machines'
import type { Machine } from '../../content/ranger7/machines'

/**
 * Where each ghost sits on the map.
 *
 * The map is a tall field, not a row: the 17 machines snake down the height
 * and the dotted flight path links them in the order they were launched. The
 * student scrolls down the field to follow the journey.
 *
 * The horizontal position is a percentage of the stage, so the field keeps its
 * shape on any screen. The vertical position is in pixels, because a ghost is
 * a fixed size: it needs a fixed amount of room below the one above it.
 */

export interface GhostPlacement {
  machine: Machine
  /** Percentage position across the stage, 0-100. */
  x: number
  /** Position down the stage, in pixels. */
  y: number
}

export interface MapLayout {
  placements: GhostPlacement[]
  /** How tall the whole journey is, in pixels. */
  height: number
}

/**
 * The field mimics the reference art: the ghosts sit in loose bands that bob
 * up and down, so the journey reads as a winding trail through a galaxy
 * rather than as planets lined up on a ruler.
 *
 * Wide screens get three ghosts per band; narrow ones get two, so the labels
 * never crowd each other and nothing is clipped. Each column carries its own
 * vertical stagger (one ghost rides high, the next low), and every ghost adds
 * a small deterministic wobble so no two line up like a grid.
 */
const WIDE = {
  columns: [22, 50, 78],
  stagger: [-55, 48, -60],
  rowHeight: 300,
  padTop: 200,
  padBottom: 190,
}
const NARROW = {
  columns: [34, 70],
  stagger: [-42, 46],
  rowHeight: 280,
  padTop: 175,
  padBottom: 195,
}

/** Below this width the field switches to two ghosts per band. */
export const NARROW_BREAKPOINT = 640

/** The stage fits any screen, so it never needs to scroll sideways. */
export const MIN_STAGE_WIDTH = 300

/** Gentle, repeatable drift: the same ghost always lands on the same spot. */
const wobble = (index: number, amplitude: number) => Math.sin(index * 2.7 + 1) * amplitude

/**
 * Place every machine on the map for the given stage width. The order is the
 * campaign order; the coordinates make the line weave like a real flight path.
 */
export const getLayout = (stageWidth: number): MapLayout => {
  const field = stageWidth > 0 && stageWidth < NARROW_BREAKPOINT ? NARROW : WIDE
  const perRow = field.columns.length

  const placements: GhostPlacement[] = machines.map((machine, index) => {
    const row = Math.floor(index / perRow)
    const step = index % perRow
    // Every second band is walked back the other way.
    const across = row % 2 === 0 ? step : perRow - 1 - step
    // A band with a single ghost (the last one on phones) sits in the middle,
    // which leaves the bottom corners free for Pandastein.
    const alone = index === machines.length - 1 && machines.length % perRow === 1
    return {
      machine,
      // x is a percentage, y is pixels: the wobbles match their own units.
      x: alone ? 50 : field.columns[across] + wobble(index, 2),
      y:
        field.padTop +
        row * field.rowHeight +
        field.stagger[across] +
        wobble(index + 4, 20),
    }
  })

  const rows = Math.ceil(machines.length / perRow)
  const height = field.padTop + (rows - 1) * field.rowHeight + field.padBottom

  return { placements, height }
}

/**
 * The outer diameter of a ghost's ring, in pixels, for a given stage width.
 *
 * The map and the flight trail share this number: the rings are sized from it
 * and the dots stop exactly at its edge, so the chain always meets the planet
 * no matter how wide the screen is.
 */
export const getGhostRingSize = (stageWidth: number): number => {
  if (!(stageWidth > 0)) return 120
  return stageWidth < NARROW_BREAKPOINT
    ? Math.min(104, Math.max(74, stageWidth * 0.21))
    : Math.min(128, Math.max(88, stageWidth * 0.115))
}

export interface PathDot {
  x: number
  y: number
  /** Dot radius, in pixels. */
  r: number
  colour: string
  /** True for the soft halo drawn behind the dot. */
  glow?: boolean
}

/** Small candy-coloured dots, like the reference art's flight trail. */
const DOT_COLOURS = ['#ff5ca8', '#38e1ff', '#c9b8ff']
const DOT_RADII = [3.4, 2.7, 3.1]
/** Space between dot centres, in pixels. Phones get a tighter chain. */
const DOT_SPACING = { wide: 16, narrow: 13 }
/** How much wider the soft halo is than the dot itself. */
const DOT_GLOW_SCALE = 2.2

/** The chain starts/ends this far from a ghost's centre: its ring, plus a hair. */
const ringClearance = (stageWidth: number) => getGhostRingSize(stageWidth) / 2 + 5

interface CurveSample {
  x: number
  y: number
  /** Distance travelled along the curve from its start, in pixels. */
  d: number
}

/** The point at a given distance along a sampled curve. */
const pointAtDistance = (samples: CurveSample[], distance: number) => {
  const last = samples[samples.length - 1]
  if (distance <= 0) return samples[0]
  if (distance >= last.d) return last

  let low = 0
  let high = samples.length - 1
  while (low + 1 < high) {
    const mid = (low + high) >> 1
    if (samples[mid].d < distance) low = mid
    else high = mid
  }

  const before = samples[low]
  const after = samples[high]
  const span = after.d - before.d
  const t = span > 0 ? (distance - before.d) / span : 0
  return {
    x: before.x + (after.x - before.x) * t,
    y: before.y + (after.y - before.y) * t,
  }
}

/**
 * The flight trail: dots along a gentle arc between each pair of ghosts in
 * launch order, so the trail reads "1 to 2, 2 to 3, 3 to 4".
 *
 * Every hop is trimmed so it begins and ends exactly on the two rings, then
 * dotted evenly between those two edges. The chain therefore always touches
 * both planets, on wide screens and on phones alike.
 *
 * The stage is a fluid width, so the dots are computed in real pixels: the
 * caller passes the measured width and every dot lands on its ghosts.
 */
export const buildDots = (width: number, layout: MapLayout): PathDot[] => {
  if (layout.placements.length < 2 || width <= 0) return []

  const points = layout.placements.map((p) => ({
    x: (p.x / 100) * width,
    y: p.y,
  }))
  const narrow = width < NARROW_BREAKPOINT
  const clearance = ringClearance(width)
  const spacing = narrow ? DOT_SPACING.narrow : DOT_SPACING.wide
  const scale = narrow ? 0.9 : 1

  const dots: PathDot[] = []
  let colour = 0

  for (let seg = 0; seg < points.length - 1; seg++) {
    const a = points[seg]
    const b = points[seg + 1]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy)
    if (length <= clearance * 2 + 8) continue

    // A small bow, alternating direction, keeps the trail organic while
    // staying inside the two planets' own space.
    const bow = Math.min(46, length * 0.12) * (seg % 2 === 0 ? 1 : -1)
    const cx = (a.x + b.x) / 2 - (dy / length) * bow
    const cy = (a.y + b.y) / 2 + (dx / length) * bow

    // Sample the quadratic curve finely, keeping the distance travelled so the
    // dots can be measured in pixels rather than in curve parameter space.
    const steps = Math.max(24, Math.min(180, Math.ceil(length / 2)))
    const samples: CurveSample[] = [{ x: a.x, y: a.y, d: 0 }]
    let travelled = 0
    let prev = a
    for (let s = 1; s <= steps; s++) {
      const t = s / steps
      const u = 1 - t
      const x = u * u * a.x + 2 * u * t * cx + t * t * b.x
      const y = u * u * a.y + 2 * u * t * cy + t * t * b.y
      travelled += Math.hypot(x - prev.x, y - prev.y)
      samples.push({ x, y, d: travelled })
      prev = { x, y }
    }

    // Trim away the stretch hidden inside each planet's ring.
    let from = 0
    while (from < samples.length && Math.hypot(samples[from].x - a.x, samples[from].y - a.y) < clearance) from++
    let to = samples.length - 1
    while (to >= 0 && Math.hypot(samples[to].x - b.x, samples[to].y - b.y) < clearance) to--
    if (to <= from) continue

    const start = samples[from].d
    const span = samples[to].d - start
    if (span < spacing) continue

    // The first dot sits on one ring, the last on the other; in between they
    // are spread evenly, which makes the chain read as one continuous trail.
    const count = Math.max(1, Math.round(span / spacing))
    for (let i = 0; i <= count; i++) {
      const { x, y } = pointAtDistance(samples, start + (span * i) / count)

      // Never paint over a planet that is not one of this hop's two ends.
      const blocked = points.some(
        (p, pi) =>
          pi !== seg &&
          pi !== seg + 1 &&
          Math.hypot(x - p.x, y - p.y) < clearance + 4,
      )
      if (blocked) continue

      const c = colour % DOT_COLOURS.length
      colour++
      dots.push({
        x,
        y,
        r: DOT_RADII[c] * scale * DOT_GLOW_SCALE,
        colour: DOT_COLOURS[c],
        glow: true,
      })
      dots.push({ x, y, r: DOT_RADII[c] * scale, colour: DOT_COLOURS[c] })
    }
  }

  return dots
}
