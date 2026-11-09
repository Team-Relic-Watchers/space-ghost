import type { DestinationKind } from '../../../content/ranger7/machines'
import { worldColours } from './colours'

interface PlanetArtProps {
  destination: DestinationKind
}

/**
 * The painted world behind a ghost, drawn in CSS rather than as an image so the
 * map carries no artwork dependency. Each world takes its own colour family
 * and a few surface marks; the ghost's own photograph, once that artwork
 * exists, is layered on top by GhostNode.
 */
export function PlanetArt({ destination }: PlanetArtProps) {
  const colours = worldColours(destination)

  return (
    <span className="planet" data-destination={destination} aria-hidden="true">
      <span
        className="planet__body"
        style={{
          background: `radial-gradient(circle at 32% 28%, #fff, ${colours.base} 52%, ${colours.shade})`,
        }}
      >
        <span className="planet__mark planet__mark--one" />
        <span className="planet__mark planet__mark--two" />
        <span className="planet__mark planet__mark--three" />
      </span>
      <span className="planet__glow" style={{ boxShadow: `0 0 34px 8px ${colours.glow}` }} />
    </span>
  )
}
