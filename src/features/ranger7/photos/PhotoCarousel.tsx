import { useRef, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { photographs } from '../../../content/ranger7/imagery'
import { formatDigits } from '../../../i18n'
import './photos.css'

interface PhotoCarouselProps {
  initialId?: string
}

/**
 * A 3D film strip of real Ranger 7 frames. Further frames sit deeper and dimmer,
 * so the approach is felt as depth rather than read as a list.
 */
export function PhotoCarousel({ initialId }: PhotoCarouselProps) {
  const { t } = useTranslation()
  const startIndex = Math.max(0, photographs.findIndex((p) => p.id === initialId))
  const [active, setActive] = useState(startIndex)
  const strip = useRef<HTMLDivElement>(null)
  const photo = photographs[active]

  return (
    <section className="photos" aria-label={t('ranger7.photos.title')}>
      <div className="photos__stage">
        {photographs.map((p, i) => {
          const offset = i - active
          const distance = Math.abs(offset)
          const hidden = distance > 2
          return (
            <button
              key={p.id}
              type="button"
              className="photos__frame"
              data-active={offset === 0}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : 0}
              aria-label={t(`ranger7.photos.captionTitle.${p.id}`)}
              onClick={() => setActive(i)}
              style={{
                transform: `translateX(${offset * 58}%) translateZ(${-distance * 160}px) rotateY(${offset * -16}deg) scale(${1 - distance * 0.1})`,
                opacity: hidden ? 0 : offset === 0 ? 1 : 0.62,
                zIndex: 10 - distance,
                pointerEvents: hidden ? 'none' : 'auto',
              }}
            >
              <img src={p.src} alt={t(`ranger7.photos.caption.${p.id}`)} width={p.width} height={p.height} loading={i === 0 ? 'eager' : 'lazy'} />
              <span className="photos__frame-tag">{formatDigits(active === i ? 1 : i + 1)}</span>
            </button>
          )
        })}
      </div>

      <div className="photos__strip" ref={strip} role="tablist" aria-label={t('ranger7.photos.title')}>
        {photographs.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            className="photos__thumb"
            onClick={() => setActive(i)}
          >
            <img src={p.src} alt="" width={p.width} height={p.height} loading="lazy" />
          </button>
        ))}
      </div>

      <article className="photos__info" key={photo.id}>
        <h3>{t(`ranger7.photos.captionTitle.${photo.id}`)}</h3>
        <p className="photos__caption">{t(`ranger7.photos.caption.${photo.id}`)}</p>
        <p className="photos__credit">
          {t('ranger7.photos.credit')}: {photo.credit} ·{' '}
          <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
            {t('ranger7.photos.source')} <ExternalLink size={12} aria-hidden="true" />
          </a>
        </p>
      </article>
    </section>
  )
}
