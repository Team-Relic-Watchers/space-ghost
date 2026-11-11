import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

// jsdom has no matchMedia; framer-motion's reduced-motion check uses it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// jsdom cannot paint on a canvas; the warp tunnel uses one. Stubbing it keeps
// the tests quiet, and the app already copes with a missing drawing context.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as
  HTMLCanvasElement['getContext']
if (!('IntersectionObserver' in window)) {
  class NoopIntersectionObserver {
    readonly root: Element | Document | null = null
    readonly rootMargin = '0px'
    readonly scrollMargin = '0px'
    readonly thresholds: ReadonlyArray<number> = []
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  const stub = NoopIntersectionObserver as unknown as typeof IntersectionObserver
  ;(window as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    stub
  ;(globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }).IntersectionObserver =
    stub
}
