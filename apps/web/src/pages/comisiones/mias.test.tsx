import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { comisionesAPI } from '@/lib/api'
import ComisionesMiasPage from './mias'

vi.mock('@/lib/api', () => ({
  comisionesAPI: {
    misComisiones: vi.fn(),
  },
}))

describe('ComisionesMiasPage (#237)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(comisionesAPI.misComisiones).mockResolvedValue({
      success: true,
      periodo: '2026-07',
      estimacion: {
        totalVentas: 500,
        totalComision: 15,
        lineas: [
          {
            facturaId: 10,
            montoBase: 500,
            alicuota: 3,
            comision: 15,
            concepto: 'Cobro RC#1 / Factura #10',
          },
        ],
      },
      liquidaciones: [
        {
          id: 9,
          tenantId: 1,
          vendedorId: 3,
          periodo: '2026-06',
          totalVentas: 200,
          totalComision: 6,
          estado: 'pagada',
          aprobadoPorId: 1,
          pagadoEn: '2026-07-01T00:00:00.000Z',
          createdAt: '2026-06-30T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      ],
    })
  })

  it('renders own estimation and history', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ComisionesMiasPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('comisiones-estimacion')).toBeInTheDocument()
    })
    expect(screen.getByTestId('comisiones-est-total')).toHaveTextContent('15')
    expect(screen.getByTestId('comisiones-historial')).toBeInTheDocument()
    expect(comisionesAPI.misComisiones).toHaveBeenCalled()
  })
})
