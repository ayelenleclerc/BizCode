import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PortalPedidosPage from './PortalPedidosPage'
import { portalAPI } from '@/lib/portalApi'

const portalT = (key: string) => key

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: portalT }),
}))

vi.mock('@/contexts/PortalAuthContext', () => ({
  usePortalAuth: () => ({ tenantSlug: 'demo' }),
}))

vi.mock('@/lib/portalApi', () => ({
  portalAPI: {
    listPedidos: vi.fn(),
  },
}))

describe('PortalPedidosPage', () => {
  beforeEach(() => {
    vi.mocked(portalAPI.listPedidos).mockResolvedValue({
      pedidos: [
        {
          id: 42,
          estado: 'confirmado',
          total: '2500.00',
          createdAt: '2026-06-01T00:00:00.000Z',
          validUntil: null,
          facturaRef: 'B-0001-00000042',
          remitoEstado: 'pendiente',
        },
      ],
      total: 1,
    })
  })

  it('renders orders table', async () => {
    render(<PortalPedidosPage />)
    await waitFor(() => {
      expect(screen.getByTestId('portal-pedidos-table')).toBeInTheDocument()
    })
    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('B-0001-00000042')).toBeInTheDocument()
  })

  it('shows empty state when there are no orders', async () => {
    vi.mocked(portalAPI.listPedidos).mockResolvedValue({ pedidos: [], total: 0 })
    render(<PortalPedidosPage />)
    await waitFor(() => {
      expect(screen.getByTestId('portal-pedidos-empty')).toBeInTheDocument()
    })
  })
})
