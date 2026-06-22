import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import ChoferRepartosPage from './index'
import { repartosAPI, type Reparto, type RepartoItemRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/contexts/FeatureFlagsContext', () => ({ useFeatureFlags: vi.fn() }))

vi.mock('./DriverDeliveryWizard', () => ({
  default: () => <div data-testid="pod-wizard-mock" />,
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    repartosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      iniciar: vi.fn(),
      cerrar: vi.fn(),
      updateItemPod: vi.fn(),
      getItemPod: vi.fn(),
    },
  }
})

const deliverPerms = ['orders.deliver.confirm'] as const satisfies readonly Permission[]

const driverClaims: AuthClaims = {
  userId: 2,
  tenantId: 1,
  username: 'driver1',
  role: 'driver',
  permissions: [...deliverPerms],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['delivery'],
  },
}

const pendingItem: RepartoItemRow = {
  id: 10,
  ordenEntregaId: 1,
  secuencia: 1,
  estado: 'pending',
  entregadoAt: null,
  motivoNoEntrega: null,
  receptorNombre: null,
  receptorDni: null,
  notasEntrega: null,
  hasPod: false,
  ordenEntrega: {
    id: 1,
    tenantId: 1,
    clienteId: 1,
    zonaId: null,
    driverId: 2,
    pickerUserId: null,
    pickingIniciadoAt: null,
    pickingListoAt: null,
    items: [],
    facturaId: null,
    fecha: '2026-05-20T10:00:00.000Z',
    estado: 'in_transit',
    nota: null,
    cliente: { id: 1, codigo: 1, rsocial: 'ACME' },
    zona: null,
    driver: { id: 2, username: 'driver1', role: 'driver' },
    factura: null,
  },
}

const onRouteReparto: Reparto = {
  id: 1,
  tenantId: 1,
  fecha: '2026-05-20T10:00:00.000Z',
  choferId: 2,
  estado: 'on_route',
  vehiculo: null,
  observaciones: null,
  closedAt: null,
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [pendingItem],
  progress: { total: 1, delivered: 0, pending: 1 },
}

describe('ChoferRepartosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: driverClaims,
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    })
    vi.mocked(useFeatureFlags).mockReturnValue({
      modules: ['logistics.pod'],
      integrations: [],
      hasModule: (key) => key === 'logistics.pod',
      hasIntegration: () => false,
      status: 'ready',
      refreshFeatures: vi.fn(),
    })
    vi.mocked(repartosAPI.list).mockResolvedValue({
      success: true,
      data: [onRouteReparto],
      total: 1,
      limit: 5,
      offset: 0,
    })
    vi.mocked(repartosAPI.get).mockResolvedValue(onRouteReparto)
  })

  it('shows forbidden without deliver permission', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: { ...driverClaims, permissions: [] },
      login: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    })
    render(<ChoferRepartosPage />)
    expect(screen.getByTestId('chofer-repartos-forbidden')).toBeInTheDocument()
  })

  it('lists pending items and opens wizard', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ChoferRepartosPage />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId('chofer-item-10')).toBeInTheDocument()
    await user.click(screen.getByTestId('chofer-confirm-10'))
    expect(screen.getByTestId('pod-wizard-mock')).toBeInTheDocument()
  })
})
