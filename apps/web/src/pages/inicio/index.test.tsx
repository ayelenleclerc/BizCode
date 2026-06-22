import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import InicioPage from './index'
import { dashboardAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { AuthClaims, Permission } from '@/lib/rbac'
vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/contexts/FeatureFlagsContext', () => ({ useFeatureFlags: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    dashboardAPI: {
      summary: vi.fn(),
      ventasHistorico: vi.fn(),
      exportVentasHistoricoCsv: vi.fn(),
    },
    usersAPI: { list: vi.fn().mockResolvedValue([]) },
    zonasEntregaAPI: { list: vi.fn().mockResolvedValue([]) },
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useLocation: () => ({ pathname: '/inicio', state: null }),
    useNavigate: () => vi.fn(),
  }
})

const summaryFixture = {
  ventasHoy: { count: 1, total: '100.00' },
  facturasVencidas: { count: 0, total: '0.00' },
  cobrosHoy: { count: 0, total: '0.00' },
  alertasActivas: 0,
  facturasPagar: {
    vencido: { count: 1, total: '500.00' },
    proximoVencer: { count: 2, total: '300.00' },
  },
}

const historicoFixture = {
  series: [{ period: '2026-05-01', count: 2, total: '200.00' }],
  topArticles: [
    { articuloId: 1, codigo: 10, descripcion: 'Prod', quantity: 3, total: '200.00' },
  ],
  bySeller: [{ vendedorId: 1, username: 'u1', count: 2, total: '200.00' }],
}

function mockAuth(permissions: Permission[]) {
  const claims: AuthClaims = {
    userId: 1,
    tenantId: 1,
    username: 'owner',
    role: 'owner',
    permissions,
    scope: { tenantId: 1, branchIds: [], warehouseIds: [], routeIds: [], channels: ['backoffice'] },
  }
  vi.mocked(useAuth).mockReturnValue({
    claims,
    status: 'authenticated',
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

describe('InicioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      hasModule: (key) => key === 'analytics.advanced',
      modules: ['analytics.advanced'],
      integrations: [],
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })
    vi.mocked(dashboardAPI.summary).mockResolvedValue(summaryFixture)
    vi.mocked(dashboardAPI.ventasHistorico).mockResolvedValue(historicoFixture)
    mockAuth(['reports.operational.read'])
  })

  it('muestra KPIs en pestaña Resumen', async () => {
    render(<InicioPage />)
    await waitFor(() => {
      expect(screen.getByTestId('inicio-panel-summary')).toBeInTheDocument()
    })
    expect(dashboardAPI.summary).toHaveBeenCalled()
  })

  it('muestra analítica cuando hay permiso y módulo', async () => {
    const user = userEvent.setup()
    render(<InicioPage />)
    await user.click(screen.getByTestId('inicio-tab-analytics'))
    await waitFor(() => {
      expect(screen.getByTestId('inicio-analytics-tab')).toBeInTheDocument()
    })
    expect(dashboardAPI.ventasHistorico).toHaveBeenCalled()
  })

  it('muestra mensaje sin permiso de reportes', async () => {
    mockAuth([])
    const user = userEvent.setup()
    render(<InicioPage />)
    await user.click(screen.getByTestId('inicio-tab-analytics'))
    expect(screen.getByTestId('inicio-analytics-forbidden')).toBeInTheDocument()
  })
})
