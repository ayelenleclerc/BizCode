import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import OrdenesTrabajoPage from './index'
import { ordenesTrabajoAPI, type OrdenTrabajoRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'ot-user',
  role: 'owner',
  permissions: ['sales.create'] as Permission[],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['backoffice'],
  },
}

const sampleOt: OrdenTrabajoRow = {
  id: 1,
  numero: 42,
  clienteId: 2,
  tecnicoId: null,
  estado: 'recibido',
  prioridad: 'normal',
  equipoMarca: null,
  equipoModelo: null,
  equipoNroSerie: null,
  equipoDescripcion: 'iPhone 12',
  sintomaReportado: 'Pantalla rota',
  diagnostico: null,
  trabajoRealizado: null,
  enGarantia: false,
  garantiaVence: null,
  otGarantiaId: null,
  presupuesto: 25000,
  fechaIngreso: '2026-07-20T12:00:00.000Z',
  fechaPromesa: null,
  fechaEntrega: null,
  facturaId: null,
  observaciones: null,
  createdAt: '2026-07-20T12:00:00.000Z',
  updatedAt: '2026-07-20T12:00:00.000Z',
  cliente: { id: 2, codigo: 10, rsocial: 'García Juan' },
  items: [],
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    ordenesTrabajoAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      transition: vi.fn(),
      facturar: vi.fn(),
    },
  }
})

describe('OrdenesTrabajoPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      claims: baseClaims,
      token: 't',
      login: vi.fn(),
      logout: vi.fn(),
      loading: false,
    } as never)
    vi.mocked(ordenesTrabajoAPI.list).mockResolvedValue({
      success: true,
      data: [sampleOt],
      total: 1,
      take: 50,
      skip: 0,
      counts: { en_reparacion: 2, listo: 1, presupuestado: 3 },
    })
    vi.mocked(ordenesTrabajoAPI.create).mockResolvedValue(sampleOt)
    vi.mocked(ordenesTrabajoAPI.transition).mockResolvedValue({
      ...sampleOt,
      estado: 'diagnosticado',
    })
  })

  it('renders dashboard and table', async () => {
    render(<OrdenesTrabajoPage />)
    expect(await screen.findByTestId('ordenes-trabajo-page')).toBeInTheDocument()
    expect(await screen.findByTestId('ot-table')).toBeInTheDocument()
    expect(screen.getByTestId('ot-row-1')).toBeInTheDocument()
    expect(screen.getByTestId('ot-count-presupuestado')).toHaveTextContent('3')
  })

  it('shows empty state', async () => {
    vi.mocked(ordenesTrabajoAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 50,
      skip: 0,
      counts: {},
    })
    render(<OrdenesTrabajoPage />)
    expect(await screen.findByTestId('ot-empty')).toBeInTheDocument()
  })

  it('creates a work order', async () => {
    const user = userEvent.setup()
    render(<OrdenesTrabajoPage />)
    await screen.findByTestId('ot-table')
    await user.click(screen.getByTestId('ot-new-btn'))
    expect(await screen.findByTestId('ot-create-form')).toBeInTheDocument()
    await user.type(screen.getByTestId('ot-cliente-id'), '2')
    await user.type(screen.getByTestId('ot-equipo'), 'Notebook')
    await user.type(screen.getByTestId('ot-sintoma'), 'No enciende')
    await user.click(screen.getByTestId('ot-submit'))
    await waitFor(() => {
      expect(ordenesTrabajoAPI.create).toHaveBeenCalled()
    })
  })

  it('advances estado with next action', async () => {
    const user = userEvent.setup()
    render(<OrdenesTrabajoPage />)
    await screen.findByTestId('ot-table')
    await user.click(screen.getByTestId('ot-next-1'))
    await waitFor(() => {
      expect(ordenesTrabajoAPI.transition).toHaveBeenCalledWith(1, expect.objectContaining({ estado: 'diagnosticado' }))
    })
  })
})
