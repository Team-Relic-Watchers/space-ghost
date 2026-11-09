import { Ranger7Explorer } from './explorer/Ranger7Explorer'
import './ranger7.css'

/**
 * Mission 1. One screen, two halves: the interactive Ranger 7 model and the
 * educational experience share the viewport. See Ranger7Explorer for the
 * desktop two-column and mobile tabbed layouts.
 */
export function Ranger7Experience() {
  return <Ranger7Explorer />
}
