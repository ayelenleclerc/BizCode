import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { articulosAPI, listasPreciosAPI } from '@/lib/api'
import ListasPreciosPage from './index'

vi.mock('@/lib/api', () => ({
  listasPreciosAPI: {
    list: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    upsertItem: vi.fn(),
    removeItem: vi.fn(),
    bulkUpdate: vi.fn(),
    getPrecioEfectivo: vi.fn(),
  },
  articulosAPI: {
    list: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const LISTA = {
  id: 2,
  tenantId: 1,
  nombre: 'Mayorista',
  moneda: 'ARS',
  activa: true,
  esDefault: false,
  vigenciaHasta: null,
  createdAt: '2026-07-21T00:00:00.000Z',
  updatedAt: '2026-07-21T00:00:00.000Z',
  _count: { items: 1, clientes: 0 },
}

const LISTA_DETAIL = {
  ...LISTA,
  items: [
    {
      id: 11,
      tenantId: 1,
      listaPrecioId: 2,
      articuloId: 5,
      tipoPrecio: 'fijo' as const,
      precio: 80,
      porcentaje: null,
      createdAt: '2026-07-21T00:00:00.000Z',
      updatedAt: '2026-07-21T00:00:00.000Z',
      escalonados: [],
      articulo: { id: 5, codigo: 100, descripcion: 'Producto A' },
    },
  ],
}

function mockHappy(listas = [LISTA]) {
  vi.mocked(listasPreciosAPI.list).mockResolvedValue({
    success: true,
    data: listas,
    total: listas.length,
    take: 100,
    skip: 0,
  })
  vi.mocked(articulosAPI.list).mockResolvedValue([
    { id: 5, codigo: 100, descripcion: 'Producto A', activo: true, precioLista1: 100 },
    { id: 6, codigo: 101, descripcion: 'Producto B', activo: true, precioLista1: 200 },
  ])
  vi.mocked(listasPreciosAPI.getById).mockResolvedValue(LISTA_DETAIL)
  vi.mocked(listasPreciosAPI.create).mockResolvedValue(LISTA)
  vi.mocked(listasPreciosAPI.bulkUpdate).mockResolvedValue({
    success: true,
    preview: true,
    afectados: 1,
    ejemplos: [
      { listaPrecioItemId: 11, articuloId: 5, descripcion: 'Producto A', precioActual: 80, precioNuevo: 88 },
    ],
  })
}

describe('ListasPreciosPage (#234)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHappy()
  })

  it('renders the price list table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ListasPreciosPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('listas-precios-table')).toBeInTheDocument()
    })
    expect(screen.getByText('Mayorista')).toBeInTheDocument()
  })

  it('creates a new price list', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <ListasPreciosPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('listas-precios-nombre')).toBeInTheDocument())

    await user.type(screen.getByTestId('listas-precios-nombre'), 'Minorista')
    await user.click(screen.getByTestId('listas-precios-crear'))
    await waitFor(() => {
      expect(listasPreciosAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Minorista' }),
      )
    })
  })

  it('opens detail and previews a bulk update', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <ListasPreciosPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('listas-precios-edit-2')).toBeInTheDocument())

    await user.click(screen.getByTestId('listas-precios-edit-2'))
    await waitFor(() => {
      expect(screen.getByTestId('listas-precios-items-table')).toBeInTheDocument()
    })
    expect(screen.getByText('100 — Producto A')).toBeInTheDocument()

    await user.type(screen.getByTestId('listas-precios-bulk-porcentaje'), '10')
    await user.click(screen.getByTestId('listas-precios-bulk-preview'))
    await waitFor(() => {
      expect(screen.getByTestId('listas-precios-bulk-result')).toBeInTheDocument()
    })
    expect(listasPreciosAPI.bulkUpdate).toHaveBeenCalledWith(2, { porcentaje: 10, preview: true })
  })

  it('shows the empty state', async () => {
    mockHappy([])
    render(
      <I18nextProvider i18n={i18n}>
        <ListasPreciosPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('listas-precios-empty')).toBeInTheDocument()
    })
  })
})
