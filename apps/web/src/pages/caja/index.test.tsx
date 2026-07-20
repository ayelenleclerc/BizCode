import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { cajaAPI, formasPagoAPI } from '@/lib/api'
import CajaPage from './index'

const openTurno = {
  id: 10,
  cajaId: 1,
  cajeroId: 2,
  estado: 'abierto' as const,
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
}

const closedTurno = {
  ...openTurno,
  id: 11,
  estado: 'cerrado' as const,
  fechaCierre: '2026-07-20T18:00:00.000Z',
  efectivoEsperado: 900,
  efectivoContado: 900,
  diferencia: 0,
}

vi.mock('@/lib/api', () => ({
  cajaAPI: {
    listCajas: vi.fn(),
    listTurnos: vi.fn(),
    createCaja: vi.fn(),
    open: vi.fn(),
    addMovimiento: vi.fn(),
    close: vi.fn(),
    pdfUrl: (id: number) => `/turnos-caja/${id}/pdf`,
  },
  formasPagoAPI: {
    list: vi.fn(),
    patch: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

function mockHappyLoad(turnos = [openTurno]) {
  vi.mocked(cajaAPI.listCajas).mockResolvedValue([
    {
      id: 1,
      nombre: 'Caja 1',
      activa: true,
      createdAt: '2026-07-20T00:00:00.000Z',
      updatedAt: '2026-07-20T00:00:00.000Z',
    },
  ])
  vi.mocked(cajaAPI.listTurnos).mockResolvedValue({
    success: true,
    data: turnos,
    total: turnos.length,
    take: 100,
    skip: 0,
    counts: { abiertos: turnos.some((t) => t.estado === 'abierto') ? 1 : 0, cerradosHoy: 1, diferenciaHoy: 0 },
  })
  vi.mocked(formasPagoAPI.list).mockResolvedValue([
    { id: 1, codigo: 1, descripcion: 'Efectivo', vto_dias: 0, esEfectivo: true },
    { id: 2, codigo: 2, descripcion: 'Transferencia', vto_dias: 0, esEfectivo: false },
  ])
  vi.mocked(cajaAPI.createCaja).mockResolvedValue({
    id: 2,
    nombre: 'Nueva',
    activa: true,
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-07-20T00:00:00.000Z',
  })
  vi.mocked(cajaAPI.open).mockResolvedValue(openTurno)
  vi.mocked(cajaAPI.addMovimiento).mockResolvedValue(openTurno)
  vi.mocked(cajaAPI.close).mockResolvedValue(closedTurno)
  vi.mocked(formasPagoAPI.patch).mockResolvedValue({
    id: 2,
    codigo: 2,
    descripcion: 'Transferencia',
    vto_dias: 0,
    esEfectivo: true,
  })
}

describe('CajaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHappyLoad()
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

  it('creates caja, opens shift, registers movement and closes', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('caja-nombre')).toBeInTheDocument()
    })

    await user.type(screen.getByTestId('caja-nombre'), 'Caja Norte')
    await user.click(screen.getByTestId('caja-crear'))
    await waitFor(() => {
      expect(cajaAPI.createCaja).toHaveBeenCalledWith({ nombre: 'Caja Norte' })
    })

    await user.selectOptions(screen.getByTestId('caja-select'), '1')
    await user.clear(screen.getByTestId('caja-monto-apertura'))
    await user.type(screen.getByTestId('caja-monto-apertura'), '500')
    await user.click(screen.getByTestId('caja-abrir'))
    await waitFor(() => {
      expect(cajaAPI.open).toHaveBeenCalledWith({ cajaId: 1, montoApertura: 500 })
    })

    await user.selectOptions(screen.getByTestId('caja-mov-tipo'), 'ingreso_extra')
    await user.type(screen.getByTestId('caja-mov-importe'), '25')
    await user.type(screen.getByTestId('caja-mov-concepto'), 'vuelto')
    await user.click(screen.getByTestId('caja-mov-submit'))
    await waitFor(() => {
      expect(cajaAPI.addMovimiento).toHaveBeenCalledWith(10, {
        tipo: 'ingreso_extra',
        importe: 25,
        concepto: 'vuelto',
      })
    })

    await user.clear(screen.getByTestId('caja-conteo-b1000'))
    await user.type(screen.getByTestId('caja-conteo-b1000'), '1')
    await user.type(screen.getByTestId('caja-obs'), 'ok')
    await user.click(screen.getByTestId('caja-cerrar'))
    await waitFor(() => {
      expect(cajaAPI.close).toHaveBeenCalledWith(10, {
        conteo: { b1000: 1 },
        observaciones: 'ok',
      })
    })
  })

  it('toggles esEfectivo on forma de pago', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('caja-fp-efectivo-2')).toBeInTheDocument()
    })
    await user.click(screen.getByTestId('caja-fp-efectivo-2'))
    await waitFor(() => {
      expect(formasPagoAPI.patch).toHaveBeenCalledWith(2, { esEfectivo: true })
    })
  })

  it('shows empty state and load error', async () => {
    mockHappyLoad([])
    const { unmount } = render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('caja-empty')).toBeInTheDocument()
    })
    unmount()

    vi.mocked(cajaAPI.listCajas).mockRejectedValue(new Error('boom'))
    render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('async-wrapper-error')).toBeInTheDocument()
    })
  })

  it('shows PDF link for closed turnos', async () => {
    mockHappyLoad([closedTurno])
    render(
      <I18nextProvider i18n={i18n}>
        <CajaPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('caja-pdf-11')).toBeInTheDocument()
    })
    expect(screen.getByTestId('caja-pdf-11')).toHaveAttribute(
      'href',
      '/api/turnos-caja/11/pdf',
    )
  })
})
