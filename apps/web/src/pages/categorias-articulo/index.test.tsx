import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

describe('CategoriasArticuloPage', () => {
  beforeEach(() => {
    vi.mocked(catalogVariantsAPI.listCategorias).mockResolvedValue({
      success: true,
      data: [],
      total: 0,
      take: 200,
      skip: 0,
    })
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
})
