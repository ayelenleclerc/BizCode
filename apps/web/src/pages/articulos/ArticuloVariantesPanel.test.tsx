import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { catalogVariantsAPI } from '@/lib/api'
import ArticuloVariantesPanel from './ArticuloVariantesPanel'

vi.mock('@/lib/api', () => ({
  catalogVariantsAPI: {
    listVariantes: vi.fn(),
    stockFamilia: vi.fn(),
    listImagenes: vi.fn(),
    listOfertas: vi.fn(),
    getCategoria: vi.fn(),
    generarVariantes: vi.fn(),
    uploadImagen: vi.fn(),
    createOferta: vi.fn(),
    removeOferta: vi.fn(),
    removeImagen: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ArticuloVariantesPanel', () => {
  beforeEach(() => {
    vi.mocked(catalogVariantsAPI.listVariantes).mockResolvedValue([])
    vi.mocked(catalogVariantsAPI.stockFamilia).mockResolvedValue({
      success: true,
      padreId: 5,
      stockFamilia: 0,
      variantes: [],
    })
    vi.mocked(catalogVariantsAPI.listImagenes).mockResolvedValue([])
    vi.mocked(catalogVariantsAPI.listOfertas).mockResolvedValue([])
    vi.mocked(catalogVariantsAPI.getCategoria).mockResolvedValue({
      id: 1,
      tenantId: 1,
      nombre: 'Ropa',
      codigo: null,
      padreId: null,
      precioDefault: null,
      activo: true,
      createdAt: '2026-07-23T00:00:00.000Z',
      updatedAt: '2026-07-23T00:00:00.000Z',
      atributos: [
        {
          id: 10,
          tenantId: 1,
          categoriaId: 1,
          nombre: 'Color',
          orden: 0,
          valores: [{ id: 100, atributoId: 10, valor: 'Roja', orden: 0 }],
        },
      ],
    })
  })

  it('shows need-saved hint when articuloId is null', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ArticuloVariantesPanel articuloId={null} categoriaId={null} />
      </I18nextProvider>,
    )
    expect(screen.getByTestId('variantes-need-saved')).toBeInTheDocument()
  })

  it('loads variantes panel for a parent article', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ArticuloVariantesPanel articuloId={5} categoriaId={1} esPadre />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('articulo-variantes-panel')).toBeInTheDocument()
      expect(screen.getByTestId('badge-padre')).toBeInTheDocument()
      expect(screen.getByTestId('stock-familia')).toBeInTheDocument()
      expect(screen.getByTestId('variantes-empty')).toBeInTheDocument()
    })
  })

  it('shows variant table and allows generating from attributes', async () => {
    const user = userEvent.setup()
    vi.mocked(catalogVariantsAPI.listVariantes).mockResolvedValue([
      {
        id: 11,
        codigo: 11,
        descripcion: 'Remera - Roja',
        padreId: 5,
        esPadre: false,
        categoriaId: 1,
        heredaPrecio: true,
        precioOverride: null,
        costoOverride: null,
        precioLista1: 100,
        costo: 40,
        stock: 2,
        activo: true,
        atributoValores: [],
      },
    ])
    vi.mocked(catalogVariantsAPI.generarVariantes).mockResolvedValue({
      success: true,
      creadas: 1,
      variantes: [],
    })

    render(
      <I18nextProvider i18n={i18n}>
        <ArticuloVariantesPanel articuloId={5} categoriaId={1} esPadre />
      </I18nextProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('variantes-table')).toBeInTheDocument())
    await user.click(screen.getByTestId('valor-100'))
    await user.click(screen.getByTestId('generar-variantes'))
    await waitFor(() => {
      expect(catalogVariantsAPI.generarVariantes).toHaveBeenCalled()
    })
  })
})
