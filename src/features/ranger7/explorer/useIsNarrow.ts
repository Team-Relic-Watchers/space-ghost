import { useEffect, useState } from 'react'

/**
 * Tracks a CSS media query in React state. The layout itself stays in CSS; this
 * hook exists only so the component tree can differ (mobile shows one view at a
 * time, desktop shows both).
 */
export function useIsNarrow(maxWidthPx: number): boolean {
  const query = `(max-width: ${maxWidthPx}px)`

  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const list = window.matchMedia(query)
    const onChange = () => setMatches(list.matches)
    // Re-sync in case the viewport changed between render and effect.
    onChange()
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}
