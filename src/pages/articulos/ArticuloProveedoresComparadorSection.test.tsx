import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import ArticuloProveedoresComparadorSection from './ArticuloProveedoresComparadorSection'
import { useAuth } from '@/contexts/AuthContext'

const mockListProveedoresComparador = vi.hoisted(() => vi.fn())

vi.mock('@/lib/api', () => ({
  articulosAPI: {
    listProveedoresComparador: mockListProveedoresComparador,
  },
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location-state">{JSON.stringify(location.state)}</div>
}

const sampleData = {
  articuloId: 10,
  articuloCodigo: 1001,
  articuloDescripcion: 'Aceite girasol',
  proveedorMasBaratoId: 2,
  proveedores: [
    {
      proveedorId: 1,
      proveedorCodigo: 501,
      proveedorRsocial: 'Proveedor A',
      codigoProveedor: 'AG-1000',
      descripcionProveedor: 'Aceite A',
      precioLista: '1600.00',
      precioListaFecha: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      precioDesactualizado: false,
      ultimaCompraFecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      esMasBarato: false,
    },
    {
      proveedorId: 2,
      proveedorCodigo: 502,
      proveedorRsocial: 'Proveedor B',
      codigoProveedor: 'AG-2000',
      descripcionProveedor: null,
      precioLista: '1500.00',
      precioListaFecha: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      precioDesactualizado: true,
      ultimaCompraFecha: null,
      esMasBarato: true,
    },
  ],
}

describe('ArticuloProveedoresComparadorSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListProveedoresComparador.mockResolvedValue(sampleData)
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      claims: {
        role: 'owner',
        permissions: ['products.read', 'suppliers.manage'],
      },
    } as ReturnType<typeof useAuth>)
  })

  it('renders comparator table highlighting cheapest supplier', async () => {
    render(
      <MemoryRouter>
        <ArticuloProveedoresComparadorSection articuloId={10} />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('articulo-comparador-table')).toBeInTheDocument()
    })

    expect(screen.getByTestId('comparador-row-2')).toHaveAttribute('data-cheapest', 'true')
    expect(screen.getByTestId('comparador-precio-fecha-2')).toBeInTheDocument()
    expect(screen.getByText('AG-2000')).toBeInTheDocument()
  })

  it('reloads when sort changes', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ArticuloProveedoresComparadorSection articuloId={10} />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('articulo-comparador-sort-by')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByTestId('articulo-comparador-sort-by'), 'ultimaCompra')

    await waitFor(() => {
      expect(mockListProveedoresComparador).toHaveBeenLastCalledWith(10, {
        sortBy: 'ultimaCompra',
        sortDir: 'asc',
      })
    })
  })

  it('navigates to compras with OC prefill when PO button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ArticuloProveedoresComparadorSection articuloId={10} />
        <LocationProbe />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('comparador-oc-btn-2')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('comparador-oc-btn-2'))

    await waitFor(() => {
      const state = JSON.parse(screen.getByTestId('location-state').textContent ?? '{}')
      expect(state).toEqual({
        ocPrefill: {
          proveedorId: 2,
          articuloId: 10,
          costoUnitario: '1500.00',
        },
      })
    })
  })

  it('shows empty state when no suppliers', async () => {
    mockListProveedoresComparador.mockResolvedValue({
      ...sampleData,
      proveedorMasBaratoId: null,
      proveedores: [],
    })

    render(
      <MemoryRouter>
        <ArticuloProveedoresComparadorSection articuloId={10} />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('articulo-comparador-empty')).toBeInTheDocument()
    })
  })
})
