import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { GhostsMap } from './GhostsMap'

interface Spoken {
  text: string
  lang: string
  voice: string | null
  pitch: number
  rate: number
}

const spoken: Spoken[] = []

/** The voices our browser pretends to have. */
const VOICES = [
  { name: 'Microsoft Zira', lang: 'en-US', default: true, localService: true, voiceURI: 'zira' },
  { name: 'Microsoft Guy Online (Natural) - English (United States)', lang: 'en-US', default: false, localService: false, voiceURI: 'Microsoft_Guy_Online' },
  { name: 'Google UK English Male', lang: 'en-GB', default: false, localService: false, voiceURI: 'guk' },
  { name: 'Microsoft Ruhul Online (Natural) - Bengali (India)', lang: 'bn-IN', default: false, localService: false, voiceURI: 'Microsoft_Ruhul_Online' },
  { name: 'Google বাংলা', lang: 'bn-IN', default: false, localService: false, voiceURI: 'gbn' },
]

class FakeUtterance {
  text: string
  lang = ''
  voice: (typeof VOICES)[number] | null = null
  pitch = 1
  rate = 1
  volume = 1
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

/** A tiny Web Audio stand-in, so the space bed can be tested. */
class FakeAudioContext {
  state = 'running'
  sampleRate = 48000
  destination = {}
  closed = false
  private readonly born = Date.now()

  /** The clock of the test, so the music scheduler keeps moving. */
  get currentTime() {
    return (Date.now() - this.born) / 1000
  }

  private node() {
    const param = {
      value: 0,
      cancelScheduledValues: () => {},
      setValueAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    }
    return {
      gain: { ...param },
      frequency: { ...param },
      Q: { ...param },
      delayTime: { ...param },
      detune: { ...param },
      playbackRate: { ...param },
      type: '',
      connect: () => this.node(),
      start: () => {},
      stop: () => {},
      buffer: null,
      loop: false,
    }
  }

  createGain() {
    return this.node()
  }
  createBiquadFilter() {
    return this.node()
  }
  createOscillator() {
    return this.node()
  }
  createDelay() {
    return this.node()
  }
  createBufferSource() {
    return this.node()
  }
  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) }
  }
  resume() {
    this.state = 'running'
    return Promise.resolve()
  }
  close() {
    this.closed = true
    return Promise.resolve()
  }
}

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void

const observers: { callback: ObserverCallback; targets: Element[] }[] = []

class FakeObserver {
  private readonly record: { callback: ObserverCallback; targets: Element[] }

  constructor(callback: ObserverCallback) {
    this.record = { callback, targets: [] }
    observers.push(this.record)
  }

  observe(target: Element) {
    this.record.targets.push(target)
  }

  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

/** Pretends the reader scrolled one story part into the middle of the page. */
const scrollToPart = (part: number) => {
  for (const observer of observers) {
    const entries = observer.targets
      .filter((target) => target.getAttribute('data-part') === String(part))
      .map(
        (target) =>
          ({
            target,
            isIntersecting: true,
            intersectionRatio: 0.9,
          }) as IntersectionObserverEntry,
      )
    if (entries.length) {
      observer.callback(entries, observer as unknown as IntersectionObserver)
    }
  }
}

const renderMap = () =>
  render(
    <MemoryRouter>
      <GhostsMap />
    </MemoryRouter>,
  )

/**
 * Opens Voyager 1's story. Tapping a ghost plays its time jump first, so the
 * card only appears once the jump has landed.
 */
const openStory = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))
  const jump = screen.getByTestId('time-jump')
  await waitFor(() => expect(jump).toHaveAttribute('data-active', 'true'))
  fireEvent(jump.querySelector('video')!, new Event('ended'))
  return screen.getByRole('dialog', { name: /voyager 1/i })
}

