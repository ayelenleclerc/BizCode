import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import PedidosPage from './index'
import { pedidosAPI, type PedidoRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'pedidos-user',
  role: 'owner',
  permissions: ['orders.create'] as Permission[],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['backoffice'],
  },
}

const samplePedido: PedidoRow = {
  id: 1,
  clienteId: 2,
  vendedorId: null,
  estado: 'draft',
  total: 120,
  validUntil: null,
  facturaId: null,
  createdAt: '2026-01-15T12:00:00.000Z',
  updatedAt: '2026-01-15T12:00:00.000Z',
  cliente: { id: 2, codigo: 10, rsocial: 'Cliente SA' },
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    pedidosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      confirm: vi.fn(),
      invoice: vi.fn(),
      cancel: vi.fn(),
    },
  }
})

function mockAuth(permissions: Permission[]) {
  vi.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    claims: { ...baseClaims, permissions },
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

describe('PedidosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
    vi.mocked(pedidosAPI.list).mockResolvedValue({
      success: true,
      data: [samplePedido],
      total: 1,
      take: 100,
      skip: 0,
    })
  })

  it('carga listado y muestra tabla', async () => {
    render(<PedidosPage />)
    expect(await screen.findByTestId('pedidos-page')).toBeInTheDocument()
    expect(await screen.findByTestId('pedidos-table')).toBeInTheDocument()
    expect(screen.getByTestId('pedidos-row-1')).toBeInTheDocument()
  })

  it('muestra vacío sin pedidos', async () => {
    vi.mocked(pedidosAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 100,
      skip: 0,
    })
    render(<PedidosPage />)
    expect(await screen.findByTestId('pedidos-empty')).toBeInTheDocument()
  })

  it('filtra por estado y refresca', async () => {
    const user = userEvent.setup()
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-table')
    await user.selectOptions(screen.getByTestId('search-pedidos-estado'), 'confirmed')
    await waitFor(() => {
      expect(pedidosAPI.list).toHaveBeenCalledWith({ estado: 'confirmed' })
    })
    await user.click(screen.getByTestId('pedidos-refresh-btn'))
    await waitFor(() => {
      expect(pedidosAPI.list).toHaveBeenCalledTimes(3)
    })
  })

  it('muestra error de carga', async () => {
    vi.mocked(pedidosAPI.list).mockRejectedValue(new Error('red'))
    render(<PedidosPage />)
    await waitFor(() => {
      expect(screen.queryByTestId('pedidos-table')).not.toBeInTheDocument()
    })
  })
})
