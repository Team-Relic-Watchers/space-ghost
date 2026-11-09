import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../../game/store'
import './language-toggle.css'

/** Small pill in the corner that flips between English and Bangla. */
export function LanguageToggle() {
  const { t } = useTranslation()
  const toggleLanguage = useGameStore((s) => s.toggleLanguage)

  return (
    <button
      type="button"
      className="language-toggle"
      onClick={toggleLanguage}
      aria-label={t('language.switchTo', { name: t('language.otherName') })}
    >
      <Languages size={22} strokeWidth={2.75} aria-hidden="true" />
      <span lang={t('language.otherName') === 'English' ? 'en' : 'bn'}>
        {t('language.otherName')}
      </span>
    </button>
  )
}
