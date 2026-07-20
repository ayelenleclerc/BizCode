import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import GarantiasPage from './index'

vi.mock('@/lib/api', () => ({
  garantiasAPI: {
    list: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 1,
          articuloId: 10,
          facturaId: null,
          facturaItemId: null,
          nroSerie: 'SN-99',
          nroImei: null,
          descripcionEquipo: 'TV',
          clienteId: 1,
          fechaVenta: '2025-01-01T00:00:00.000Z',
          mesesGarantia: 12,
          fechaVencimiento: '2026-01-01T00:00:00.000Z',
          estado: 'vigente',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          cliente: { id: 1, codigo: 1, rsocial: 'Cliente' },
          articulo: { id: 10, codigo: 100, descripcion: 'TV Samsung' },
          usos: [],
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
      counts: {
        vigente: 1,
        vencida: 0,
        anulada: 0,
        vencenEsteMes: 0,
        vencenProximos3Meses: 1,
      },
    }),
    anular: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('GarantiasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list with counts', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <GarantiasPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('garantias-page')).toBeInTheDocument()
    })
    expect(screen.getByTestId('garantias-table')).toBeInTheDocument()
    expect(screen.getByText('SN-99')).toBeInTheDocument()
  })
})
