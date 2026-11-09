/**
 * Typed access to the supplied story bible, used as content data.
 *
 * The file is preserved verbatim (see space-ghosts-story-bible.test.ts); this
 * module only describes the shape of the parts the game reads, in English and
 * Bangla. Nothing here rewrites, summarises or fact-corrects the source.
 */
import storyBible from './space-ghosts-story-bible.json'

/** A bilingual string pair exactly as it appears in the source JSON. */
export interface Bilingual {
  en: string
  bn: string
}

export interface StoryBiblePart {
  part: number
  title: Bilingual
  text: Bilingual
}

export interface StoryBibleMission {
  id: string
  sequence: number
  name: Bilingual
  year: string
  location_bn: string
  status_bn: string
  /** Mission File: launch, destination, cameras, photos, ending — as written. */
  at_a_glance: Bilingual
  story_parts: StoryBiblePart[]
  /** Pandastein's question and its printed answer. */
  pandastein_question: { en: string; answer_en: string; bn: string; answer_bn: string }
  imagined_voice: Bilingual
  robot_voice_card: Bilingual
}

export interface EditorialNotes {
  items_to_check: unknown[]
  known_conflicts_and_current_printing_decisions: unknown[]
}

export interface StoryBible {
  schema_version: string
  document: { title: string; source_filename: string; description: string }
  missions: StoryBibleMission[]
  editorial_verification_notes: EditorialNotes
}

export const storyBibleData = storyBible as unknown as StoryBible

/** All 17 machines, in the order the campaign visits them. */
export const storyBibleMissions = storyBibleData.missions

/** Ranger 7 is the first machine of the campaign. */
export const ranger7Story = storyBibleData.missions[0]

/** The source document carries unverified items; the UI repeats that caveat. */
export const hasEditorialCaveats =
  storyBibleData.editorial_verification_notes.items_to_check.length > 0 ||
  storyBibleData.editorial_verification_notes.known_conflicts_and_current_printing_decisions
    .length > 0
