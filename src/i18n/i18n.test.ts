import { describe, expect, it } from 'vitest'
import i18n, { formatYear } from './index'
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
    expect(placeholders(bn.missionControl.prompt)).toEqual(
      placeholders(en.missionControl.prompt),
    )
    expect(placeholders(bn.language.switchTo)).toEqual(
      placeholders(en.language.switchTo),
    )
  })

  it('translates through i18next', () => {
    expect(i18n.getFixedT('en')('missionControl.start')).toBe(en.missionControl.start)
    expect(i18n.getFixedT('bn')('missionControl.start')).toBe(bn.missionControl.start)
  })

  it('formats years in Bengali digits for Bangla', () => {
    expect(formatYear(1964, 'en')).toBe('1964')
    expect(formatYear(1964, 'bn')).toBe('১৯৬৪')
  })
})
