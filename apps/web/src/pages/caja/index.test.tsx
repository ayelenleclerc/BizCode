import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import CajaPage from './index'

vi.mock('@/lib/api', () => ({
  cajaAPI: {
    listCajas: vi.fn().mockResolvedValue([
      {
        id: 1,
        nombre: 'Caja 1',
        activa: true,
        createdAt: '2026-07-20T00:00:00.000Z',
        updatedAt: '2026-07-20T00:00:00.000Z',
      },
    ]),
    listTurnos: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 10,
          cajaId: 1,
          cajeroId: 2,
          estado: 'abierto',
          montoApertura: 1000,
          fechaApertura: '2026-07-20T10:00:00.000Z',
          fechaCierre: null,
          totalVentasEfectivo: null,
          totalVentasTarjeta: null,
          totalVentasMP: null,
          totalVentasTransf: null,
          totalEgresos: null,
          totalIngresosExtra: null,
          efectivoEsperado: null,
          efectivoContado: null,
          diferencia: null,
          observaciones: null,
          createdAt: '2026-07-20T10:00:00.000Z',
          updatedAt: '2026-07-20T10:00:00.000Z',
          caja: {
            id: 1,
            nombre: 'Caja 1',
            activa: true,
            createdAt: '2026-07-20T00:00:00.000Z',
            updatedAt: '2026-07-20T00:00:00.000Z',
          },
          cajero: { id: 2, username: 'cajero' },
        },
      ],
      total: 1,
      take: 100,
      skip: 0,
      counts: { abiertos: 1, cerradosHoy: 0, diferenciaHoy: 0 },
    }),
    createCaja: vi.fn(),
    open: vi.fn(),
    addMovimiento: vi.fn(),
    close: vi.fn(),
    pdfUrl: (id: number) => `/turnos-caja/${id}/pdf`,
  },
  formasPagoAPI: {
    list: vi.fn().mockResolvedValue([
      { id: 1, descripcion: 'Efectivo', esEfectivo: true },
      { id: 2, descripcion: 'Transferencia', esEfectivo: false },
    ]),
    patch: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('CajaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders counts and open shift table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('caja-page')).toBeInTheDocument()
    })
    expect(screen.getByTestId('caja-counts')).toBeInTheDocument()
    expect(screen.getByTestId('caja-turnos-table')).toBeInTheDocument()
    expect(screen.getAllByText('Caja 1').length).toBeGreaterThan(0)
  })
})
