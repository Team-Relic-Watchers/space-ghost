import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { MissionHub } from '../hub/MissionHub'
import { StoryIntro } from '../story/StoryIntro'
import { Briefing } from '../briefing/Briefing'
import { PhotosScreen } from '../photos/PhotosScreen'
import { Challenge } from '../challenge/Challenge'
import { MissionComplete } from '../challenge/Completion'
import { useGameStore } from '../../../game/store'
import type { MissionStopId } from '../stops'

/**
 * The learning half of the Ranger 7 experience: mission map, story, photos,
 * mission file, quiz and badge, with their own navigation and progress.
 * The 3D spacecraft inspection lab lives on the left as the persistent 3D explorer.
 *
 * It stays mounted while the player explores the 3D model, so section, quiz and
 * scroll state all survive; the caller may dim/hide it but never unmounts it.
 */
export type MissionInfoSection = 'hub' | MissionStopId | 'complete'

export function MissionInfo() {
  const { t } = useTranslation()
  const resetRanger7 = useGameStore((s) => s.resetRanger7)
  const [section, setSection] = useState<MissionInfoSection>('hub')

  const go = useCallback((next: MissionInfoSection) => setSection(next), [])
  const backToHub = useCallback(() => setSection('hub'), [])
  // Only the overview offers the section bar; a stop gets an obvious way back.
  const isOverview = section === 'hub'

  return (
    <div className="mission-info" data-section={section}>
      {!isOverview && (
        <div className="mission-info__bar">
          <button type="button" className="pill-button mission-info__back" onClick={backToHub}>
            <ChevronLeft size={18} aria-hidden="true" />
            {t('ranger7.complete.backToHub')}
          </button>
          <span className="mission-info__where">{t(`ranger7.stops.${section === 'complete' ? 'challenge' : section}.title`)}</span>
        </div>
      )}

      {section === 'hub' && <MissionHub onOpenStop={go} />}
      {section === 'story' && <StoryIntro onExplore={backToHub} />}
      {section === 'briefing' && <Briefing onContinue={() => go('challenge')} />}
      {section === 'photos' && <PhotosScreen />}
      {section === 'challenge' && <Challenge onComplete={() => go('complete')} />}
      {section === 'complete' && (
        <MissionComplete
          onReplay={() => {
            resetRanger7()
            go('story')
          }}
          onHub={backToHub}
        />
      )}
    </div>
  )
}
