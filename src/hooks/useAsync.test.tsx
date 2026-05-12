import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useAsync } from './useAsync'

function AsyncProbe({ shouldFail }: { shouldFail: boolean }) {
  const { data, loading, error } = useAsync(async () => {
    if (shouldFail) {
      throw new Error('failed')
    }
    return 'ok'
  }, [shouldFail])

  if (loading) return <div data-testid="probe-loading">loading</div>
  if (error) return <div data-testid="probe-error">{error.message}</div>
  return <div data-testid="probe-data">{data}</div>
}

describe('useAsync', () => {
  it('resolves data after loading', async () => {
    render(<AsyncProbe shouldFail={false} />)

    expect(screen.getByTestId('probe-loading')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('probe-data')).toHaveTextContent('ok')
    })
  })

  it('exposes an error when the async function fails', async () => {
    render(<AsyncProbe shouldFail />)

    await waitFor(() => {
      expect(screen.getByTestId('probe-error')).toHaveTextContent('failed')
    })
  })
})
