import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@/i18n/config'
import ErrorBoundary from './ErrorBoundary'

function BrokenChild(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>ok</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('renders fallback when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>,
    )

    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
