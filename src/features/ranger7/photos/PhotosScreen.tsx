import { useTranslation } from 'react-i18next'
import { Camera } from 'lucide-react'
import { firstPhotograph } from '../../../content/ranger7/imagery'
import { keyFacts } from '../../../content/ranger7/hotspots'
import { formatDigits } from '../../../i18n'
import { PhotoCarousel } from './PhotoCarousel'
import './photos.css'

/** Part 2.4: real Ranger 7 photographs, progressively closer to the Moon. */
export function PhotosScreen() {
  const { t } = useTranslation()

  return (
    <main className="photos-screen screen story-frame">
      <header className="photos-screen__top">
        <div>
          <span className="photos-screen__eyebrow">
            <Camera size={16} aria-hidden="true" /> {t('ranger7.photos.title')}
          </span>
          <h2>{t('ranger7.photos.intro')}</h2>
        </div>
        <div className="photos-screen__counter">
          <img src={firstPhotograph.src} alt="" aria-hidden="true" loading="lazy" />
          <span>{formatDigits(keyFacts.images)}</span>
          <small>{t('ranger7.photos.counterGain')}</small>
        </div>
      </header>

      <PhotoCarousel />

      <footer className="photos-screen__learned">
        <strong>{t('ranger7.photos.learnedTitle')}</strong>
        <p>{t('ranger7.photos.learned')}</p>
        <p className="photos-screen__credit">
          {t('ranger7.photos.credit')}: {firstPhotograph.credit} ·{' '}
          <a href={firstPhotograph.sourceUrl} target="_blank" rel="noreferrer">
            {t('ranger7.photos.source')}
          </a>
        </p>
      </footer>
    </main>
  )
}
