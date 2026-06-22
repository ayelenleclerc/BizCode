import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import '@/i18n/config'
import { DEFAULT_MODULES } from '@/lib/modules'
import { AuthProvider } from '@/contexts/AuthContext'
import { FeatureFlagsProvider, useFeatureFlags } from '@/contexts/FeatureFlagsContext'

vi.mock('@/lib/api', () => ({
  authAPI: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  featuresAPI: {
    get: vi.fn(),
  },
}))

import { authAPI, featuresAPI } from '@/lib/api'

function Probe() {
  const { modules, hasModule, status } = useFeatureFlags()
  return (
    <div>
      <span data-testid="ff-status">{status}</span>
      <span data-testid="ff-has-orders">{String(hasModule('billing.orders'))}</span>
      <span data-testid="ff-count">{modules.length}</span>
    </div>
  )
}

describe('FeatureFlagsContext', () => {
  beforeEach(() => {
    vi.mocked(authAPI.me).mockReset()
    vi.mocked(featuresAPI.get).mockReset()
  })

  it('loads modules when authenticated', async () => {
    vi.mocked(authAPI.me).mockResolvedValue({
      userId: 1,
      tenantId: 1,
      username: 'u',
      role: 'owner',
      permissions: [],
      scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: [] },
    })
    vi.mocked(featuresAPI.get).mockResolvedValue({
      modules: [...DEFAULT_MODULES, 'billing.orders'],
      integrations: ['mercadopago'],
    })

    render(
      <AuthProvider>
        <FeatureFlagsProvider>
          <Probe />
        </FeatureFlagsProvider>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ff-status')).toHaveTextContent('ready')
    })
    expect(screen.getByTestId('ff-has-orders')).toHaveTextContent('true')
    expect(Number(screen.getByTestId('ff-count').textContent)).toBeGreaterThan(0)
  })

  it('fail-safe: empty modules when features request fails', async () => {
    vi.mocked(authAPI.me).mockResolvedValue({
      userId: 1,
      tenantId: 1,
      username: 'u',
      role: 'owner',
      permissions: [],
      scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: [] },
    })
    vi.mocked(featuresAPI.get).mockRejectedValue(new Error('network'))

    render(
      <AuthProvider>
        <FeatureFlagsProvider>
          <Probe />
        </FeatureFlagsProvider>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ff-status')).toHaveTextContent('ready')
    })
    expect(screen.getByTestId('ff-has-orders')).toHaveTextContent('false')
    expect(screen.getByTestId('ff-count')).toHaveTextContent('0')
  })

  it('super_admin bypasses module checks', async () => {
    vi.mocked(authAPI.me).mockResolvedValue({
      userId: 1,
      tenantId: 1,
      username: 'sa',
      role: 'super_admin',
      permissions: [],
      scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: [] },
    })
    vi.mocked(featuresAPI.get).mockResolvedValue({ modules: [], integrations: [] })

    render(
      <AuthProvider>
        <FeatureFlagsProvider>
          <Probe />
        </FeatureFlagsProvider>
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('ff-has-orders')).toHaveTextContent('true')
    })
  })
})
