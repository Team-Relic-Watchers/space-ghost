import { useTranslation } from 'react-i18next'
import './logo.css'

/** Stacked, chunky game logo. Two words, two colors, a little tilt. */
export function Logo() {
  const { t } = useTranslation()
  const [first, ...rest] = t('appName').split(' ')

  return (
    <h1 className="logo" aria-label={t('appName')}>
      <span className="logo__word logo__word--first" aria-hidden="true">
        {first}
      </span>
      <span className="logo__word logo__word--second" aria-hidden="true">
        {rest.join(' ')}
      </span>
    </h1>
  )
}
