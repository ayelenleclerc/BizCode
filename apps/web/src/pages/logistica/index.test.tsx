import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import LogisticaPage from './index'
import { logisticaReportesAPI, ordenesEntregaAPI, zonasEntregaAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/contexts/FeatureFlagsContext', () => ({ useFeatureFlags: vi.fn() }))
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    ordenesEntregaAPI: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    zonasEntregaAPI: { list: vi.fn() },
    logisticaReportesAPI: {
      kpis: vi.fn(),
      reporteChoferes: vi.fn(),
      reporteZonas: vi.fn(),
      exportChoferesCsv: vi.fn(),
      exportZonasCsv: vi.fn(),
    },
  }
})

function mockAuth(permissions: Permission[], role: AuthClaims['role'] = 'logistics_planner') {
  const claims: AuthClaims = {
    userId: 1,
    tenantId: 1,
    username: 'planner',
    role,
    permissions,
    scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: ['backoffice'] },
  mfaEnabled: false,
  mfaSetupRequired: false,
  }
  vi.mocked(useAuth).mockReturnValue({
    claims,
    status: 'authenticated',
    login: vi.fn(),
    verifyMfa: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

function mockFeatures() {
  vi.mocked(useFeatureFlags).mockReturnValue({
    hasModule: (key: string) =>
      ['logistics.dispatches', 'logistics.picking', 'logistics.gps'].includes(key),
    modules: ['logistics.dispatches', 'logistics.picking', 'logistics.gps'],
    integrations: [],
    hasIntegration: () => false,
    status: 'ready',
    refreshFeatures: vi.fn(),
  })
}

describe('LogisticaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFeatures()
    vi.mocked(zonasEntregaAPI.list).mockResolvedValue([{ id: 1, tenantId: 1, nombre: 'Norte', tipo: 'barrio', activo: true }])
    vi.mocked(ordenesEntregaAPI.list).mockResolvedValue({ success: true, data: [], total: 0, limit: 100, offset: 0 })
    vi.mocked(logisticaReportesAPI.kpis).mockResolvedValue({
      dispatchedCount: 0,
      firstVisitDeliveredCount: 0,
      firstVisitRate: null,
      avgDeliveryMinutes: null,
      returnsByReason: [],
      overdueCount: 0,
    })
    vi.mocked(logisticaReportesAPI.reporteChoferes).mockResolvedValue([])
    vi.mocked(logisticaReportesAPI.reporteZonas).mockResolvedValue([])
  })

  it('shows forbidden without logistics.read', () => {
    mockAuth([])
    render(
      <MemoryRouter>
        <LogisticaPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('logistica-forbidden')).toBeInTheDocument()
  })

  it('loads orders tab and switches to reportes panel', async () => {
    mockAuth(['logistics.read', 'orders.create'])
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LogisticaPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(ordenesEntregaAPI.list).toHaveBeenCalled())
    expect(screen.getByTestId('logistica-tab-reportes')).toBeInTheDocument()
    await user.click(screen.getByTestId('logistica-tab-reportes'))
    expect(await screen.findByTestId('logistica-reportes-panel')).toBeInTheDocument()
    await user.click(screen.getByTestId('logistica-tab-ordenes'))
    expect(screen.getByTestId('logistica-filters')).toBeInTheDocument()
  })
})
