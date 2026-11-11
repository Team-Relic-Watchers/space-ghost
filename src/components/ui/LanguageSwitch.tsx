import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../game/store'
import './language-switch.css'

/**
 * The two-language switch in the hero: one pill with both languages in it, so
 * the reader can see that Bangla is one tap away instead of having to guess
 * which label flips the language.
 */
export function LanguageSwitch() {
  const { t } = useTranslation()
  const language = useGameStore((state) => state.language)
  const setLanguage = useGameStore((state) => state.setLanguage)

  return (
    <div className="language-switch" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className="language-switch__option"
        data-active={language === 'en'}
        aria-pressed={language === 'en'}
        aria-label={t('language.english')}
        onClick={() => setLanguage('en')}
      >
        <span aria-hidden="true">EN</span>
      </button>
      <button
        type="button"
        className="language-switch__option"
        data-active={language === 'bn'}
        aria-pressed={language === 'bn'}
        aria-label={t('language.bangla')}
        onClick={() => setLanguage('bn')}
      >
        <span lang="bn" aria-hidden="true">
          বাংলা
        </span>
      </button>
    </div>
  )
}
