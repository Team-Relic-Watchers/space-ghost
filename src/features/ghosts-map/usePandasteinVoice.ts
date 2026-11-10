import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../../game/store'
import type { Language } from '../../game/store'
import { spaceMusic } from '../../audio/spaceMusic'
import {
  canRead,
  collectedVoices,
  findMicrosoftVoice,
  isMicrosoftVoice,
  pickBestVoice,
  voicesForLanguage,
} from '../../audio/microsoftTts'

/**
 * Pandastein's storytelling voice.
 *
 * The browser speaks for us: the Web Speech API needs no key, no upload and
 * no new dependency, and on Windows it *is* Microsoft text to speech. English
 * is read by one voice, Microsoft Mark, and Bangla by any voice of the device
 * that supports the language — the Microsoft ones first.
 *
 * The last rule matters most: a line is only ever spoken by a voice that can
 * read it. Bangla letters in an English voice, or the wrong language on the
 * utterance, would be gibberish, so the reader hears silence instead.
 */

/** The locale we ask the browser for when a voice cannot tell us better. */
const LOCALE: Record<Language, string> = { en: 'en-US', bn: 'bn-IN' }

/**
 * The voice of each language.
 *
 * English has one voice of its own. Bangla has many: every voice of the
 * device that speaks it is collected, so the reader can hear them all.
 */
const FIXED_VOICE: Record<Language, string | null> = {
  en: 'Microsoft Mark',
  bn: null,
}

/** How excited the professor sounds in each language. */
const TONE: Record<Language, { rate: number; pitch: number }> = {
  en: { rate: 0.82, pitch: 1.12 },
  bn: { rate: 0.78, pitch: 1.02 },
}

/** A short breath between two sentences. */
const BREATH_MS = 120

/** How often the reader is asked whether the voice may carry on. */
const HOLD_MS = 150

/**
 * Chrome stops talking after about fifteen seconds, so the story is read in
 * short breaths instead of one long paragraph. Bangla sentences are long,
 * and they must not be cut off.
 */
const MAX_CHUNK = 110

/** The story, broken into short sentences and then into short breaths. */
const splitSentences = (text: string): string[] => {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?।])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const chunks: string[] = []

  for (const sentence of sentences) {
    if (sentence.length <= MAX_CHUNK) {
      chunks.push(sentence)
      continue
    }

    // A long sentence is broken at its commas and dashes first.
    const pieces = sentence.split(/(?<=[,;:—–])\s+/)
    let current = ''
    for (const piece of pieces) {
      if (!current) {
        current = piece
        continue
      }
      if (current.length + piece.length + 1 <= MAX_CHUNK) {
        current += ` ${piece}`
        continue
      }
      chunks.push(current)
      current = piece
    }

    if (!current) continue

    // Still too long: cut it at a word, never inside one.
    let rest = current
    while (rest.length > MAX_CHUNK) {
      const cut = rest.lastIndexOf(' ', MAX_CHUNK)
      if (cut <= 0) {
        // A single word longer than a breath: say it whole rather than mangle
        // it into nonsense.
        chunks.push(rest.trim())
        rest = ''
        break
      }
      chunks.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut).trim()
    }
    if (rest) chunks.push(rest)
  }

  return chunks
}

export interface PandasteinVoice {
  /** True when the browser can speak at all. */
  supported: boolean
  /** True when the reader wants the story read aloud while scrolling. */
  enabled: boolean
  /** The part that is talking right now, if any. */
  speakingId: number | null
  /** The voices this device offers for the current language. */
  voices: SpeechSynthesisVoice[]
  /** The voice we are using now. */
  voice: SpeechSynthesisVoice | null
  /** True when the voice in use comes from Microsoft text to speech. */
  microsoft: boolean
  /** True when this device knows any Microsoft voice at all. */
  microsoftAvailable: boolean
  /** True when the voice of this language cannot be changed. */
  fixed: boolean
  /** True while the reader holds the voice. */
  paused: boolean
  /** True when the device has no voice for this language at all. */
  missing: boolean
  /** Reads one part aloud, replacing whatever was talking before. */
  speak: (id: number, text: string) => void
  /** Stops the voice at once. */
  stop: () => void
  /** Holds the voice where it is. */
  pause: () => void
  /** Carries the voice on from where it stopped. */
  resume: () => void
  /** Turns the reading on or off. */
  toggle: () => void
  /** Uses the voice the reader picked. */
  choose: (name: string) => void
}

