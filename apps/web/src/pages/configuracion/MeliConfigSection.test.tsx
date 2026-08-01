import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import MeliConfigSection from './MeliConfigSection'

const meliMocks = vi.hoisted(() => ({
  getConfig: vi.fn(),
  getAuthorizeUrl: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    meliAPI: {
      getConfig: meliMocks.getConfig,
      getAuthorizeUrl: meliMocks.getAuthorizeUrl,
      disconnect: meliMocks.disconnect,
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ claims: { role: 'owner', tenantId: 1, userId: 1 } }),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    status: 'ready',
    modules: [],
    integrations: ['meli'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'meli',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => {
  const t = (key: string, opts?: Record<string, string>) => {
    if (key === 'meli.connectedBadge') {
      return `Connected:${opts?.nickname}:${opts?.sitio}:${opts?.last4}`
    }
    return key
  }
  return {
    useTranslation: () => ({ t }),
  }
})

describe('MeliConfigSection', () => {
  beforeEach(() => {
    meliMocks.getConfig.mockReset()
    meliMocks.getAuthorizeUrl.mockReset()
    meliMocks.disconnect.mockReset()
    meliMocks.getConfig.mockResolvedValue({ connected: false })
    meliMocks.getAuthorizeUrl.mockResolvedValue({
      authorizationUrl: 'https://auth.mercadolibre.com.ar/authorization?x=1',
    })
    meliMocks.disconnect.mockResolvedValue({ disconnected: true })
  })

  it('shows connect button when disconnected', async () => {
    render(
      <MemoryRouter>
        <MeliConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('meli-connect-button')).toBeInTheDocument())
    expect(screen.getByTestId('meli-connection-badge')).toHaveTextContent('meli.notConnectedBadge')
  })

  it('starts OAuth redirect on connect', async () => {
    const assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <MeliConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('meli-connect-button')).toBeInTheDocument())
    await user.click(screen.getByTestId('meli-connect-button'))
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://auth.mercadolibre.com.ar/authorization?x=1'),
    )
  })

  it('shows disconnect when connected', async () => {
    meliMocks.getConfig.mockResolvedValue({
      connected: true,
      nickname: 'SELLER',
      sitio: 'MLA',
      accessTokenLast4: '7890',
      meliUserId: '1',
      tokenExpiresAt: '2026-08-01T18:00:00.000Z',
      conectadoAt: '2026-08-01T10:00:00.000Z',
    })
    render(
      <MemoryRouter>
        <MeliConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('meli-disconnect-button')).toBeInTheDocument())
    expect(screen.getByTestId('meli-connection-badge')).toHaveTextContent('Connected:SELLER:MLA:7890')
  })
})
