import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import type {
  FormulaCostoResult,
  FormulaProduccionRow,
  FormulaProyeccionResult,
} from '@bizcode/types'
import i18n from '@/i18n/config'
import { formulasProduccionAPI } from '@/lib/api'
import FormulasProduccionPage from './index'

vi.mock('@/lib/api', () => ({
  formulasProduccionAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    getCosto: vi.fn(),
    proyectar: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const FORMULA_ROW: FormulaProduccionRow = {
  id: 10,
  tenantId: 1,
  articuloId: 100,
  rendimiento: 1,
  unidadRendimiento: 'unidad',
  version: 1,
  activa: true,
  observaciones: null,
  createdAt: '2026-07-24T12:00:00.000Z',
  updatedAt: '2026-07-24T12:00:00.000Z',
  articulo: {
    id: 100,
    codigo: 100,
    descripcion: 'Producto terminado',
    costo: 50,
    precioLista1: 120,
  },
  insumos: [
    {
      id: 1,
      formulaId: 10,
      articuloId: 200,
      cantidad: 2,
      unidad: 'kg',
      esOpcional: false,
      orden: 0,
      articulo: {
        id: 200,
        codigo: 200,
        descripcion: 'Insumo A',
        costo: 10,
        umedida: 'kg',
        tipo: 'insumo',
      },
    },
  ],
}

const COSTO: FormulaCostoResult = {
  formulaId: 10,
  articuloId: 100,
  rendimiento: 1,
  costoInsumos: 20,
  costoUnitario: 20,
  precioVenta: 120,
  margenAbsoluto: 100,
  margenPorcentaje: 83.33,
  lineas: [
    {
      articuloId: 200,
      descripcion: 'Insumo A',
      cantidad: 2,
      unidad: 'kg',
      costoUnitario: 10,
      costoLinea: 20,
      esOpcional: false,
    },
  ],
}

const PROYECCION: FormulaProyeccionResult = {
  formulaId: 10,
  articuloId: 100,
  unidadesObjetivo: 5,
  corridas: 5,
  lineas: [
    {
      articuloId: 200,
      codigo: 200,
      descripcion: 'Insumo A',
      cantidad: 10,
      unidad: 'kg',
      esOpcional: false,
    },
  ],
}

describe('FormulasProduccionPage (#248)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(formulasProduccionAPI.list).mockResolvedValue({
      success: true,
      data: [FORMULA_ROW],
      total: 1,
      take: 100,
      skip: 0,
    })
    vi.mocked(formulasProduccionAPI.getById).mockResolvedValue(FORMULA_ROW)
    vi.mocked(formulasProduccionAPI.getCosto).mockResolvedValue(COSTO)
    vi.mocked(formulasProduccionAPI.create).mockResolvedValue({ ...FORMULA_ROW, id: 11, version: 1 })
    vi.mocked(formulasProduccionAPI.update).mockResolvedValue({ ...FORMULA_ROW, id: 12, version: 2 })
    vi.mocked(formulasProduccionAPI.deactivate).mockResolvedValue({ ...FORMULA_ROW, activa: false })
    vi.mocked(formulasProduccionAPI.proyectar).mockResolvedValue(PROYECCION)
  })

  it('loads formulas table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )

    expect(screen.getByTestId('formulas-produccion-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('formulas-produccion-table')).toBeInTheDocument()
    })
    expect(formulasProduccionAPI.list).toHaveBeenCalled()
    expect(screen.getByTestId('formulas-produccion-row-10')).toBeInTheDocument()
  })

  it('shows empty state when there are no formulas', async () => {
    vi.mocked(formulasProduccionAPI.list).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 100,
      skip: 0,
    })

    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('formulas-produccion-empty')).toBeInTheDocument()
    })
  })

  it('creates a formula with inputs', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('formulas-produccion-create-form')).toBeInTheDocument())

    fireEvent.change(screen.getByTestId('formulas-produccion-articulo-id'), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId('formulas-produccion-rendimiento'), { target: { value: '1' } })
    fireEvent.change(screen.getByTestId('formulas-produccion-insumo-articulo-0'), {
      target: { value: '200' },
    })
    fireEvent.change(screen.getByTestId('formulas-produccion-insumo-cantidad-0'), {
      target: { value: '2' },
    })
    await user.selectOptions(screen.getByTestId('formulas-produccion-insumo-unidad-0'), 'kg')
    await user.click(screen.getByTestId('formulas-produccion-create'))

    await waitFor(() => {
      expect(formulasProduccionAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          articuloId: 100,
          rendimiento: 1,
          insumos: [expect.objectContaining({ articuloId: 200, cantidad: 2, unidad: 'kg' })],
        }),
      )
      expect(screen.getByTestId('formulas-produccion-success')).toBeInTheDocument()
    })
  })

  it('loads cost panel when a formula is selected', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('formulas-produccion-select-10')).toBeInTheDocument())
    await user.click(screen.getByTestId('formulas-produccion-select-10'))

    await waitFor(() => {
      expect(formulasProduccionAPI.getById).toHaveBeenCalledWith(10)
      expect(formulasProduccionAPI.getCosto).toHaveBeenCalledWith(10)
      expect(screen.getByTestId('formulas-produccion-cost')).toBeInTheDocument()
      expect(screen.getByTestId('formulas-produccion-cost-unitario')).toHaveTextContent('20')
      expect(screen.getByTestId('formulas-produccion-cost-precio')).toHaveTextContent('120')
      expect(screen.getByTestId('formulas-produccion-cost-margen')).toBeInTheDocument()
    })
  })

  it('projects input quantities for selected formula', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('formulas-produccion-select-10')).toBeInTheDocument())
    await user.click(screen.getByTestId('formulas-produccion-select-10'))
    await waitFor(() => expect(screen.getByTestId('formulas-produccion-unidades')).toBeInTheDocument())

    fireEvent.change(screen.getByTestId('formulas-produccion-unidades'), { target: { value: '5' } })
    await user.click(screen.getByTestId('formulas-produccion-project'))

    await waitFor(() => {
      expect(formulasProduccionAPI.proyectar).toHaveBeenCalledWith(10, 5)
      expect(screen.getByTestId('formulas-produccion-proyeccion-table')).toBeInTheDocument()
      expect(screen.getByTestId('formulas-produccion-proyeccion-corridas')).toHaveTextContent('5')
    })
  })

  it('shows load error when list request fails', async () => {
    vi.mocked(formulasProduccionAPI.list).mockRejectedValue(new Error('network'))

    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('formulas-produccion-error')).toBeInTheDocument()
    })
  })

  it('rejects create without valid inputs', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <FormulasProduccionPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('formulas-produccion-create-form')).toBeInTheDocument())

    fireEvent.change(screen.getByTestId('formulas-produccion-articulo-id'), { target: { value: '100' } })
    fireEvent.change(screen.getByTestId('formulas-produccion-rendimiento'), { target: { value: '1' } })
    fireEvent.submit(screen.getByTestId('formulas-produccion-create-form'))

    await waitFor(() => {
      expect(screen.getByTestId('formulas-produccion-error')).toBeInTheDocument()
    })
    expect(formulasProduccionAPI.create).not.toHaveBeenCalled()
  })
})
