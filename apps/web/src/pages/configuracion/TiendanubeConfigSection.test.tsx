import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TiendanubeConfigSection from './TiendanubeConfigSection'

const tnMocks = vi.hoisted(() => ({
  getConfig: vi.fn(),
  getAuthorizeUrl: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    tiendanubeAPI: {
      getConfig: tnMocks.getConfig,
      getAuthorizeUrl: tnMocks.getAuthorizeUrl,
      disconnect: tnMocks.disconnect,
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
    integrations: ['tiendanube'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'tiendanube',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => {
  const t = (key: string, opts?: Record<string, string>) => {
    if (key === 'tiendanube.connectedBadge') {
      return `Connected:${opts?.store}:${opts?.last4}`
    }
    return key
  }
  return {
    useTranslation: () => ({ t }),
  }
})

describe('TiendanubeConfigSection', () => {
  beforeEach(() => {
    tnMocks.getConfig.mockReset()
    tnMocks.getAuthorizeUrl.mockReset()
    tnMocks.disconnect.mockReset()
    tnMocks.getConfig.mockResolvedValue({ connected: false })
    tnMocks.getAuthorizeUrl.mockResolvedValue({
      authorizationUrl: 'https://www.tiendanube.com/apps/authorize?x=1',
    })
    tnMocks.disconnect.mockResolvedValue({ disconnected: true })
  })

  it('shows connect button when disconnected', async () => {
    render(
      <MemoryRouter>
        <TiendanubeConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('tiendanube-connect-button')).toBeInTheDocument())
    expect(screen.getByTestId('tiendanube-connection-badge')).toHaveTextContent(
      'tiendanube.notConnectedBadge',
    )
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
        <TiendanubeConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('tiendanube-connect-button')).toBeInTheDocument())
    await user.click(screen.getByTestId('tiendanube-connect-button'))
    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://www.tiendanube.com/apps/authorize?x=1'),
    )
  })

  it('shows disconnect when connected', async () => {
    tnMocks.getConfig.mockResolvedValue({
      connected: true,
      storeId: '12345',
      storeName: 'Mi Tienda',
      storeUrl: 'https://mitienda.mitiendanube.com',
      accessTokenLast4: '7890',
      conectadoAt: '2026-08-01T10:00:00.000Z',
    })
    render(
      <MemoryRouter>
        <TiendanubeConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('tiendanube-disconnect-button')).toBeInTheDocument(),
    )
    expect(screen.getByTestId('tiendanube-connection-badge')).toHaveTextContent(
      'Connected:Mi Tienda:7890',
    )
    expect(screen.getByTestId('tiendanube-store-id')).toHaveTextContent('12345')
  })

  it('disconnects and reloads status', async () => {
    tnMocks.getConfig
      .mockResolvedValueOnce({
        connected: true,
        storeId: '12345',
        storeName: 'Mi Tienda',
        accessTokenLast4: '7890',
        conectadoAt: '2026-08-01T10:00:00.000Z',
      })
      .mockResolvedValueOnce({ connected: false })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <TiendanubeConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('tiendanube-disconnect-button')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('tiendanube-disconnect-button'))
    await waitFor(() => expect(tnMocks.disconnect).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByTestId('tiendanube-connect-button')).toBeInTheDocument())
    expect(screen.getByTestId('tiendanube-success')).toHaveTextContent(
      'tiendanube.disconnectSuccess',
    )
  })

  it('shows load error when config fails', async () => {
    tnMocks.getConfig.mockRejectedValue(new Error('network'))
    render(
      <MemoryRouter>
        <TiendanubeConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('tiendanube-error')).toHaveTextContent(
        'tiendanube.errors.loadFailed',
      ),
    )
  })
})
