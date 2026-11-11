import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import StatusPage from './index'

const checkAPI = vi.fn()

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { value?: number | string }) =>
      opts?.value !== undefined ? `${key}:${opts.value}` : key,
  }),
}))

vi.mock('@/components/LanguageSelect', () => ({
  default: () => <div data-testid="language-select" />,
}))

vi.mock('@/lib/api', () => ({
  checkAPI: (...args: unknown[]) => checkAPI(...args),
}))

describe('StatusPage', () => {
  beforeEach(() => {
    checkAPI.mockReset()
  })

  it('renders operational state from health ok', async () => {
    checkAPI.mockResolvedValue({
      status: 'ok',
      timestamp: '2026-11-11T12:00:00.000Z',
      db: { ok: true, latencyMs: 1.5 },
      uptimeSeconds: 12,
      version: '0.1.0',
    })

    render(
      <MemoryRouter>
        <StatusPage />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('status-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('status-headline')).toHaveTextContent('stateOk')
    })
    expect(screen.getByTestId('status-api-value')).toHaveTextContent('ok')
    expect(screen.getByTestId('status-db-value')).toHaveTextContent('dbOk')
    expect(screen.getByTestId('status-version')).toHaveTextContent('0.1.0')
    expect(screen.getByTestId('status-back-login')).toHaveAttribute('href', '/login')
  })

  it('renders degraded state when health status is not ok', async () => {
    checkAPI.mockResolvedValue({
      status: 'degraded',
      db: { ok: false, latencyMs: 0 },
      uptimeSeconds: 3,
    })

    render(
      <MemoryRouter>
        <StatusPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status-headline')).toHaveTextContent('stateDegraded')
    })
    expect(screen.getByTestId('status-db-value')).toHaveTextContent('dbDown')
  })

  it('renders unavailable when health cannot be reached', async () => {
    checkAPI.mockResolvedValue(null)

    render(
      <MemoryRouter>
        <StatusPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status-error')).toBeInTheDocument()
    })
    expect(screen.getByTestId('status-headline')).toHaveTextContent('stateUnavailable')
  })

  it('refreshes health on button click', async () => {
    const user = userEvent.setup()
    checkAPI
      .mockResolvedValueOnce({ status: 'ok', db: { ok: true, latencyMs: 1 }, uptimeSeconds: 1 })
      .mockResolvedValueOnce({ status: 'degraded', db: { ok: false, latencyMs: 0 }, uptimeSeconds: 2 })

    render(
      <MemoryRouter>
        <StatusPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('status-headline')).toHaveTextContent('stateOk')
    })
    await user.click(screen.getByTestId('status-refresh'))
    await waitFor(() => {
      expect(screen.getByTestId('status-headline')).toHaveTextContent('stateDegraded')
    })
    expect(checkAPI).toHaveBeenCalledTimes(2)
  })
})