describe("Pandastein's voice", () => {
  beforeEach(async () => {
    spoken.length = 0
    observers.length = 0
    useGameStore.setState({ language: 'en', voiceEnabled: false, voiceChoice: { en: '', bn: '' } })
    await i18n.changeLanguage('en')

    // jsdom cannot play media; the jump clip resolves like a browser would.
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: FakeUtterance,
    })
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => VOICES,
        speak: (utterance: FakeUtterance) => {
          spoken.push({
            text: utterance.text,
            lang: utterance.lang,
            voice: utterance.voice?.name ?? null,
            pitch: utterance.pitch,
            rate: utterance.rate,
          })
          // The voice carries on in its own time, like a real one.
          setTimeout(() => utterance.onend?.(), 0)
        },
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    })
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: FakeAudioContext,
    })
    // The YouTube player, so the music can be tested without a network.
    Object.defineProperty(window, 'YT', {
      configurable: true,
      value: {
        Player: class {
          constructor(
            _element: HTMLElement,
            options: {
              events: {
                onReady: (event: { target: unknown }) => void
                onError: () => void
              }
            },
          ) {
            setTimeout(() => options.events.onReady({ target: this }), 0)
          }
          playVideo() {}
          pauseVideo() {}
          seekTo() {}
          setVolume() {}
        },
      },
    })
    window.IntersectionObserver =
      FakeObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    useGameStore.setState({ voiceEnabled: false })
  })

  it('says nothing until the reader presses the sound button', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    scrollToPart(1)
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(spoken).toHaveLength(0)

    const sound = within(detail).getByRole('button', {
      name: /let pandastein read the story aloud/i,
    })
    await user.click(sound)

    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
    expect(spoken[0].text.length).toBeGreaterThan(0)
    // The sentence is spoken in the language of the voice that was chosen.
    expect(spoken[0].lang).toMatch(/^en/)
    // The browser picks the English voice: here, its own default.
    expect(spoken[0].voice).toBe('Microsoft Zira')
    expect(spoken[0].pitch).toBeGreaterThan(1)
  })

  it('starts reading the moment the sound button is pressed', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    // The reader is at the top of the story: no part has been scrolled to.
    const sound = within(detail).getByRole('button', {
      name: /let pandastein read the story aloud/i,
    })
    await user.click(sound)

    // Pandastein begins at once — the tap is what lets the browser speak.
    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
    expect(spoken[0].text.length).toBeGreaterThan(0)
    expect(spoken[0].lang).toMatch(/^en/)
  })

  it('reads the next part when the reader scrolls on', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /let pandastein read the story aloud/i }),
    )

    spoken.length = 0
    scrollToPart(3)
    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
  })

  it('says a part again when the reader asks for it', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    // The small button works even when the reading is off.
    await user.click(within(detail).getByRole('button', { name: /hear part 2 again/i }))

    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
    expect(spoken[0].lang).toMatch(/^en/)
  })

  it('keeps quiet when the reader turns the voice off', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    const sound = within(detail).getByRole('button', {
      name: /let pandastein read the story aloud/i,
    })
    await user.click(sound)
    expect(sound).toHaveAttribute('aria-pressed', 'true')

    const stop = within(detail).getByRole('button', { name: /stop pandastein's voice/i })
    await user.click(stop)
    expect(stop).toHaveAttribute('aria-pressed', 'false')

    spoken.length = 0
    scrollToPart(1)
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(spoken).toHaveLength(0)
  })

  it('speaks Bangla in Bangla when the reader switches language', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /switch language to বাংলা/i }),
    )
    await i18n.changeLanguage('bn')

    scrollToPart(1)
    await user.click(
      within(detail).getByRole('button', { name: /প্যান্ডাস্টাইনকে গল্পটা পড়তে দাও/i }),
    )

    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
    expect(spoken[0].lang).toBe('bn-IN')
    expect(spoken[0].voice).toBe('Microsoft Ruhul Online (Natural) - Bengali (India)')
  })

  it('reads in short breaths, so no sentence is ever cut off', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /let pandastein read the story aloud/i }),
    )
    scrollToPart(1)

    await waitFor(() => expect(spoken.length).toBeGreaterThan(1), { timeout: 8000 })
    for (const line of spoken) {
      expect(line.text.length).toBeLessThanOrEqual(120)
    }
  })

  it('offers the voices of this device and lets the reader pick one', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    // English can be picked too: the browser's default is only the start.
    await within(detail).findByLabelText(/reading voice|পড়ার কণ্ঠ/i)
    expect(
      within(detail).getByRole('option', { name: /microsoft zira/i }),
    ).toBeInTheDocument()

    // Bangla has many: every voice of the device that speaks it is collected.
    await user.click(
      within(detail).getByRole('button', { name: /switch language to বাংলা/i }),
    )
    await i18n.changeLanguage('bn')

    const picker = await within(detail).findByLabelText(/reading voice|পড়ার কণ্ঠ/i)
    expect(
      within(detail).getByRole('option', {
        name: /microsoft ruhul online \(natural\) - bengali \(india\)/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(detail).getByRole('option', { name: /google বাংলা/i }),
    ).toBeInTheDocument()

    await user.selectOptions(picker, 'Google বাংলা')
    expect(picker).toHaveValue('Google বাংলা')
    expect(useGameStore.getState().voiceChoice.bn).toBe('Google বাংলা')
  })

  it('stays quiet when the device has no voice for the language', async () => {
    const user = userEvent.setup()
    // A device with English voices only.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => VOICES.filter((voice) => voice.lang.startsWith('en')),
        speak: (utterance: FakeUtterance) => {
          spoken.push({
            text: utterance.text,
            lang: utterance.lang,
            voice: utterance.voice?.name ?? null,
            pitch: utterance.pitch,
            rate: utterance.rate,
          })
          utterance.onend?.()
        },
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    })

    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /switch language to বাংলা/i }),
    )
    await i18n.changeLanguage('bn')

    await waitFor(() =>
      expect(
        within(detail).getByText(/ভয়েস নেই|no voice for this language/i),
      ).toBeInTheDocument(),
    )

    scrollToPart(1)
    await new Promise((resolve) => setTimeout(resolve, 800))
    expect(spoken).toHaveLength(0)
  })

  it('tells the reader when the browser has no voice at all', async () => {
    const user = userEvent.setup()
    // Brave and Linux browsers often offer no voice whatsoever.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [],
        speak: (utterance: FakeUtterance) => {
          spoken.push({
            text: utterance.text,
            lang: utterance.lang,
            voice: utterance.voice?.name ?? null,
            pitch: utterance.pitch,
            rate: utterance.rate,
          })
          setTimeout(() => utterance.onend?.(), 0)
        },
        cancel: () => {},
        addEventListener: (type: string, listener: () => void) => {
          // The browser says its (empty) list of voices has arrived.
          if (type === 'voiceschanged') setTimeout(listener, 0)
        },
        removeEventListener: () => {},
      },
    })

    renderMap()
    const detail = await openStory(user)

    await waitFor(() =>
      expect(
        within(detail).getByText(/no voice to read with/i),
      ).toBeInTheDocument(),
    )
  })

  it('tells the reader when the browser makes no sound', async () => {
    const user = userEvent.setup()
    // The voices are listed, but the browser still refuses to speak.
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => VOICES,
        speak: (utterance: FakeUtterance) => {
          spoken.push({
            text: utterance.text,
            lang: utterance.lang,
            voice: utterance.voice?.name ?? null,
            pitch: utterance.pitch,
            rate: utterance.rate,
          })
          utterance.onerror?.({ error: 'not-allowed' })
        },
        cancel: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    })

    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /let pandastein read the story aloud/i }),
    )

    await waitFor(() =>
      expect(
        within(detail).getByText(/made no sound/i),
      ).toBeInTheDocument(),
    )
  })

  it('says which engine is speaking', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    // Microsoft text to speech is the engine of the app.
    expect(within(detail).getByText('Microsoft TTS')).toBeInTheDocument()
  })

  it('never reads Bangla with an English voice', async () => {
    const user = userEvent.setup()
    // The reader picks an English voice for Bangla. Such a pick is ignored:
    // the story is still read, but by a voice that knows the language.
    useGameStore.setState({ voiceChoice: { en: '', bn: 'Microsoft Zira' } })

    renderMap()
    const detail = await openStory(user)

    await user.click(
      within(detail).getByRole('button', { name: /switch language to বাংলা/i }),
    )
    await i18n.changeLanguage('bn')

    await user.click(
      within(detail).getByRole('button', { name: /প্যান্ডাস্টাইনকে গল্পটা পড়তে দাও/i }),
    )

    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })
    for (const line of spoken) {
      expect(line.voice).not.toBe('Microsoft Zira')
      expect(line.lang).toBe('bn-IN')
    }
  })

  it('holds the voice and carries it on from the card of Pandastein', async () => {
    const user = userEvent.setup()
    renderMap()
    const detail = await openStory(user)

    const part = detail.querySelector('[data-part="1"]') as HTMLElement
    const card = within(part).getByRole('group', { name: /pandastein's voice/i })
    const play = within(card).getByRole('button', { name: /hear part 1 again/i })
    const pause = within(card).getByRole('button', { name: /hold pandastein's voice/i })
    const resume = within(card).getByRole('button', { name: /carry pandastein on/i })

    await user.click(play)
    await waitFor(() => expect(spoken.length).toBeGreaterThan(0), { timeout: 8000 })

    // The reader holds the voice: it stops where it is.
    await user.click(pause)
    const held = spoken.length
    await new Promise((resolve) => setTimeout(resolve, 400))
    expect(spoken.length).toBe(held)

    // And carries it on.
    await user.click(resume)
    await waitFor(() => expect(spoken.length).toBeGreaterThan(held), { timeout: 8000 })
  })
})
