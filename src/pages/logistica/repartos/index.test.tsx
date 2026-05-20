import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@/i18n/config'
import RepartosPage from './index'
import { repartosAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

vi.mock('@/contexts/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>()
  return {
    ...actual,
    repartosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      iniciar: vi.fn(),
      cerrar: vi.fn(),
    },
    ordenesEntregaAPI: { list: vi.fn().mockResolvedValue({ data: [] }) },
    usersAPI: { list: vi.fn().mockResolvedValue([]) },
  }
})

const repartoFixture = {
  id: 1,
  tenantId: 1,
  fecha: '2026-05-20T10:00:00.000Z',
  choferId: 2,
  estado: 'planned' as const,
  vehiculo: null,
  observaciones: null,
  closedAt: null,
  chofer: { id: 2, username: 'driver1', role: 'driver' },
  items: [],
  progress: { total: 0, delivered: 0, pending: 0 },
}

function mockAuth(permissions: Permission[]) {
  const claims: AuthClaims = {
    userId: 1,
    tenantId: 1,
    username: 'planner',
    role: 'logistics_planner',
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

describe('RepartosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(repartosAPI.list).mockResolvedValue({
      success: true,
      data: [repartoFixture],
      total: 1,
      limit: 100,
      offset: 0,
    })
  })

  it('shows forbidden without logistics.read', () => {
    mockAuth([])
    render(
      <MemoryRouter>
        <RepartosPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('repartos-forbidden')).toBeInTheDocument()
  })

  it('lists repartos for logistics.read', async () => {
    mockAuth(['logistics.read', 'orders.dispatch'])
    render(
      <MemoryRouter>
        <RepartosPage />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('repartos-table')).toBeInTheDocument()
    })
    expect(screen.getByText('driver1')).toBeInTheDocument()
  })

  it('shows empty state when no routes', async () => {
    mockAuth(['logistics.read'])
    vi.mocked(repartosAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
    })
    render(
      <MemoryRouter>
        <RepartosPage />
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('repartos-empty')).toBeInTheDocument()
    })
  })
})