/** Gives Pandastein a Microsoft, calm, bilingual voice. */
export function usePandasteinVoice(language: Language): PandasteinVoice {
  const enabled = useGameStore((state) => state.voiceEnabled)
  const setVoiceEnabled = useGameStore((state) => state.setVoiceEnabled)
  const voiceChoice = useGameStore((state) => state.voiceChoice)
  const setVoiceChoice = useGameStore((state) => state.setVoiceChoice)

  const [speakingId, setSpeakingId] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  /** Every new reading gets its own number, so an old one can be ignored. */
  const run = useRef(0)
  const breath = useRef<number | null>(null)
  /** Which part is talking, kept beside React so stale events can be ignored. */
  const speaking = useRef<number | null>(null)
  /** True while the reader holds the voice. */
  const held = useRef(false)
  /** The lines of the reading now, so a hold can carry on from here. */
  const lines = useRef<string[]>([])
  /** Which line is being read. */
  const index = useRef(0)
  /** The next line of the reading, kept beside React. */
  const step = useRef<(() => void) | null>(null)

  const supported =
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'

  const markSpeaking = useCallback((id: number | null) => {
    speaking.current = id
    setSpeakingId(id)
  }, [])

  // The list of voices often arrives a moment after the page does.
  useEffect(() => {
    if (!supported) return
    const synth = window.speechSynthesis
    const load = () => setVoices(synth.getVoices())
    load()
    synth.addEventListener('voiceschanged', load)
    // Microsoft voices often arrive late: ask again a few times.
    const timers = [200, 700, 1500, 3000].map((delay) =>
      window.setTimeout(load, delay),
    )
    return () => {
      synth.removeEventListener('voiceschanged', load)
      for (const timer of timers) window.clearTimeout(timer)
    }
  }, [supported])

  const languageVoices = useMemo(
    () => collectedVoices(voices, language),
    [language, voices],
  )

  // The voice of the language: the fixed one, or the one the reader picked.
  const voice = useMemo(() => {
    const fixed = FIXED_VOICE[language]
    if (fixed) {
      const mark = findMicrosoftVoice(voices, language, fixed)
      if (mark) return mark
      return pickBestVoice(voices, language)
    }
    const picked = voiceChoice[language]
    const match = languageVoices.find((candidate) => candidate.name === picked)
    if (match) return match
    return pickBestVoice(voices, language)
  }, [language, languageVoices, voiceChoice, voices])

  const stop = useCallback(() => {
    run.current += 1
    held.current = false
    setPaused(false)
    if (breath.current !== null) {
      window.clearTimeout(breath.current)
      breath.current = null
    }
    if (supported) window.speechSynthesis.cancel()
    // The music goes with the voice.
    spaceMusic.pause()
    markSpeaking(null)
  }, [markSpeaking, supported])

  const speak = useCallback(
    (id: number, text: string) => {
      if (!supported) return

      const synth = window.speechSynthesis
      run.current += 1
      const current = run.current
      synth.cancel()
      held.current = false
      setPaused(false)
      markSpeaking(id)

      const spoken = splitSentences(text)
      lines.current = spoken
      index.current = 0
      if (!spoken.length) {
        markSpeaking(null)
        return
      }

      // Ask the browser again: the list may have grown since the last render.
      const fresh = synth.getVoices()
      const freshForLanguage = voicesForLanguage(fresh, language)
      if (fresh.length > 0 && freshForLanguage.length === 0) {
        // The device has voices, but none in this language. Reading the words
        // with the wrong voice is only gibberish, so we stay quiet.
        markSpeaking(null)
        return
      }

      const fixed = FIXED_VOICE[language]
      const picked = fixed ? null : voiceChoice[language]
      const pickedVoice = picked
        ? fresh.find((candidate) => candidate.name === picked)
        : undefined
      // A voice from another language is never used, even if it was picked.
      const usablePick =
        pickedVoice && voicesForLanguage([pickedVoice], language).length
          ? pickedVoice
          : undefined
      const chosen =
        usablePick ??
        (fixed ? findMicrosoftVoice(fresh, language, fixed) : null) ??
        (fresh.length ? pickBestVoice(fresh, language) : null) ??
        voice
      const tone = TONE[language]

      // The music comes up under the voice, low and quiet.
      spaceMusic.play()

      const next = () => {
        if (current !== run.current) return

        // The reader is holding the voice: wait for them.
        if (held.current) {
          breath.current = window.setTimeout(next, HOLD_MS)
          return
        }

        if (index.current >= lines.current.length) {
          spaceMusic.pause()
          markSpeaking(null)
          return
        }

        const line = lines.current[index.current]
        index.current += 1

        // A line written in Bangla must not be read by an English voice.
        if (!canRead(chosen, line)) {
          next()
          return
        }

        const utterance = new SpeechSynthesisUtterance(line)
        // The voice brings its own language with it, so the browser never
        // guesses and mispronounces.
        utterance.lang = chosen?.lang ?? LOCALE[language]
        if (chosen) {
          // A browser that refuses the voice still has something to say.
          try {
            utterance.voice = chosen
          } catch {
            /* keep the default voice */
          }
        }
        // A story teller leans in on one sentence and hurries on the next.
        const beat = index.current % 3
        utterance.pitch = tone.pitch + (beat === 1 ? 0.12 : beat === 2 ? -0.07 : 0)
        utterance.rate = tone.rate + (beat === 2 ? 0.05 : 0)
        utterance.volume = 1
        utterance.onend = () => {
          if (current !== run.current) return
          breath.current = window.setTimeout(next, BREATH_MS)
        }
        utterance.onerror = () => {
          if (current !== run.current) return
          // A held voice is not a broken one.
          if (held.current) return
          if (speaking.current === id) {
            spaceMusic.pause()
            markSpeaking(null)
          }
        }

        synth.speak(utterance)
      }

      step.current = next
      next()
    },
    [language, markSpeaking, supported, voice, voiceChoice],
  )

  const pause = useCallback(() => {
    if (!supported) return
    held.current = true
    setPaused(true)

    if (typeof window.speechSynthesis.pause === 'function') {
      window.speechSynthesis.pause()
    } else {
      // This browser cannot hold a voice: stop it here and carry on with the
      // next sentence when the reader asks.
      window.speechSynthesis.cancel()
      index.current += 1
    }

    spaceMusic.pause()
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    held.current = false
    setPaused(false)

    if (typeof window.speechSynthesis.resume === 'function') {
      window.speechSynthesis.resume()
    } else {
      step.current?.()
    }

    spaceMusic.play()
  }, [supported])

  // A new language means a new voice, so the old one stops. The cleanup also
  // runs when the page is closed, so Pandastein never keeps talking.
  useEffect(
    () => () => {
      run.current += 1
      held.current = false
      if (breath.current !== null) {
        window.clearTimeout(breath.current)
        breath.current = null
      }
      spaceMusic.pause()
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    },
    [language],
  )

  const toggle = useCallback(() => {
    if (enabled) stop()
    setVoiceEnabled(!enabled)
  }, [enabled, setVoiceEnabled, stop])

  const choose = useCallback(
    (name: string) => {
      setVoiceChoice(language, name)
    },
    [language, setVoiceChoice],
  )

  return {
    supported,
    enabled,
    speakingId,
    voices: languageVoices,
    voice,
    microsoft: voice ? isMicrosoftVoice(voice) : false,
    microsoftAvailable: voices.some((candidate) => isMicrosoftVoice(candidate)),
    fixed: FIXED_VOICE[language] !== null,
    paused,
    // Only a real "no voice for this language" once the list has arrived.
    missing: supported && voices.length > 0 && languageVoices.length === 0,
    speak,
    stop,
    pause,
    resume,
    toggle,
    choose,
  }
}
