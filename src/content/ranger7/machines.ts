import { z } from 'zod'
import { storyBibleMissions } from '../storyBible'
import type { Bilingual } from '../storyBible'
import { ghostPhotos, GHOST_PHOTO_DIR } from './photos'

/**
 * The 17 machines of the campaign, read from the supplied story bible.
 *
 * The bible is the source of truth: names, years, the at-a-glance box and the
 * seven story parts all come from it verbatim. The Bible writes its destination
 * and ending lines in Bangla only, so this module derives the short English
 * forms and the two groupings the map needs — where a machine went, and how its
 * mission ended — without ever restating a fact the source does not already
 * carry.
 */

/** Where a machine went: the Moon, Mars, or the deep space beyond both. */
export type DestinationKind = 'moon' | 'mars' | 'deep'

/** How a machine's mission ended. The Bible groups these into four kinds. */
export type EndingKind = 'crashed' | 'silent' | 'returned' | 'talking' | 'retired'

export const bilingualSchema = z.object({
  en: z.string().min(1),
  bn: z.string().min(1),
})

export const machineSchema = z.object({
  /** 1-based position in the campaign. */
  sequence: z.number().int().positive(),
  /** Story bible id, e.g. "machine-01". */
  id: z.string().min(1),
  /** File name stem for the machine's photograph. */
  slug: z.string().min(1),
  name: bilingualSchema,
  /** Year of the mission, written in Bangla digits by the Bible. */
  year: z.string().min(1),
  /** The same year as a number, for Latin-digit formatting. */
  yearNumber: z.number().int().positive(),
  /** Destination line, in English and Bangla. */
  location: bilingualSchema,
  /** Ending line, in English and Bangla. */
  status: bilingualSchema,
  destination: z.enum(['moon', 'mars', 'deep']),
  ending: z.enum(['crashed', 'silent', 'returned', 'talking', 'retired']),
})

export type Machine = z.infer<typeof machineSchema>

export const machineDetailSchema = z.object({
  /** The Bible's "at a glance" box, as separate lines. */
  atAGlance: bilingualSchema,
  /** The seven story parts, in order, with the Bible's own bilingual titles. */
  parts: z.array(
    z.object({
      part: z.number().int().positive(),
      title: bilingualSchema,
      text: bilingualSchema,
    }),
  ),
  /** Pandastein's question for this machine, and the answer printed in the Bible. */
  question: bilingualSchema,
  answer: bilingualSchema,
  /** The machine's own "robot voice" card. */
  voice: bilingualSchema,
  /** The playful one-line voice from the Bible's recurring elements. */
  imaginedVoice: bilingualSchema,
})

export type MachineDetail = z.infer<typeof machineDetailSchema>

/** The Bible writes its endings in Bangla only. */
const ENDING_BY_BN: Record<string, EndingKind> = {
  'ইচ্ছে করে আছড়ে পড়ল': 'crashed',
  'চুপ হয়ে গেল': 'silent',
  'চুপ হয়ে গেল (উড়তে পারে না)': 'silent',
  'থেকে গেল': 'returned',
  'এখনও কথা বলছে': 'talking',
  'অবসর নিল': 'retired',
}

/** The Bible writes its destinations in Bangla only. */
const DESTINATION_BY_BN: Record<string, DestinationKind> = {
  'চাঁদ': 'moon',
  'মঙ্গল': 'mars',
  'মহাকাশের গভীরে': 'deep',
}

/** The short English destination the campaign uses everywhere else. */
const DESTINATION_EN: Record<DestinationKind, string> = {
  moon: 'The Moon',
  mars: 'Mars',
  deep: 'Deep space',
}

/** Fallback English endings, used only if the voice card has no status line. */
const ENDING_EN: Record<EndingKind, string> = {
  crashed: 'Crashed on purpose',
  silent: 'Gone quiet',
  returned: 'Came back',
  talking: 'Still talking',
  retired: 'Retired',
}

const BENGALI_DIGITS = '০১২৩৪৫৬৭৮৯'

/** The Bible writes years in Bangla digits; the map needs them as numbers. */
const latinDigits = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) => String(BENGALI_DIGITS.indexOf(digit)))

/** The English ending line is already written inside every robot voice card. */
const endingEnFromCard = (card: string): string | null => {
  const match = card.match(/Status:\s*([^.]+)\./)
  return match ? match[1].trim() : null
}

/** A URL-safe name stem, used for the photograph file name. */
const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const buildMachines = (): Machine[] =>
  storyBibleMissions.map((m) => {
    const destination = DESTINATION_BY_BN[m.location_bn]
    const ending = ENDING_BY_BN[m.status_bn]
    if (!destination) throw new Error(`Unknown destination in the story bible: ${m.location_bn}`)
    if (!ending) throw new Error(`Unknown ending in the story bible: ${m.status_bn}`)

    return machineSchema.parse({
      sequence: m.sequence,
      id: m.id,
      slug: slugify(m.name.en),
      name: m.name,
      year: m.year,
      yearNumber: Number(latinDigits(m.year)),
      location: { en: DESTINATION_EN[destination], bn: m.location_bn },
      status: {
        en: endingEnFromCard(m.robot_voice_card.en) ?? ENDING_EN[ending],
        bn: m.status_bn,
      },
      destination,
      ending,
    })
  })

/** All 17 machines, in campaign order. */
export const machines: Machine[] = buildMachines()

/** The machines grouped by where they went, in campaign order. */
export const machinesByDestination = machines.reduce<
  Record<DestinationKind, Machine[]>
>(
  (groups, machine) => {
    groups[machine.destination].push(machine)
    return groups
  },
  { moon: [], mars: [], deep: [] },
)

/** The full detail of each machine, keyed by its story bible id. */
export const machineDetails: Record<string, MachineDetail> = Object.fromEntries(
  storyBibleMissions.map((m) => [
    m.id,
    machineDetailSchema.parse({
      atAGlance: m.at_a_glance,
      parts: m.story_parts.map((p) => ({ part: p.part, title: p.title, text: p.text })),
      question: { en: m.pandastein_question.en, bn: m.pandastein_question.bn },
      answer: { en: m.pandastein_question.answer_en, bn: m.pandastein_question.answer_bn },
      voice: m.robot_voice_card,
      imaginedVoice: m.imagined_voice,
    }),
  ]),
)

/** The machine of a given sequence number, 1-based. */
export const machineAt = (sequence: number): Machine | undefined =>
  machines.find((m) => m.sequence === sequence)

/** Where the machine photographs live, grouped by the machine's slug. */
export { GHOST_PHOTO_DIR }

/** The real photograph that fills the machine's ring and hero panel. */
export const ghostPhoto = (machine: Machine): string =>
  ghostPhotos[machine.slug]?.hero.src ?? `${GHOST_PHOTO_DIR}/${machine.slug}.jpg`

/** Picks the language of a bilingual pair. */
export const pick = (pair: Bilingual, language: string): string =>
  language === 'bn' ? pair.bn : pair.en
