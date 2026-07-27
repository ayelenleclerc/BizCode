import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { depositosAPI } from '@/lib/api'
import ArticuloStockDepositosPanel from './ArticuloStockDepositosPanel'

vi.mock('@/lib/api', () => ({
  depositosAPI: {
    stockPorArticulo: vi.fn(),
  },
}))

vi.mock('@/components/IfModule', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('ArticuloStockDepositosPanel (#236)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when articuloId is missing', () => {
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <ArticuloStockDepositosPanel articuloId={null} />
      </I18nextProvider>,
    )
    expect(container).toBeEmptyDOMElement()
    expect(depositosAPI.stockPorArticulo).not.toHaveBeenCalled()
  })

  it('renders stock breakdown by deposit', async () => {
    vi.mocked(depositosAPI.stockPorArticulo).mockResolvedValue({
      success: true,
      articuloId: 5,
      stockTotal: 12,
      enTransito: 2,
      depositos: [
        {
          id: 1,
          tenantId: 1,
          articuloId: 5,
          depositoId: 1,
          depositoCodigo: 'DEFAULT',
          depositoNombre: 'Central',
          cantidad: 10,
          stockMin: 0,
          stockMax: null,
          createdAt: '2026-07-23T00:00:00.000Z',
          updatedAt: '2026-07-23T00:00:00.000Z',
        },
        {
          id: 2,
          tenantId: 1,
          articuloId: 5,
          depositoId: 2,
          depositoCodigo: 'NORTE',
          depositoNombre: 'Norte',
          cantidad: 2,
          stockMin: 0,
          stockMax: null,
          createdAt: '2026-07-23T00:00:00.000Z',
          updatedAt: '2026-07-23T00:00:00.000Z',
        },
      ],
    })

    render(
      <I18nextProvider i18n={i18n}>
        <ArticuloStockDepositosPanel articuloId={5} />
      </I18nextProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('stock-depositos-panel')).toBeInTheDocument()
      expect(screen.getByTestId('stock-total')).toHaveTextContent('12')
    })
    expect(screen.getByTestId('stock-en-transito')).toHaveTextContent('2')
    expect(screen.getByTestId('stock-dep-1')).toHaveTextContent('DEFAULT')
    expect(screen.getByTestId('stock-dep-2')).toHaveTextContent('NORTE')
  })
})
