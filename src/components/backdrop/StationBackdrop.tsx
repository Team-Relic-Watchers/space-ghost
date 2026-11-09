import { Starfield } from './Starfield'
import { Earth, RingedPlanet } from './Planets'
import './backdrop.css'

interface StationBackdropProps {
  /** Show the station pillars and the glowing floor (Mission Control). */
  station?: boolean
}

/** Layered cosmic scene. Everything is decorative and hidden from assistive tech. */
export function StationBackdrop({ station = true }: StationBackdropProps) {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop__nebula backdrop__nebula--pink" />
      <div className="backdrop__nebula backdrop__nebula--cyan" />
      <div className="backdrop__nebula backdrop__nebula--violet" />
      <Starfield />
      <Earth className="backdrop__planet backdrop__planet--earth" />
      <RingedPlanet className="backdrop__planet backdrop__planet--ringed" />
      {station && (
        <>
          <div className="backdrop__beam" />
          <div className="backdrop__pillar backdrop__pillar--left" />
          <div className="backdrop__pillar backdrop__pillar--right" />
          <div className="backdrop__floor" />
        </>
      )}
    </div>
  )
}
