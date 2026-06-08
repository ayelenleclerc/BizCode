import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProveedorCatalogoSection, { getPrecioListaStaleness } from './ProveedorCatalogoSection'

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const {
  mockListCatalogo,
  mockCreateCatalogoEntry,
  mockUpdateCatalogoEntry,
  mockImportCatalogoFromCsv,
  mockArticulosList,
} = vi.hoisted(() => ({
  mockListCatalogo: vi.fn(),
  mockCreateCatalogoEntry: vi.fn(),
  mockUpdateCatalogoEntry: vi.fn(),
  mockImportCatalogoFromCsv: vi.fn(),
  mockArticulosList: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  proveedoresAPI: {
    listCatalogo: mockListCatalogo,
    createCatalogoEntry: mockCreateCatalogoEntry,
    updateCatalogoEntry: mockUpdateCatalogoEntry,
    importCatalogoFromCsv: mockImportCatalogoFromCsv,
  },
  articulosAPI: {
    list: mockArticulosList,
  },
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
}))

const sampleRow = {
  id: 1,
  articuloId: 10,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite girasol 1L',
  precioLista: '1500.00',
  precioListaFecha: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  unidadCompra: 'caja',
  multiplo: '1.00',
  activo: true,
  articulo: { id: 10, codigo: 1001, descripcion: 'Aceite interno' },
}

describe('getPrecioListaStaleness', () => {
  it('returns none when there is no list price', () => {
    expect(getPrecioListaStaleness(null, false)).toBe('none')
  })

  it('returns warning after 30 days', () => {
    const fecha = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
    expect(getPrecioListaStaleness(fecha, true)).toBe('warning')
  })

  it('returns danger after 90 days', () => {
    const fecha = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
    expect(getPrecioListaStaleness(fecha, true)).toBe('danger')
  })
})

describe('ProveedorCatalogoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListCatalogo.mockResolvedValue([sampleRow])
  })

  it('renders catalog table with price staleness indicator', async () => {
    render(<ProveedorCatalogoSection proveedorId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-catalogo-table')).toBeInTheDocument()
    })
    const priceCell = screen.getByTestId('catalogo-precio-10')
    expect(priceCell).toHaveAttribute('data-staleness', 'warning')
    expect(screen.getByText('AG-1000')).toBeInTheDocument()
  })

  it('creates catalog entry from add form', async () => {
    const user = userEvent.setup()
    mockArticulosList.mockResolvedValue([{ id: 10, codigo: 1001, descripcion: 'Aceite interno' }])
    mockCreateCatalogoEntry.mockResolvedValue(sampleRow)

    render(<ProveedorCatalogoSection proveedorId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('proveedor-catalogo-section')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('proveedor-catalogo-btn-add'))
    await user.type(screen.getByTestId('catalogo-add-codigo-interno'), '1001')
    await user.tab()
    await user.type(screen.getByTestId('catalogo-add-codigo-proveedor'), 'AG-NEW')
    await user.click(screen.getByTestId('catalogo-add-submit'))

    await waitFor(() => {
      expect(mockCreateCatalogoEntry).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          articuloId: 10,
          codigoProveedor: 'AG-NEW',
        }),
      )
    })
  })

  it('updates catalog entry inline', async () => {
    const user = userEvent.setup()
    mockUpdateCatalogoEntry.mockResolvedValue({ ...sampleRow, codigoProveedor: 'AG-UPD' })

    render(<ProveedorCatalogoSection proveedorId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('catalogo-edit-btn-10')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('catalogo-edit-btn-10'))
    const codeInput = screen.getByTestId('catalogo-edit-codigo-proveedor')
    await user.clear(codeInput)
    await user.type(codeInput, 'AG-UPD')
    await user.click(screen.getByTestId('catalogo-edit-submit'))

    await waitFor(() => {
      expect(mockUpdateCatalogoEntry).toHaveBeenCalledWith(
        1,
        10,
        expect.objectContaining({ codigoProveedor: 'AG-UPD' }),
      )
    })
  })
})
