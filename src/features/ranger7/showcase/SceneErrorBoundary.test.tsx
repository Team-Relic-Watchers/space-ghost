import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SceneErrorBoundary } from './SceneErrorBoundary'

function Boom(): never {
  throw new Error('WebGL context lost')
}

/** A child that can be told to fail on a later render, to check retry. */
let shouldFail = true
function Flaky() {
  if (shouldFail) throw new Error('GLB missing')
  return <p>scene is live</p>
}

describe('SceneErrorBoundary', () => {
  beforeEach(() => {
    shouldFail = true
    // React logs caught errors; keep the test output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('swaps in the fallback instead of crashing the page', () => {
    render(
      <SceneErrorBoundary fallback={({ error }) => <p>failed: {error.message}</p>}>
        <Boom />
      </SceneErrorBoundary>,
    )
    expect(screen.getByText('failed: WebGL context lost')).toBeInTheDocument()
    expect(screen.queryByText('scene is live')).not.toBeInTheDocument()
  })

  it('reports the error once so the caller can clear a cached asset', () => {
    const onError = vi.fn()
    render(
      <SceneErrorBoundary onError={onError} fallback={() => <p>failed</p>}>
        <Boom />
      </SceneErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
  })

  it('renders the fallback and can remount the scene on retry', async () => {
    const user = userEvent.setup()
    render(
      <SceneErrorBoundary
        fallback={({ retry }) => (
          <button type="button" onClick={retry}>
            Try again
          </button>
        )}
      >
        <Flaky />
      </SceneErrorBoundary>,
    )

    shouldFail = false
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(screen.getByText('scene is live')).toBeInTheDocument()
  })
})
