import { describe, expect, it } from 'vitest'
import bible from './space-ghosts-story-bible.json'

/**
 * Milestone 1 only ships the story bible as content data, so it is not yet
 * rendered anywhere. These checks prove the file was copied across intact:
 * both languages kept, nothing summarised, editorial notes retained.
 */
interface Mission {
  id: string
  sequence: number
  name: Record<string, string>
  at_a_glance: Record<string, string>
  story_parts: { part: number; title: Record<string, string>; text: Record<string, string> }[]
  pandastein_question: Record<string, string>
  imagined_voice: Record<string, string>
  robot_voice_card: Record<string, string>
}

const story = bible as unknown as {
  schema_version: string
  document: { title: string; source_filename: string }
  campaign_overview: unknown[]
  missions: Mission[]
  editorial_verification_notes: {
    items_to_check: unknown[]
    known_conflicts_and_current_printing_decisions: unknown[]
  }
}

describe('Space Ghosts story bible content', () => {
  it('is the structured extraction of the source DOCX', () => {
    expect(story.schema_version).toBe('1.0.0')
    expect(story.document.source_filename).toContain('Space_Ghosts_Story_Bible_Detailed_Bangla')
    expect(story.document.title).toContain('বাংলা')
  })

  it('keeps all 17 machines in order, starting with Ranger 7 in 1964', () => {
    expect(story.missions).toHaveLength(17)
    expect(story.campaign_overview).toHaveLength(17)
    expect(story.missions.map((m) => m.sequence)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    )
    expect(story.missions[0].id).toBe('machine-01')
    expect(story.missions[0].name.en).toBe('Ranger 7')
    expect(story.missions[0].name.bn).toBeTruthy()
  })

  it('keeps seven story parts per mission, in English and Bangla', () => {
    for (const mission of story.missions) {
      expect(mission.story_parts, mission.id).toHaveLength(7)
      expect(mission.story_parts.map((p) => p.part)).toEqual([1, 2, 3, 4, 5, 6, 7])
      for (const part of mission.story_parts) {
        expect(part.text.en.trim(), `${mission.id} part ${part.part} en`).not.toBe('')
        expect(part.text.bn.trim(), `${mission.id} part ${part.part} bn`).not.toBe('')
      }
    }
  })

  it('keeps Bangla text alongside English in every bilingual field', () => {
    for (const mission of story.missions) {
      for (const field of [
        mission.name,
        mission.at_a_glance,
        mission.imagined_voice,
        mission.robot_voice_card,
      ]) {
        expect(field.en.trim(), mission.id).not.toBe('')
        expect(field.bn.trim(), mission.id).not.toBe('')
      }
      expect(mission.pandastein_question.answer_en.trim()).not.toBe('')
      expect(mission.pandastein_question.answer_bn.trim()).not.toBe('')
    }
  })

  it('retains the editorial verification notes rather than treating facts as verified', () => {
    expect(story.editorial_verification_notes.items_to_check.length).toBeGreaterThan(0)
    expect(
      story.editorial_verification_notes.known_conflicts_and_current_printing_decisions.length,
    ).toBeGreaterThan(0)
  })

  it('quotes the source text verbatim for the Ranger 7 opener', () => {
    const first = story.missions[0].story_parts[0]
    expect(first.text.en.startsWith('Once upon a time there was a little robot called Ranger 7.')).toBe(
      true,
    )
    // The Bangla column of this extraction repeats the part heading intentionally.
    expect(first.title.en).toBe(first.title.bn)
  })
})
