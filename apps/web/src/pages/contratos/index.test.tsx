import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import ContratosPage from './index'
import { contratosAPI, type ContratoRow } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'contratos-user',
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

const sampleContrato: ContratoRow = {
  id: 1,
  numero: 10,
  clienteId: 2,
  nombre: 'Soporte mensual',
  descripcion: null,
  estado: 'activo',
  frecuencia: 'mensual',
  diaDelMes: 15,
  fechaInicio: '2026-01-01T00:00:00.000Z',
  fechaFin: null,
  proximaFact: '2026-07-15T00:00:00.000Z',
  montoBase: 1000,
  moneda: 'ARS',
  incluyeIVA: false,
  ivaAlicuota: 21,
  modoEmision: 'revision',
  tipoFactura: 'B',
  prefijo: '0001',
  createdAt: '2026-01-01T12:00:00.000Z',
  updatedAt: '2026-01-01T12:00:00.000Z',
  cliente: { id: 2, codigo: 10, rsocial: 'Cliente SA' },
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    contratosAPI: {
      list: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      listFacturas: vi.fn(),
      applyManualAdjustment: vi.fn(),
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

describe('ContratosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
    vi.mocked(contratosAPI.list).mockResolvedValue({
      success: true,
      data: [sampleContrato],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(contratosAPI.listFacturas).mockResolvedValue([])
    vi.mocked(contratosAPI.pause).mockResolvedValue({ ...sampleContrato, estado: 'pausado' })
    vi.mocked(contratosAPI.create).mockResolvedValue(sampleContrato)
  })

  it('carga listado y muestra tabla', async () => {
    render(<ContratosPage />)
    expect(await screen.findByTestId('contratos-page')).toBeInTheDocument()
    expect(await screen.findByTestId('contratos-table')).toBeInTheDocument()
    expect(screen.getByTestId('contratos-row-1')).toBeInTheDocument()
  })

  it('muestra vacío sin contratos', async () => {
    vi.mocked(contratosAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 100,
      skip: 0,
    })
    render(<ContratosPage />)
    expect(await screen.findByTestId('contratos-empty')).toBeInTheDocument()
  })

  it('abre el formulario y crea un contrato', async () => {
    const user = userEvent.setup()
    render(<ContratosPage />)
    await screen.findByTestId('contratos-table')
    await user.click(screen.getByTestId('contratos-new-btn'))
    expect(await screen.findByTestId('contratos-create-form')).toBeInTheDocument()
    await user.type(screen.getByTestId('contratos-cliente-id'), '2')
    await user.type(screen.getByTestId('contratos-nombre'), 'Nuevo soporte')
    await user.type(screen.getByTestId('contratos-item-desc'), 'Servicio')
    await user.type(screen.getByTestId('contratos-precio'), '500')
    await user.click(screen.getByTestId('contratos-submit'))
    await waitFor(() => {
      expect(contratosAPI.create).toHaveBeenCalled()
    })
  })

  it('pausa un contrato activo', async () => {
    const user = userEvent.setup()
    render(<ContratosPage />)
    await screen.findByTestId('contratos-table')
    await user.click(screen.getByTestId('contratos-pause-resume-1'))
    await waitFor(() => {
      expect(contratosAPI.pause).toHaveBeenCalledWith(1)
    })
  })

  it('muestra facturas del contrato', async () => {
    const user = userEvent.setup()
    vi.mocked(contratosAPI.listFacturas).mockResolvedValue([
      {
        id: 9,
        fecha: '2026-07-15T00:00:00.000Z',
        tipo: 'B',
        prefijo: '0001',
        numero: 55,
        total: 1000,
        estadoCae: 'pending',
      },
    ])
    render(<ContratosPage />)
    await screen.findByTestId('contratos-table')
    await user.click(screen.getByTestId('contratos-facturas-1'))
    expect(await screen.findByTestId('contratos-invoices-panel')).toBeInTheDocument()
  })

  it('muestra error de carga', async () => {
    vi.mocked(contratosAPI.list).mockRejectedValue(new Error('red'))
    render(<ContratosPage />)
    await waitFor(() => {
      expect(screen.queryByTestId('contratos-table')).not.toBeInTheDocument()
    })
  })
})
