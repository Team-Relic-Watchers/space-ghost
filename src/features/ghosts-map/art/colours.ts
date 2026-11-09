import type { EndingKind } from '../../../content/ranger7/machines'

/**
 * The colours of each world: the Moon, Mars, and the deep space beyond.
 */
const WORLD_COLOURS: Record<string, { base: string; shade: string; glow: string }> = {
  moon: { base: '#cfc9e8', shade: '#8f88b8', glow: 'rgba(207, 201, 232, 0.45)' },
  mars: { base: '#e8813f', shade: '#a8401f', glow: 'rgba(232, 129, 63, 0.5)' },
  deep: { base: '#8f4bf0', shade: '#3d1470', glow: 'rgba(143, 75, 240, 0.55)' },
}

/**
 * The ring colour of each ending: still talking, at rest, silent, retired.
 */
const ENDING_COLOURS: Record<EndingKind, string> = {
  talking: '#7dffb5',
  returned: '#38e1ff',
  crashed: '#ffd43b',
  silent: '#ff5ca8',
  retired: '#c9b8ff',
}

/** The colour that marks how a machine's mission ended. */
export const endingColour = (ending: EndingKind): string => ENDING_COLOURS[ending]

/** The colours of the world a machine visited. */
export const worldColours = (destination: string) => WORLD_COLOURS[destination]
