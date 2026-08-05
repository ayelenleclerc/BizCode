import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import PedidosPage from './index'
import { meliAPI, pedidosAPI, tiendanubeAPI, woocommerceAPI, type PedidoRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'pedidos-user',
  role: 'owner',
  permissions: [
    'orders.create',
    'orders.pick',
    'orders.dispatch',
    'orders.deliver.confirm',
    'sales.create',
    'sales.cancel',
  ] as Permission[],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['backoffice'],
  },
  mfaEnabled: false,
  mfaSetupRequired: false,
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

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
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
      pack: vi.fn(),
      ship: vi.fn(),
      deliver: vi.fn(),
      collect: vi.fn(),
      transition: vi.fn(),
      invoice: vi.fn(),
      cancel: vi.fn(),
    },
    remitosAPI: {
      createFromPedido: vi.fn(),
    },
    meliAPI: {
      listOrdenes: vi.fn(),
      facturarOrden: vi.fn(),
    },
    tiendanubeAPI: {
      listOrdenes: vi.fn(),
      facturarOrden: vi.fn(),
    },
    woocommerceAPI: {
      listOrdenes: vi.fn(),
      facturarOrden: vi.fn(),
    },
  }
})

function mockAuth(permissions: Permission[]) {
  vi.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    claims: { ...baseClaims, permissions },
    login: vi.fn(),
    verifyMfa: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

describe('PedidosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.orders'],
      integrations: ['meli'],
      hasModule: (key: string) => key === 'billing.orders',
      hasIntegration: (id: string) => id === 'meli',
      refreshFeatures: vi.fn(),
    } as never)
    vi.mocked(pedidosAPI.list).mockResolvedValue({
      success: true,
      data: [samplePedido],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(meliAPI.listOrdenes).mockResolvedValue({
      data: [
        {
          id: 1,
          meliOrderId: '2000003509',
          status: 'paid',
          shippingId: null,
          isFulfillment: false,
          buyerNickname: 'BUYER',
          cuitPending: true,
          stockAppliedAt: null,
          lastSyncedAt: '2026-08-01T12:00:00.000Z',
          pedidoId: 50,
          pedidoEstado: 'confirmed',
          pedidoTotal: '1500',
          facturaId: null,
          clienteId: 20,
          clienteRsocial: 'BUYER',
          clienteCuit: null,
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    })
    vi.mocked(tiendanubeAPI.listOrdenes).mockResolvedValue({
      data: [
        {
          id: 2,
          tnOrderId: 'TN-100',
          status: 'paid',
          buyerNickname: 'BUYER_TN',
          cuitPending: false,
          stockAppliedAt: null,
          lastSyncedAt: '2026-08-01T12:00:00.000Z',
          pedidoId: 51,
          pedidoEstado: 'confirmed',
          pedidoTotal: '2000',
          facturaId: null,
          clienteId: 21,
          clienteRsocial: 'BUYER TN',
          clienteCuit: null,
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    })
    vi.mocked(woocommerceAPI.listOrdenes).mockResolvedValue({
      data: [
        {
          id: 3,
          wcOrderId: 'WC-200',
          status: 'processing',
          buyerNickname: 'BUYER_WC',
          cuitPending: false,
          stockAppliedAt: null,
          lastSyncedAt: '2026-08-01T12:00:00.000Z',
          pedidoId: 52,
          pedidoEstado: 'confirmed',
          pedidoTotal: '3000',
          facturaId: null,
          clienteId: 22,
          clienteRsocial: 'BUYER WC',
          clienteCuit: null,
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
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

  it('muestra pestaña Órdenes ML y lista órdenes', async () => {
    const user = userEvent.setup()
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-tab-meli')
    await user.click(screen.getByTestId('pedidos-tab-meli'))
    expect(await screen.findByTestId('meli-ordenes-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('meli-ordenes-table')).toBeInTheDocument()
    expect(screen.getByTestId('meli-orden-row-2000003509')).toBeInTheDocument()
    expect(meliAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' })
  })

  it('muestra pestaña Órdenes Tiendanube y lista órdenes', async () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.orders'],
      integrations: ['tiendanube'],
      hasModule: (key: string) => key === 'billing.orders',
      hasIntegration: (id: string) => id === 'tiendanube',
      refreshFeatures: vi.fn(),
    } as never)
    const user = userEvent.setup()
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-tab-tiendanube')
    await user.click(screen.getByTestId('pedidos-tab-tiendanube'))
    expect(await screen.findByTestId('tiendanube-ordenes-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('tiendanube-ordenes-table')).toBeInTheDocument()
    expect(screen.getByTestId('tiendanube-orden-row-TN-100')).toBeInTheDocument()
    expect(tiendanubeAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' })
  })

  it('muestra pestaña Órdenes WooCommerce y lista órdenes', async () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.orders'],
      integrations: ['woocommerce'],
      hasModule: (key: string) => key === 'billing.orders',
      hasIntegration: (id: string) => id === 'woocommerce',
      refreshFeatures: vi.fn(),
    } as never)
    const user = userEvent.setup()
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-tab-woocommerce')
    await user.click(screen.getByTestId('pedidos-tab-woocommerce'))
    expect(await screen.findByTestId('woocommerce-ordenes-panel')).toBeInTheDocument()
    expect(await screen.findByTestId('woocommerce-ordenes-table')).toBeInTheDocument()
    expect(screen.getByTestId('woocommerce-orden-row-WC-200')).toBeInTheDocument()
    expect(woocommerceAPI.listOrdenes).toHaveBeenCalledWith({ estado: 'pendiente' })
  })

  it('valida y crea un pedido desde el diálogo', async () => {
    const user = userEvent.setup()
    vi.mocked(pedidosAPI.create).mockResolvedValue(samplePedido)
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-table')

    await user.click(screen.getByTestId('pedidos-new-btn'))
    expect(await screen.findByTestId('pedidos-create-dialog')).toBeInTheDocument()

    await user.click(screen.getByTestId('pedidos-create-submit'))
    expect(await screen.findByTestId('pedidos-create-error')).toBeInTheDocument()
    expect(pedidosAPI.create).not.toHaveBeenCalled()

    await user.type(screen.getByTestId('pedidos-create-cliente'), '2')
    await user.type(screen.getByTestId('pedidos-create-descripcion'), 'Item test')
    await user.clear(screen.getByTestId('pedidos-create-cantidad'))
    await user.type(screen.getByTestId('pedidos-create-cantidad'), '3')
    await user.clear(screen.getByTestId('pedidos-create-precio'))
    await user.type(screen.getByTestId('pedidos-create-precio'), '50')
    await user.click(screen.getByTestId('pedidos-create-submit'))

    await waitFor(() => {
      expect(pedidosAPI.create).toHaveBeenCalledWith({
        clienteId: 2,
        items: [
          {
            descripcion: 'Item test',
            condIva: '1',
            cantidad: 3,
            precio: 50,
            dscto: 0,
          },
        ],
      })
    })
    await waitFor(() => {
      expect(screen.queryByTestId('pedidos-create-dialog')).not.toBeInTheDocument()
    })
  })

  it('confirma un pedido draft y cancela dialogo', async () => {
    const user = userEvent.setup()
    vi.mocked(pedidosAPI.confirm).mockResolvedValue({ ...samplePedido, estado: 'confirmed' })
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-row-1')

    await user.click(screen.getByTestId('pedido-confirm-1'))
    await waitFor(() => {
      expect(pedidosAPI.confirm).toHaveBeenCalledWith(1)
    })
    await waitFor(() => {
      expect(pedidosAPI.list).toHaveBeenCalledTimes(2)
    })

    await user.click(screen.getByTestId('pedidos-new-btn'))
    expect(await screen.findByTestId('pedidos-create-dialog')).toBeInTheDocument()
    await user.click(screen.getByTestId('pedidos-create-cancel'))
    expect(screen.queryByTestId('pedidos-create-dialog')).not.toBeInTheDocument()
  })

  it('ejecuta pack/ship/deliver/invoice/collect según estado', async () => {
    const user = userEvent.setup()
    const confirmed: PedidoRow = { ...samplePedido, id: 10, estado: 'confirmed' }
    const packed: PedidoRow = { ...samplePedido, id: 11, estado: 'packed' }
    const shipped: PedidoRow = { ...samplePedido, id: 12, estado: 'shipped' }
    const delivered: PedidoRow = { ...samplePedido, id: 13, estado: 'delivered' }
    const invoiced: PedidoRow = {
      ...samplePedido,
      id: 14,
      estado: 'invoiced',
      facturaId: 99,
    }

    vi.mocked(pedidosAPI.list).mockResolvedValue({
      success: true,
      data: [confirmed, packed, shipped, delivered, invoiced],
      total: 5,
      take: 100,
      skip: 0,
    })
    vi.mocked(pedidosAPI.pack).mockResolvedValue(packed)
    vi.mocked(pedidosAPI.ship).mockResolvedValue(shipped)
    vi.mocked(pedidosAPI.deliver).mockResolvedValue(delivered)
    vi.mocked(pedidosAPI.invoice).mockResolvedValue({ ...confirmed, facturaId: 1, estado: 'invoiced' })
    vi.mocked(pedidosAPI.collect).mockResolvedValue({ ...invoiced, estado: 'collected' })

    render(<PedidosPage />)
    await screen.findByTestId('pedidos-row-10')

    await user.click(screen.getByTestId('pedido-pack-10'))
    await waitFor(() => expect(pedidosAPI.pack).toHaveBeenCalledWith(10))

    await user.click(screen.getByTestId('pedido-ship-11'))
    await waitFor(() => expect(pedidosAPI.ship).toHaveBeenCalledWith(11))

    await user.click(screen.getByTestId('pedido-deliver-12'))
    await waitFor(() => expect(pedidosAPI.deliver).toHaveBeenCalledWith(12))

    await user.click(screen.getByTestId('pedido-invoice-10'))
    await waitFor(() => {
      expect(pedidosAPI.invoice).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ tipo: 'B', fecha: expect.any(String) }),
      )
    })

    await user.click(screen.getByTestId('pedido-collect-14'))
    await waitFor(() => expect(pedidosAPI.collect).toHaveBeenCalledWith(14))
  })

  it('cancela un pedido confirmed', async () => {
    const user = userEvent.setup()
    vi.mocked(pedidosAPI.list).mockResolvedValue({
      success: true,
      data: [{ ...samplePedido, estado: 'confirmed' }],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(pedidosAPI.cancel).mockResolvedValue({ ...samplePedido, estado: 'cancelled' })
    render(<PedidosPage />)
    await screen.findByTestId('pedidos-row-1')
    await user.click(screen.getByTestId('pedido-cancel-1'))
    await waitFor(() => {
      expect(pedidosAPI.cancel).toHaveBeenCalledWith(1)
    })
  })
})
