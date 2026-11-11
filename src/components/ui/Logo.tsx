import { useTranslation } from 'react-i18next'
import './logo.css'

interface LogoProps {
  /**
   * The element to render. `h1` for a page's own title; `div` when the logo
   * stands beside another heading and must not add a second one.
   */
  as?: 'h1' | 'div'
  /** Hides the logo from assistive tech, for a purely decorative copy. */
  decorative?: boolean
}

/** Stacked, chunky game logo. Two words, two colors, a little tilt. */
export function Logo({ as = 'h1', decorative = false }: LogoProps) {
  const { t } = useTranslation()
  const [first, ...rest] = t('appName').split(' ')

  const words = (
    <>
      <span className="logo__word logo__word--first" aria-hidden="true">
        {first}
      </span>
      <span className="logo__word logo__word--second" aria-hidden="true">
        {rest.join(' ')}
      </span>
    </>
  )

  if (as === 'div') {
    return (
      <div className="logo" {...(decorative ? { 'aria-hidden': true } : { 'aria-label': t('appName') })}>
        {words}
      </div>
    )
  }

  return (
    <h1 className="logo" aria-label={t('appName')}>
      {words}
    </h1>
  )
}
