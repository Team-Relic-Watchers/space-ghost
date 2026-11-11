import type { Language } from '../game/store'

/**
 * Microsoft text to speech, seen from the browser.
 *
 * On Windows the Web Speech API is served by Microsoft: the voices of the
 * system itself ("Microsoft David", "Microsoft Zira") and, in Edge, the
 * natural voices that read online ("Microsoft Aria Online (Natural) - English
 * (United States)"). For Bangla the natural voices are "Microsoft Ruhul", a
 * man, and "Microsoft Nayan", a woman.
 *
 * This file knows three things: how to recognise a Microsoft voice, which
 * Microsoft voice should read the story, and how to tell that a piece of text
 * is written in a script the chosen voice cannot read.
 */

/** The Microsoft voices we like, best first. */
const MICROSOFT_VOICES: Record<Language, string[]> = {
  en: [
    // English has one voice of its own: Microsoft Mark reads the story.
    'Microsoft Mark',
    'Microsoft Guy',
    'Microsoft Andrew',
    'Microsoft Ryan',
    'Microsoft Brian',
    'Microsoft David',
    'Microsoft George',
    'Microsoft Thomas',
    'Microsoft Liam',
    'Microsoft Eric',
    'Microsoft Zira',
    'Microsoft Aria',
    'Microsoft Jenny',
    'Microsoft Emma',
    'Microsoft Sonia',
    'Microsoft Libby',
    'Microsoft Maisie',
    'Microsoft Michelle',
    'Microsoft Hazel',
  ],
  bn: [
    // The natural Bangla voices: Ruhul is the man, Nayan the woman.
    'Microsoft Ruhul',
    'Microsoft Nayan',
    'Microsoft Bangla',
  ],
}

/** Words in a voice name that promise a man. */
const MALE_HINT = /male|hemant|david|daniel|mark|george|alex|fred|brian|rishi|guy|ryan|ruhul|andrew|thomas|liam|eric|bob|freddie/i

/**
 * The plain family name of a voice.
 *
 * Edge dresses its voices up: 'Microsoft Aria Online (Natural) - English
 * (United States)' is simply 'Microsoft Aria'.
 */
export const voiceFamily = (name: string): string => {
  const [head] = name.split(' - ')
  return head
    .replace(/\s*\(Natural\)\s*$/i, '')
    .replace(/\s*Online\s*$/i, '')
    .replace(/\s*Desktop\s*$/i, '')
    .trim()
}

/** True when the voice comes from Microsoft. */
export const isMicrosoftVoice = (voice: SpeechSynthesisVoice): boolean =>
  /microsoft/i.test(voice.name) || /microsoft/i.test(voice.voiceURI)

/** The locale of a voice, written the same way for every voice. */
export const voiceLocale = (voice: SpeechSynthesisVoice): string =>
  voice.lang.toLowerCase().replace('_', '-')

/** Every voice that can read the language, however the device spells it. */
export const voicesForLanguage = (
  voices: SpeechSynthesisVoice[],
  language: Language,
): SpeechSynthesisVoice[] => {
  const prefix = language === 'bn' ? 'bn' : 'en'
  return voices.filter((voice) => voiceLocale(voice).startsWith(prefix))
}

/** The Microsoft voice with this name, when the device has it. */
export const findMicrosoftVoice = (
  voices: SpeechSynthesisVoice[],
  language: Language,
  name: string,
): SpeechSynthesisVoice | null => {
  const wanted = name.toLowerCase()
  return (
    voicesForLanguage(voices, language)
      .filter(isMicrosoftVoice)
      .find((voice) => voiceFamily(voice.name).toLowerCase() === wanted) ?? null
  )
}

/**
 * Every voice of the device that can read a language, Microsoft ones first.
 *
 * For Bangla this gathers all the voices that support the language — the
 * Microsoft ones and the others — so the reader can hear them all.
 */
export const collectedVoices = (
  voices: SpeechSynthesisVoice[],
  language: Language,
): SpeechSynthesisVoice[] => {
  const pool = voicesForLanguage(voices, language)
  const microsoft = pool.filter(isMicrosoftVoice)
  const others = pool.filter((voice) => !isMicrosoftVoice(voice))
  return [...microsoft, ...others]
}

/**
 * The voice the browser would use for this language on its own: the device's
 * default for it, or the first one it offers. The app does not second-guess
 * this choice for English, so the browser decides which voice reads the story.
 */
export const browserVoice = (
  voices: SpeechSynthesisVoice[],
  language: Language,
): SpeechSynthesisVoice | null => {
  const pool = voicesForLanguage(voices, language)
  return pool.find((voice) => voice.default) ?? pool[0] ?? null
}

/**
 * The voice that should read the story.
 *
 * Microsoft comes first: the app asks for Microsoft text to speech, so a
 * Microsoft voice always wins over another maker's voice. Only when the
 * device has no Microsoft voice for this language does the best of the rest
 * get the job.
 */
export const pickBestVoice = (
  voices: SpeechSynthesisVoice[],
  language: Language,
): SpeechSynthesisVoice | null => {
  const pool = voicesForLanguage(voices, language)
  if (!pool.length) return null

  const microsoft = pool.filter(isMicrosoftVoice)
  const wanted = MICROSOFT_VOICES[language].map((name) => name.toLowerCase())

  // 1. The Microsoft voice we asked for by name, best first.
  for (const name of wanted) {
    const match = microsoft.find(
      (voice) => voiceFamily(voice.name).toLowerCase() === name,
    )
    if (match) return match
  }

  // 2. Another Microsoft voice of this language: a man before a woman.
  const man = microsoft.find((voice) => MALE_HINT.test(voiceFamily(voice.name)))
  if (man) return man

  const other = microsoft.find((voice) => voice.default) ?? microsoft[0]
  if (other) return other

  // 3. No Microsoft voice here: the best of what the device does have.
  const anyMan = pool.find((voice) => MALE_HINT.test(voice.name))
  if (anyMan) return anyMan

  const google = pool.find((voice) => /google/i.test(voice.name))
  if (google) return google

  return pool.find((voice) => voice.default) ?? pool[0]
}

/** The scripts the app reads in. */
export type Script = 'bangla' | 'latin' | 'other'

const BANGLA = /[\u0980-\u09ff]/
const LATIN = /[A-Za-z]/

/** Which script a piece of text is written in. */
export const scriptOf = (text: string): Script => {
  if (BANGLA.test(text)) return 'bangla'
  if (LATIN.test(text)) return 'latin'
  return 'other'
}

/**
 * True when this voice can read this text.
 *
 * Bangla letters read by an English voice come out as noise, so such a line
 * is left unsaid rather than turned into gibberish.
 */
export const canRead = (
  voice: SpeechSynthesisVoice | null,
  text: string,
): boolean => {
  if (!voice) return true
  if (scriptOf(text) !== 'bangla') return true
  return voiceLocale(voice).startsWith('bn')
}
