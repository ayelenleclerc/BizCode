import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import FiscalProviderSection from './FiscalProviderSection'
import { arcaAPI, fiscalAPI } from '@/lib/api'

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    fiscalAPI: {
      getProvidersConfig: vi.fn(),
      putProvidersConfig: vi.fn(),
      validateProvider: vi.fn(),
      getCapabilities: vi.fn(),
      authorizeDocument: vi.fn(),
    },
    arcaAPI: {
      getConfig: vi.fn(),
      putConfig: vi.fn(),
      auth: vi.fn(),
      requestCae: vi.fn(),
      consultaPadron: vi.fn(),
    },
  }
})

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ claims: { role: 'owner', tenantId: 1, userId: 1 } }),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: () => ({
    hasModule: (key: string) =>
      key === 'billing.arca_cae' || key === 'billing.cfdi_sat' || key === 'billing.dgi_cfe',
    modules: ['billing.arca_cae'],
    loading: false,
  }),
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const empresaT = (key: string) => key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: empresaT }),
}))

const arcaCapabilities = {
  provider: 'arca_wsfe' as const,
  countryCode: 'AR',
  displayName: 'ARCA / AFIP (Argentina) — WSFE',
  implemented: true,
  supportsInvoice: true,
  supportsCreditNote: true,
  supportsCancel: false,
  supportsHealthCheck: true,
  supportsLastAuthorizedNumber: true,
}

const dgiCapabilities = {
  provider: 'uruguay_dgi' as const,
  countryCode: 'UY',
  displayName: 'DGI (Uruguay) — CFE',
  implemented: false,
  supportsInvoice: false,
  supportsCreditNote: false,
  supportsCancel: false,
  supportsHealthCheck: false,
  supportsLastAuthorizedNumber: false,
  notes: 'Not evidenced in current codebase — capability stub only (#378).',
}

describe('FiscalProviderSection (#378)', () => {
  beforeEach(() => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockResolvedValue([
      {
        provider: 'arca_wsfe',
        countryCode: 'AR',
        capabilities: arcaCapabilities,
        configured: true,
        enabled: true,
        isDefault: true,
        environment: 'homologacion',
        taxIdentifier: '20123456789',
      },
      {
        provider: 'uruguay_dgi',
        countryCode: 'UY',
        capabilities: dgiCapabilities,
        configured: false,
        enabled: false,
        isDefault: false,
      },
    ])
    vi.mocked(arcaAPI.getConfig).mockResolvedValue({
      configured: true,
      cuit: '20123456789',
      ambiente: 'homologacion',
    })
  })

  it('lists every registered provider with capabilities and status', async () => {
    render(<FiscalProviderSection />)

    await waitFor(() => {
      expect(screen.getByTestId('fiscal-provider-arca_wsfe')).toBeInTheDocument()
    })
    expect(screen.getByTestId('fiscal-provider-uruguay_dgi')).toBeInTheDocument()
    expect(screen.getByTestId('badge-default-arca_wsfe')).toBeInTheDocument()
    expect(screen.getByTestId('badge-status-arca_wsfe')).toHaveTextContent('fiscalProviders.configuredBadge')
    expect(screen.getByTestId('badge-status-uruguay_dgi')).toHaveTextContent(
      'fiscalProviders.notImplementedBadge',
    )
    expect(screen.queryByTestId('badge-default-uruguay_dgi')).not.toBeInTheDocument()
  })

  it('still mounts the ARCA credentials form for arca_wsfe', async () => {
    render(<FiscalProviderSection />)
    await waitFor(() => {
      expect(screen.getByTestId('section-arca-fiscal')).toBeInTheDocument()
    })
  })

  it('shows a load error message when the request fails', async () => {
    vi.mocked(fiscalAPI.getProvidersConfig).mockRejectedValue(new Error('network down'))
    render(<FiscalProviderSection />)
    await waitFor(() => {
      expect(screen.getByText('fiscalProviders.errors.loadFailed')).toBeInTheDocument()
    })
  })
})
