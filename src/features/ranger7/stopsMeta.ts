import { BookOpen, Camera, ClipboardList, HelpCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MissionStopId } from './stops'

export interface StopMeta {
  id: MissionStopId
  Icon: LucideIcon
  tone: 'sun' | 'cyan' | 'pink' | 'mint' | 'violet'
}

/**
 * The educational stops of mission 1.
 */
export const stopMeta: StopMeta[] = [
  { id: 'story', Icon: BookOpen, tone: 'sun' },
  { id: 'photos', Icon: Camera, tone: 'mint' },
  { id: 'briefing', Icon: ClipboardList, tone: 'sun' },
  { id: 'challenge', Icon: HelpCircle, tone: 'violet' },
]
