import type { ReactNode } from 'react'
import './speech-bubble.css'

interface SpeechBubbleProps {
  children: ReactNode
  className?: string
}

/** Comic-style bubble whose tail points down toward the speaker. */
export function SpeechBubble({ children, className }: SpeechBubbleProps) {
  return <div className={`speech-bubble ${className ?? ''}`}>{children}</div>
}
