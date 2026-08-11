import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import VisitasPage from './index'

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    status: 'authenticated',
    claims: {
      username: 'mgr',
      role: 'manager',
      permissions: ['reports.operational.read', 'customers.manage'],
    },
  }),
}))

vi.mock('@/lib/api', () => ({
  usersAPI: {
    list: vi.fn().mockResolvedValue([
      { id: 5, username: 'seller1', role: 'seller', active: true },
    ]),
  },
  visitasAPI: {
    list: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          tenantId: 1,
          vendedorId: 5,
          clienteId: 2,
          fechaPlanificada: '2026-08-09',
          estadoPlan: 'pendiente',
          resultado: null,
          notasVisita: null,
          pedidoId: null,
          orden: 0,
          duracionMinutos: null,
          createdAt: '2026-08-09T00:00:00.000Z',
          updatedAt: '2026-08-09T00:00:00.000Z',
          cliente: {
            id: 2,
            codigo: 100,
            rsocial: 'Cliente Demo',
            domicilio: 'Calle 1',
            localidad: 'CABA',
            deliveryZoneId: null,
          },
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
      kpi: { planificadas: 1, visitados: 0, pedidos: 0, conversionPct: 0 },
    }),
    create: vi.fn(),
  },
  rutasAPI: {
    getRuta: vi.fn().mockResolvedValue({
      id: 9,
      tenantId: 1,
      vendedorId: 5,
      fecha: '2026-08-09',
      createdAt: '2026-08-09T00:00:00.000Z',
      updatedAt: '2026-08-09T00:00:00.000Z',
      paradas: [
        {
          id: 1,
          rutaId: 9,
          clienteId: 2,
          orden: 0,
          estado: 'pendiente',
          motivo: null,
          visitaId: null,
          createdAt: '2026-08-09T00:00:00.000Z',
          updatedAt: '2026-08-09T00:00:00.000Z',
          cliente: { id: 2, codigo: 100, rsocial: 'Cliente Demo', domicilio: null, localidad: null, deliveryZoneId: null, latitud: null, longitud: null },
        },
      ],
    }),
    getRutaStats: vi.fn().mockResolvedValue({
      total: 1,
      pendientes: 1,
      visitados: 0,
      postergados: 0,
      noVisitados: 0,
      pedidos: 0,
      conversionPct: 0,
    }),
    listVendedorZonas: vi.fn().mockResolvedValue({ success: true, data: [], total: 0 }),
    createVendedorZona: vi.fn(),
    deleteVendedorZona: vi.fn(),
  },
  zonasEntregaAPI: {
    list: vi.fn().mockResolvedValue([{ id: 1, nombre: 'Centro', tipo: 'barrio', activo: true }]),
  },
}))

describe('VisitasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list and kpi', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <VisitasPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('visitas-page')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByTestId('visitas-table')).toBeInTheDocument()
    })
    expect(screen.getAllByText('Cliente Demo').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByTestId('visitas-kpi')).toBeInTheDocument()
    expect(screen.getByTestId('visitas-ruta-panel')).toBeInTheDocument()
    expect(screen.getByTestId('visitas-ruta-stats')).toBeInTheDocument()
  })
})
