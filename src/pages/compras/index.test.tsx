import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ComprasPage from './index'
import { comprasAPI, type OrdenCompra } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const basePermissions = [
  'suppliers.read',
  'suppliers.manage',
  'inventory.adjust',
] as const satisfies readonly Permission[]

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'compras-user',
  role: 'owner',
  permissions: [...basePermissions],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['backoffice'],
  },
}

const draftOrden: OrdenCompra = {
  id: 1,
  proveedorId: 2,
  estado: 'draft',
  total: '50.00',
  nota: null,
  proveedor: { id: 2, codigo: 10, rsocial: 'Proveedor SA' },
  items: [
    {
      id: 10,
      articuloId: 3,
      cantidad: 5,
      cantidadRecibida: 0,
      costoUnitario: '10',
      subtotal: '50',
      articulo: { id: 3, codigo: 100, descripcion: 'Artículo A' },
    },
  ],
}

const sentOrden: OrdenCompra = {
  ...draftOrden,
  estado: 'sent',
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    comprasAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      send: vi.fn(),
      cancel: vi.fn(),
      receive: vi.fn(),
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

describe('ComprasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
    vi.mocked(comprasAPI.list).mockResolvedValue({
      success: true,
      data: [draftOrden],
      total: 1,
      limit: 50,
      offset: 0,
    })
    vi.mocked(comprasAPI.get).mockResolvedValue(draftOrden)
    vi.mocked(comprasAPI.create).mockResolvedValue(draftOrden)
    vi.mocked(comprasAPI.send).mockResolvedValue(sentOrden)
    vi.mocked(comprasAPI.cancel).mockResolvedValue({ ...draftOrden, estado: 'cancelled' })
    vi.mocked(comprasAPI.receive).mockResolvedValue({ ...sentOrden, estado: 'received' })
  })

  it('muestra acceso denegado sin suppliers.read', async () => {
    mockAuth([])
    render(<ComprasPage />)
    expect(await screen.findByTestId('compras-forbidden')).toBeInTheDocument()
  })

  it('carga el listado y muestra la tabla', async () => {
    render(<ComprasPage />)
    expect(await screen.findByTestId('compras-page')).toBeInTheDocument()
    expect(await screen.findByTestId('compras-table')).toBeInTheDocument()
    expect(screen.getByTestId('compras-row-1')).toBeInTheDocument()
    expect(screen.getByText('Proveedor SA')).toBeInTheDocument()
  })

  it('muestra estado vacío', async () => {
    vi.mocked(comprasAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      limit: 50,
      offset: 0,
    })
    render(<ComprasPage />)
    expect(await screen.findByTestId('compras-empty')).toBeInTheDocument()
  })

  it('muestra error de carga', async () => {
    vi.mocked(comprasAPI.list).mockRejectedValue(new Error('fallo red'))
    render(<ComprasPage />)
    await waitFor(() => {
      expect(screen.queryByTestId('compras-table')).not.toBeInTheDocument()
    })
  })

  it('filtra por estado', async () => {
    const user = userEvent.setup()
    render(<ComprasPage />)
    await screen.findByTestId('compras-table')
    await user.selectOptions(screen.getByLabelText(/estado/i), 'sent')
    await waitFor(() => {
      expect(comprasAPI.list).toHaveBeenCalledWith({ estado: 'sent' })
    })
  })

  it('crea una orden desde el formulario', async () => {
    const user = userEvent.setup()
    render(<ComprasPage />)
    await user.click(await screen.findByTestId('compras-btn-new'))
    await user.type(screen.getByLabelText(/proveedor/i), '2')
    await user.type(screen.getByLabelText(/artículo/i), '3')
    await user.clear(screen.getByLabelText(/cantidad/i))
    await user.type(screen.getByLabelText(/cantidad/i), '4')
    await user.type(screen.getByLabelText(/costo/i), '12.5')
    await user.type(screen.getByLabelText(/nota/i), 'urgente')
    await user.click(screen.getByTestId('compras-form-save'))
    await waitFor(() => {
      expect(comprasAPI.create).toHaveBeenCalledWith({
        proveedorId: 2,
        nota: 'urgente',
        items: [{ articuloId: 3, cantidad: 4, costoUnitario: 12.5 }],
      })
    })
    expect(screen.queryByTestId('compras-form-dialog')).not.toBeInTheDocument()
  })

  it('envía una orden en borrador', async () => {
    const user = userEvent.setup()
    render(<ComprasPage />)
    await user.click(await screen.findByTestId('compras-row-1'))
    await user.click(await screen.findByTestId('compras-btn-send'))
    await waitFor(() => {
      expect(comprasAPI.send).toHaveBeenCalledWith(1)
    })
  })

  it('cancela una orden', async () => {
    const user = userEvent.setup()
    render(<ComprasPage />)
    await user.click(await screen.findByTestId('compras-row-1'))
    await user.click(await screen.findByTestId('compras-btn-cancel'))
    await waitFor(() => {
      expect(comprasAPI.cancel).toHaveBeenCalledWith(1)
    })
  })

  it('no crea orden con datos inválidos', async () => {
    const user = userEvent.setup()
    render(<ComprasPage />)
    await user.click(await screen.findByTestId('compras-btn-new'))
    await user.click(screen.getByTestId('compras-form-save'))
    expect(comprasAPI.create).not.toHaveBeenCalled()
  })

  it('recibe stock parcial', async () => {
    vi.mocked(comprasAPI.get).mockResolvedValue(sentOrden)
    const user = userEvent.setup()
    render(<ComprasPage />)
    await user.click(await screen.findByTestId('compras-row-1'))
    await user.click(await screen.findByTestId('compras-btn-receive'))
    const qtyInput = await screen.findByLabelText(/cantidad/i)
    await user.clear(qtyInput)
    await user.type(qtyInput, '3')
    await user.click(screen.getByTestId('compras-receive-confirm'))
    await waitFor(() => {
      expect(comprasAPI.receive).toHaveBeenCalledWith(1, [{ itemId: 10, cantidad: 3 }])
    })
    expect(screen.queryByTestId('compras-receive-dialog')).not.toBeInTheDocument()
  })
})
