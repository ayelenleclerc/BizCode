import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import type { OrdenProduccionDisponibilidad, OrdenProduccionRow } from '@bizcode/types'
import i18n from '@/i18n/config'
import { ordenesProduccionAPI } from '@/lib/api'
import OrdenesProduccionPage from './index'

vi.mock('@/lib/api', () => ({
  ordenesProduccionAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    getDisponibilidad: vi.fn(),
    create: vi.fn(),
    iniciar: vi.fn(),
    completar: vi.fn(),
    cancelar: vi.fn(),
    sugerirCompra: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const ORDEN_ROW: OrdenProduccionRow = {
  id: 5,
  tenantId: 1,
  numero: 1,
  articuloId: 100,
  formulaId: 10,
  depositoId: 3,
  cantidadPlanif: 500,
  cantidadReal: null,
  estado: 'planificada',
  fechaPlanif: '2026-07-24T12:00:00.000Z',
  fechaInicio: null,
  fechaFin: null,
  costoTotal: null,
  operadorId: null,
  observaciones: null,
  createdAt: '2026-07-24T12:00:00.000Z',
  updatedAt: '2026-07-24T12:00:00.000Z',
  articulo: {
    id: 100,
    codigo: 100,
    descripcion: 'Facturas de manteca',
    costo: 0,
    precioLista1: 120,
  },
  deposito: { id: 3, codigo: 'CEN', nombre: 'Central' },
  formula: { id: 10, version: 1, rendimiento: 12 },
  insumos: [
    {
      id: 1,
      ordenId: 5,
      articuloId: 200,
      cantidadPlan: 250,
      cantidadReal: null,
      unidad: 'kg',
      costo: null,
      esOpcional: false,
      linea: 0,
      articulo: {
        id: 200,
        codigo: 200,
        descripcion: 'Harina 0000',
        costo: 1800,
        umedida: 'kg',
        tipo: 'articulo',
      },
    },
  ],
}

const DISPONIBILIDAD: OrdenProduccionDisponibilidad = {
  ordenId: 5,
  depositoId: 3,
  suficiente: false,
  lineas: [
    {
      articuloId: 200,
      codigo: 200,
      descripcion: 'Harina 0000',
      unidad: 'kg',
      necesario: 250,
      disponible: 235,
      faltante: 15,
      esOpcional: false,
      mueveStock: true,
    },
  ],
}

describe('OrdenesProduccionPage (#249)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ordenesProduccionAPI.list).mockResolvedValue({
      success: true,
      data: [ORDEN_ROW],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(ordenesProduccionAPI.getById).mockResolvedValue(ORDEN_ROW)
    vi.mocked(ordenesProduccionAPI.getDisponibilidad).mockResolvedValue(DISPONIBILIDAD)
    vi.mocked(ordenesProduccionAPI.create).mockResolvedValue({ ...ORDEN_ROW, id: 6, numero: 2 })
    vi.mocked(ordenesProduccionAPI.iniciar).mockResolvedValue({
      ...ORDEN_ROW,
      estado: 'en_proceso',
    })
    vi.mocked(ordenesProduccionAPI.completar).mockResolvedValue({
      ...ORDEN_ROW,
      estado: 'completada',
      cantidadReal: 500,
      costoTotal: 450000,
    })
    vi.mocked(ordenesProduccionAPI.cancelar).mockResolvedValue({
      ...ORDEN_ROW,
      estado: 'cancelada',
    })
    vi.mocked(ordenesProduccionAPI.sugerirCompra).mockResolvedValue({
      ordenCompraId: 77,
      items: [{ articuloId: 200, cantidad: 15, costoUnitario: 1800 }],
    })
  })

  const renderPage = () =>
    render(
      <I18nextProvider i18n={i18n}>
        <OrdenesProduccionPage />
      </I18nextProvider>,
    )

  it('loads production order list', async () => {
    renderPage()

    expect(screen.getByTestId('ordenes-produccion-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('ordenes-produccion-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('ordenes-produccion-row-5')).toHaveTextContent('OP-00001')
  })

  it('shows empty state when there are no orders', async () => {
    vi.mocked(ordenesProduccionAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 100,
      skip: 0,
    })

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('ordenes-produccion-empty')).toBeInTheDocument()
    })
  })

  it('creates an order from the active formula', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-create-form')).toBeInTheDocument(),
    )

    fireEvent.change(screen.getByTestId('ordenes-produccion-articulo-id'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByTestId('ordenes-produccion-cantidad'), {
      target: { value: '500' },
    })
    await user.click(screen.getByTestId('ordenes-produccion-create'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ articuloId: 100, cantidadPlanif: 500 }),
      )
      expect(screen.getByTestId('ordenes-produccion-success')).toBeInTheDocument()
    })
  })

  it('warns about missing inputs on availability panel', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-select-5')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('ordenes-produccion-select-5'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.getDisponibilidad).toHaveBeenCalledWith(5)
      expect(screen.getByTestId('ordenes-produccion-availability-warning')).toBeInTheDocument()
      expect(screen.getByTestId('ordenes-produccion-availability-row-200')).toHaveTextContent('15')
    })
  })

  it('starts production for the selected order', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-select-5')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('ordenes-produccion-select-5'))
    await waitFor(() => expect(screen.getByTestId('ordenes-produccion-start')).toBeInTheDocument())

    await user.click(screen.getByTestId('ordenes-produccion-start'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.iniciar).toHaveBeenCalledWith(5)
      expect(screen.getByTestId('ordenes-produccion-success')).toBeInTheDocument()
    })
  })

  it('completes production with real consumption', async () => {
    const user = userEvent.setup()
    vi.mocked(ordenesProduccionAPI.getById).mockResolvedValue({
      ...ORDEN_ROW,
      estado: 'en_proceso',
    })
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-select-5')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('ordenes-produccion-select-5'))
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-complete-form')).toBeInTheDocument(),
    )

    fireEvent.change(screen.getByTestId('ordenes-produccion-cantidad-real'), {
      target: { value: '480' },
    })
    fireEvent.change(screen.getByTestId('ordenes-produccion-consumo-200'), {
      target: { value: '260' },
    })
    await user.click(screen.getByTestId('ordenes-produccion-complete'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.completar).toHaveBeenCalledWith(5, {
        cantidadReal: 480,
        insumos: [{ articuloId: 200, cantidadReal: 260 }],
      })
    })
  })

  it('suggests a purchase order for missing inputs', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-select-5')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('ordenes-produccion-select-5'))
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-suggest-purchase')).toBeInTheDocument(),
    )

    fireEvent.change(screen.getByTestId('ordenes-produccion-proveedor'), {
      target: { value: '9' },
    })
    await user.click(screen.getByTestId('ordenes-produccion-suggest-purchase'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.sugerirCompra).toHaveBeenCalledWith(5, 9)
      expect(screen.getByTestId('ordenes-produccion-success')).toHaveTextContent('77')
    })
  })

  it('cancels the selected order', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-select-5')).toBeInTheDocument(),
    )
    await user.click(screen.getByTestId('ordenes-produccion-select-5'))
    await waitFor(() => expect(screen.getByTestId('ordenes-produccion-cancel')).toBeInTheDocument())

    await user.click(screen.getByTestId('ordenes-produccion-cancel'))

    await waitFor(() => {
      expect(ordenesProduccionAPI.cancelar).toHaveBeenCalledWith(5)
    })
  })

  it('shows load error when list request fails', async () => {
    vi.mocked(ordenesProduccionAPI.list).mockRejectedValue(new Error('network'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByTestId('ordenes-produccion-error')).toBeInTheDocument()
    })
  })

  it('rejects create with invalid article id', async () => {
    renderPage()
    await waitFor(() =>
      expect(screen.getByTestId('ordenes-produccion-create-form')).toBeInTheDocument(),
    )

    fireEvent.change(screen.getByTestId('ordenes-produccion-cantidad'), {
      target: { value: '10' },
    })
    fireEvent.submit(screen.getByTestId('ordenes-produccion-create-form'))

    await waitFor(() => {
      expect(screen.getByTestId('ordenes-produccion-error')).toBeInTheDocument()
    })
    expect(ordenesProduccionAPI.create).not.toHaveBeenCalled()
  })
})
