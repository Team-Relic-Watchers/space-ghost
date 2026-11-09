import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { useGameStore } from '../game/store'
import { en } from './locales/en'
import { bn } from './locales/bn'

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    bn: { translation: bn },
  },
  lng: useGameStore.getState().language,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

const applyLanguage = (language: string) => {
  document.documentElement.lang = language
  if (i18n.language !== language) void i18n.changeLanguage(language)
}

applyLanguage(i18n.language)

// The store owns the language; i18next and <html lang> follow it.
useGameStore.subscribe((state) => applyLanguage(state.language))

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
