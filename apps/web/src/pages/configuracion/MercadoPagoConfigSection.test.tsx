import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MercadoPagoConfigSection from './MercadoPagoConfigSection'
import { mercadopagoAPI } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    mercadopagoAPI: {
      getConfig: vi.fn(),
      putConfig: vi.fn(),
      testCredentials: vi.fn(),
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
    integrations: ['mercadopago'],
    hasModule: () => false,
    hasIntegration: (id: string) => id === 'mercadopago',
    refreshFeatures: vi.fn(),
  }),
}))

const empresaT = (key: string) => key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: empresaT }),
}))

describe('MercadoPagoConfigSection', () => {
  beforeEach(() => {
    vi.mocked(mercadopagoAPI.getConfig).mockResolvedValue({
      configured: true,
      publicKey: 'APP_USR-public',
      sandboxMode: true,
      activo: true,
      accessTokenLast4: '1234',
      webhookSecretSet: true,
    })
    vi.mocked(mercadopagoAPI.putConfig).mockResolvedValue({ configured: true })
    vi.mocked(mercadopagoAPI.testCredentials).mockResolvedValue({
      accountName: 'Demo Shop',
      email: 'pay@demo.test',
    })
  })

  it('loads MercadoPago config when integration is enabled', async () => {
    render(<MercadoPagoConfigSection />)
    await waitFor(() => {
      expect(screen.getByTestId('section-mercadopago')).toBeInTheDocument()
    })
    expect(screen.getByTestId('input-mp-public-key')).toHaveValue('APP_USR-public')
    expect(screen.getByTestId('mercadopago-status-badge')).toBeInTheDocument()
  })

  it('saves MercadoPago config changes', async () => {
    const user = userEvent.setup()
    render(<MercadoPagoConfigSection />)
    const saveButton = await screen.findByTestId('btn-save-mercadopago')
    await user.clear(screen.getByTestId('input-mp-public-key'))
    await user.type(screen.getByTestId('input-mp-public-key'), 'APP_USR-new')
    await user.click(saveButton)
    await waitFor(() => {
      expect(mercadopagoAPI.putConfig).toHaveBeenCalledWith(
        expect.objectContaining({ publicKey: 'APP_USR-new' }),
      )
    })
  })

  it('verifies credentials when configured', async () => {
    const user = userEvent.setup()
    render(<MercadoPagoConfigSection />)
    const testButton = await screen.findByTestId('btn-mp-test-credentials')
    await user.click(testButton)
    await waitFor(() => {
      expect(mercadopagoAPI.testCredentials).toHaveBeenCalled()
    })
  })
})
