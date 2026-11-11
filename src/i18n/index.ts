import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useGameStore } from '../game/store'
import { en } from './locales/en'

/**
 * The Bangla words and the Bangla typeface are only fetched when a reader
 * asks for them. An English reader never downloads the Bangla dictionary or
 * the two Bengali font files, which keeps the first page light.
 */
let banglaReady: Promise<void> | null = null

/** Loads the Bangla dictionary and the Bengali font, once. */
export const ensureBangla = (): Promise<void> => {
  banglaReady ??= (async () => {
    const [{ bn }] = await Promise.all([
      import('./locales/bn'),
      import('@fontsource/baloo-da-2/bengali-600.css'),
      import('@fontsource/baloo-da-2/bengali-700.css'),
    ])
    i18n.addResourceBundle('bn', 'translation', bn, true, true)
  })()
  return banglaReady
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

/**
 * Switching to Bangla always fetches the dictionary first, so every caller —
 * the language switch, the store and the tests — gets the same promise.
 */
const changeLanguage = i18n.changeLanguage.bind(i18n)
i18n.changeLanguage = (language: string) => {
  if (language === 'bn') {
    return ensureBangla().then(() => changeLanguage(language))
  }
  return changeLanguage(language)
}

/** Switches the app to a language, fetching what that language needs. */
const applyLanguage = (language: string): Promise<unknown> => {
  document.documentElement.lang = language
  return i18n.changeLanguage(language)
}

/**
 * Resolves once the first language is ready. The app waits for this before
 * its first paint, so a Bangla reader never sees a flash of English.
 */
export const i18nReady: Promise<unknown> = applyLanguage(
  useGameStore.getState().language,
)

// The store owns the language; i18next and <html lang> follow it.
useGameStore.subscribe((state) => {
  void applyLanguage(state.language)
})

export default i18n

/**
 * A plain number in the reader's own digits: Bengali digits for Bangla,
 * Latin digits for English. Years use formatYear, which follows the same rule.
 */
export const formatNumber = (value: number, language: string) =>
  new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
    useGrouping: false,
  }).format(value)

/** Years render in Bengali digits when the language is Bangla. */
export const formatYear = (year: number, language: string) => formatNumber(year, language)

/** For numbers that must match the photographs (frame counters, years on film). */
export const formatDigits = (value: number) => value.toLocaleString('en-US')
