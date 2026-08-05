import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import WooCommerceConfigSection from './WooCommerceConfigSection'

const wcMocks = vi.hoisted(() => ({
  getConfig: vi.fn(),
  verifyAndSave: vi.fn(),
  disconnect: vi.fn(),
}))

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    woocommerceAPI: {
      getConfig: wcMocks.getConfig,
      verifyAndSave: wcMocks.verifyAndSave,
      disconnect: wcMocks.disconnect,
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
    integrations: ['woocommerce'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'woocommerce',
    refreshFeatures: vi.fn(),
  }),
}))

vi.mock('react-i18next', () => {
  const t = (key: string, opts?: Record<string, string>) => {
    if (key === 'woocommerce.connectedBadge') {
      return `Connected:${opts?.store}:${opts?.last4}`
    }
    return key
  }
  return {
    useTranslation: () => ({ t }),
  }
})

describe('WooCommerceConfigSection', () => {
  beforeEach(() => {
    wcMocks.getConfig.mockReset()
    wcMocks.verifyAndSave.mockReset()
    wcMocks.disconnect.mockReset()
    wcMocks.getConfig.mockResolvedValue({ connected: false })
    wcMocks.verifyAndSave.mockResolvedValue({
      connected: true,
      storeUrl: 'https://mitienda.com',
      storeName: 'Mi Tienda',
      consumerKeyLast4: '7890',
      hasWebhookSecret: true,
      conectadoAt: '2026-08-01T10:00:00.000Z',
      webhookUrl: 'https://api.example.com/api/webhooks/woocommerce/1',
    })
    wcMocks.disconnect.mockResolvedValue({ disconnected: true })
  })

  it('shows the credential form when disconnected', async () => {
    render(
      <MemoryRouter>
        <WooCommerceConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('woocommerce-connect-form')).toBeInTheDocument())
    expect(screen.getByTestId('woocommerce-connection-badge')).toHaveTextContent(
      'woocommerce.notConnectedBadge',
    )
    expect(screen.getByTestId('woocommerce-connect-button')).toBeDisabled()
  })

  it('verifies and saves credentials on connect', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <WooCommerceConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId('woocommerce-connect-form')).toBeInTheDocument())
    await user.type(screen.getByTestId('woocommerce-input-store-url'), 'https://mitienda.com')
    await user.type(screen.getByTestId('woocommerce-input-consumer-key'), 'ck_123')
    await user.type(screen.getByTestId('woocommerce-input-consumer-secret'), 'cs_123')
    await user.click(screen.getByTestId('woocommerce-connect-button'))
    await waitFor(() =>
      expect(wcMocks.verifyAndSave).toHaveBeenCalledWith({
        storeUrl: 'https://mitienda.com',
        consumerKey: 'ck_123',
        consumerSecret: 'cs_123',
        webhookSecret: undefined,
      }),
    )
    expect(await screen.findByTestId('woocommerce-disconnect-button')).toBeInTheDocument()
    expect(screen.getByTestId('woocommerce-connection-badge')).toHaveTextContent(
      'Connected:Mi Tienda:7890',
    )
    expect(screen.getByTestId('woocommerce-webhook-url')).toHaveTextContent(
      'https://api.example.com/api/webhooks/woocommerce/1',
    )
  })

  it('shows disconnect when connected and warns about a missing webhook secret', async () => {
    wcMocks.getConfig.mockResolvedValue({
      connected: true,
      storeUrl: 'https://mitienda.com',
      storeName: 'Mi Tienda',
      consumerKeyLast4: '7890',
      hasWebhookSecret: false,
      conectadoAt: '2026-08-01T10:00:00.000Z',
      webhookUrl: 'https://api.example.com/api/webhooks/woocommerce/1',
    })
    render(
      <MemoryRouter>
        <WooCommerceConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('woocommerce-disconnect-button')).toBeInTheDocument(),
    )
    expect(screen.getByTestId('woocommerce-webhook-secret-warning')).toBeInTheDocument()
    expect(screen.getByTestId('woocommerce-store')).toHaveTextContent('Mi Tienda')
  })

  it('disconnects and reloads status', async () => {
    wcMocks.getConfig
      .mockResolvedValueOnce({
        connected: true,
        storeUrl: 'https://mitienda.com',
        storeName: 'Mi Tienda',
        consumerKeyLast4: '7890',
        hasWebhookSecret: true,
        conectadoAt: '2026-08-01T10:00:00.000Z',
      })
      .mockResolvedValueOnce({ connected: false })
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <WooCommerceConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('woocommerce-disconnect-button')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('woocommerce-disconnect-button'))
    await waitFor(() => expect(wcMocks.disconnect).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByTestId('woocommerce-connect-form')).toBeInTheDocument())
    expect(screen.getByTestId('woocommerce-success')).toHaveTextContent(
      'woocommerce.disconnectSuccess',
    )
  })

  it('shows load error when config fails', async () => {
    wcMocks.getConfig.mockRejectedValue(new Error('network'))
    render(
      <MemoryRouter>
        <WooCommerceConfigSection />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('woocommerce-error')).toHaveTextContent(
        'woocommerce.errors.loadFailed',
      ),
    )
  })
})
