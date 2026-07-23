import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { catalogVariantsAPI } from '@/lib/api'
import CategoriasArticuloPage from './index'

vi.mock('@/lib/api', () => ({
  catalogVariantsAPI: {
    listCategorias: vi.fn(),
    getCategoria: vi.fn(),
    createCategoria: vi.fn(),
    removeCategoria: vi.fn(),
    addAtributo: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const CATEGORIA = {
  id: 1,
  tenantId: 1,
  nombre: 'Indumentaria',
  codigo: 'IND',
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
}

describe('CategoriasArticuloPage', () => {
  beforeEach(() => {
    vi.mocked(catalogVariantsAPI.listCategorias).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 200,
      skip: 0,
    })
    vi.mocked(catalogVariantsAPI.createCategoria).mockResolvedValue(CATEGORIA)
    vi.mocked(catalogVariantsAPI.getCategoria).mockResolvedValue(CATEGORIA)
    vi.mocked(catalogVariantsAPI.addAtributo).mockResolvedValue(CATEGORIA.atributos![0]!)
    vi.mocked(catalogVariantsAPI.removeCategoria).mockResolvedValue(undefined)
  })

  it('renders empty state after load', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <CategoriasArticuloPage />
      </I18nextProvider>,
    )
    expect(screen.getByTestId('categorias-articulo-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('categorias-empty')).toBeInTheDocument()
    })
  })

  it('creates a category and shows table rows', async () => {
    const user = userEvent.setup()
    vi.mocked(catalogVariantsAPI.listCategorias)
      .mockResolvedValueOnce({
        success: true,
        data: [],
        total: 0,
        take: 200,
        skip: 0,
      })
      .mockResolvedValue({
        success: true,
        data: [CATEGORIA],
        total: 1,
        take: 200,
        skip: 0,
      })

    render(
      <I18nextProvider i18n={i18n}>
        <CategoriasArticuloPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('categorias-empty')).toBeInTheDocument())

    await user.type(screen.getByTestId('categoria-nombre'), 'Indumentaria')
    await user.click(screen.getByTestId('categoria-create'))

    await waitFor(() => {
      expect(catalogVariantsAPI.createCategoria).toHaveBeenCalled()
      expect(screen.getByTestId('categoria-row-1')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('categoria-select-1'))
    await waitFor(() => {
      expect(screen.getByTestId('categoria-detail')).toBeInTheDocument()
      expect(screen.getByTestId('atributo-10')).toBeInTheDocument()
    })
  })
})
