import { describe, expect, it } from 'vitest'
import {
  canRead,
  isMicrosoftVoice,
  pickBestVoice,
  scriptOf,
  voiceFamily,
  voicesForLanguage,
} from './microsoftTts'

/** A voice of the device, made up for the test. */
const voice = (
  name: string,
  lang: string,
  extra: Partial<SpeechSynthesisVoice> = {},
): SpeechSynthesisVoice =>
  ({
    name,
    lang,
    default: false,
    localService: true,
    voiceURI: name,
    ...extra,
  }) as SpeechSynthesisVoice

const VOICES = [
  voice('Microsoft Zira', 'en-US', { default: true }),
  voice('Microsoft Guy Online (Natural) - English (United States)', 'en-US'),
  voice('Microsoft David Desktop - English (United States)', 'en-US'),
  voice('Google UK English Male', 'en-GB'),
  voice('Microsoft Ruhul Online (Natural) - Bengali (India)', 'bn-IN'),
  voice('Microsoft Nayan Online (Natural) - Bengali (India)', 'bn-IN'),
  voice('Google বাংলা', 'bn-IN'),
]

describe('the Microsoft voices of the device', () => {
  it('knows the plain name of a dressed up voice', () => {
    expect(voiceFamily('Microsoft Guy Online (Natural) - English (United States)')).toBe(
      'Microsoft Guy',
    )
    expect(voiceFamily('Microsoft David Desktop - English (United States)')).toBe(
      'Microsoft David',
    )
    expect(voiceFamily('Google বাংলা')).toBe('Google বাংলা')
  })

  it('knows which voices belong to Microsoft', () => {
    expect(isMicrosoftVoice(VOICES[0])).toBe(true)
    expect(isMicrosoftVoice(VOICES[3])).toBe(false)
  })

  it('finds the voices of a language, however the device spells it', () => {
    expect(voicesForLanguage(VOICES, 'bn')).toHaveLength(3)
    expect(voicesForLanguage(VOICES, 'en')).toHaveLength(4)
  })

  it('reads the story with a Microsoft voice when it can', () => {
    // Microsoft comes first, even when another maker has a man for the job.
    expect(pickBestVoice(VOICES, 'en')?.name).toBe(
      'Microsoft Guy Online (Natural) - English (United States)',
    )
  })

  it('reads Bangla with the Microsoft Bangla voice', () => {
    expect(pickBestVoice(VOICES, 'bn')?.name).toBe(
      'Microsoft Ruhul Online (Natural) - Bengali (India)',
    )
  })

  it('falls back to another voice only when Microsoft has none', () => {
    const withoutMicrosoft = VOICES.filter((candidate) => !isMicrosoftVoice(candidate))
    expect(pickBestVoice(withoutMicrosoft, 'en')?.name).toBe('Google UK English Male')
  })

  it('says nothing when the device has no voice for the language', () => {
    const englishOnly = VOICES.filter((candidate) => candidate.lang.startsWith('en'))
    expect(pickBestVoice(englishOnly, 'bn')).toBeNull()
  })
})

describe('the script of a line', () => {
  it('knows Bangla from English', () => {
    expect(scriptOf('প্যান্ডাস্টাইন গল্পটা পড়ছেন।')).toBe('bangla')
    expect(scriptOf('Pandastein reads the story.')).toBe('latin')
    expect(scriptOf('1977 — 42 %')).toBe('other')
  })

  it('never lets Bangla be read by an English voice', () => {
    const english = VOICES[0]
    const bangla = VOICES[4]

    expect(canRead(english, 'প্যান্ডাস্টাইন গল্পটা পড়ছেন।')).toBe(false)
    expect(canRead(bangla, 'প্যান্ডাস্টাইন গল্পটা পড়ছেন।')).toBe(true)
    // English words are fine for the Bangla voice.
    expect(canRead(bangla, 'Pandastein reads the story.')).toBe(true)
    expect(canRead(null, 'প্যান্ডাস্টাইন গল্পটা পড়ছেন।')).toBe(true)
  })
})
