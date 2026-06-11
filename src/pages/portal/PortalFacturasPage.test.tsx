import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PortalFacturasPage from './PortalFacturasPage'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { count?: number }) => {
      const map: Record<string, string> = {
        'facturas.title': 'Mis facturas',
        'facturas.filterEstado': 'Estado',
        'facturas.estadoAll': 'Todos',
        'facturas.estadoPendiente': 'Pendiente',
        'facturas.estadoVencida': 'Vencida',
        'facturas.estadoPagada': 'Pagada',
        'facturas.filterFrom': 'Desde',
        'facturas.filterTo': 'Hasta',
        'facturas.applyFilters': 'Aplicar',
        'facturas.loading': 'Cargando…',
        'facturas.empty': 'Sin facturas',
        'facturas.colRef': 'Ref',
        'facturas.colFecha': 'Fecha',
        'facturas.colTotal': 'Total',
        'facturas.colPendiente': 'Pendiente',
        'facturas.colEstado': 'Estado',
        'facturas.colActions': 'Acciones',
        'facturas.downloadPdf': 'PDF',
        'facturas.payOnline': 'Pagar online',
        'facturas.payOnlineDisabled': 'No disponible',
        'facturas.tableCaption': 'Tabla',
        'facturas.estado.pendiente': 'Pendiente',
        'facturas.totalCount': `${opts?.count ?? 0} facturas`,
      }
      return map[key] ?? key
    },
  }),
}))

const listFacturas = vi.fn()

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => ({
    tenantSlug: 'demo',
    status: 'authenticated',
    branding: { showPedidos: true },
    me: { rsocial: 'Cliente A' },
  }),
}))

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    listFacturas: (...args: unknown[]) => listFacturas(...args),
    downloadFacturaPdf: vi.fn(),
  },
}))

describe('PortalFacturasPage', () => {
  beforeEach(() => {
    listFacturas.mockResolvedValue({
      facturas: [
        {
          id: 1,
          ref: 'B-0001-00000099',
          fecha: '2026-06-01T00:00:00.000Z',
          total: '1210.00',
          pagado: '0.00',
          pendiente: '1210.00',
          estado: 'pendiente',
        },
      ],
      total: 1,
    })
  })

  it('renders invoice list with filters', async () => {
    render(
      <MemoryRouter initialEntries={['/portal/demo/facturas']}>
        <Routes>
          <Route path="/portal/:tenantSlug/facturas" element={<PortalFacturasPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('portal-facturas-page')).toBeInTheDocument()
    })
    expect(screen.getByTestId('portal-facturas-table')).toBeInTheDocument()
    expect(screen.getByText('B-0001-00000099')).toBeInTheDocument()
    expect(screen.getByTestId('portal-factura-pay-1')).toBeDisabled()
  })
})
