import { describe, expect, it } from 'vitest'
import i18n, { ensureBangla, formatYear } from './index'
import { bn } from './locales/bn'
import { en } from './locales/en'

const keys = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? keys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  )

describe('i18n', () => {
  it('has the same keys in English and Bangla', () => {
    expect(keys(bn).sort()).toEqual(keys(en).sort())
  })

  it('has no empty strings', () => {
    for (const dict of [en, bn]) {
      for (const key of keys(dict)) {
        const value = key
          .split('.')
          .reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], dict)
        expect(value, key).toBeTruthy()
      }
    }
  })

  it('keeps the same interpolation placeholders in both languages', () => {
    const placeholders = (s: string) => (s.match(/{{\w+}}/g) ?? []).sort()
    expect(placeholders(bn.home.prompt)).toEqual(
      placeholders(en.home.prompt),
    )
    expect(placeholders(bn.language.switchTo)).toEqual(
      placeholders(en.language.switchTo),
    )
  })

  it('translates through i18next', async () => {
    // The Bangla dictionary is only fetched when it is needed.
    await ensureBangla()
    expect(i18n.getFixedT('en')('home.start')).toBe(en.home.start)
    expect(i18n.getFixedT('bn')('home.start')).toBe(bn.home.start)
  })

  it('formats years in Bengali digits for Bangla', () => {
    expect(formatYear(1964, 'en')).toBe('1964')
    expect(formatYear(1964, 'bn')).toBe('১৯৬৪')
  })
})
