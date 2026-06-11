import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PortalCuentaCorrientePage from './PortalCuentaCorrientePage'
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
    getCuentaCorriente: vi.fn(),
    downloadEstadoCuentaPdf: vi.fn(),
  },
}))

describe('PortalCuentaCorrientePage', () => {
  beforeEach(() => {
    vi.mocked(portalAPI.getCuentaCorriente).mockResolvedValue({
      clienteId: 10,
      codigo: 1,
      rsocial: 'Cliente Demo',
      saldo: '1500.00',
      creditLimit: null,
      excedeLimite: false,
      movimientos: [
        {
          id: 1,
          fecha: '2026-06-01T00:00:00.000Z',
          tipo: 'factura',
          referencia: 'Factura B-0001',
          monto: '1500.00',
          saldoPost: '1500.00',
          usuarioId: 1,
          notas: null,
        },
      ],
      serie: [],
      total: 1,
      limit: 50,
      offset: 0,
    })
  })

  it('loads and displays account statement', async () => {
    render(<PortalCuentaCorrientePage />)
    await waitFor(() => {
      expect(screen.getByTestId('portal-cc-page')).toBeInTheDocument()
    })
    expect(screen.getByTestId('portal-cc-saldo')).toHaveTextContent('1500.00')
    expect(screen.getByText('Factura B-0001')).toBeInTheDocument()
  })
})
