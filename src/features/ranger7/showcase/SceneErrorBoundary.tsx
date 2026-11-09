import { Component, Fragment } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface SceneErrorBoundaryProps {
  children: ReactNode
  /** Rendered instead of the scene; `retry` remounts the children. */
  fallback: (state: { error: Error; retry: () => void }) => ReactNode
  /** Called once per caught error, e.g. to clear a cached asset. */
  onError?: (error: Error) => void
}

interface SceneErrorBoundaryState {
  error: Error | null
  attempt: number
}

/**
 * Keeps a failed 3D scene from taking the page down with it. React Three Fiber
 * re-throws loader and renderer errors out of <Canvas>, so one boundary around
 * the canvas catches both WebGL failures and broken GLB requests.
 */
export class SceneErrorBoundary extends Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { error: null, attempt: 0 }

  static getDerivedStateFromError(error: Error): Partial<SceneErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[space-ghosts] 3D scene failed', error, info.componentStack)
    this.props.onError?.(error)
  }

  retry = () => {
    this.setState((state) => ({ error: null, attempt: state.attempt + 1 }))
  }

  render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, retry: this.retry })
    }
    // `attempt` remounts the subtree so the Canvas and loader cache start clean.
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>
  }
}
