import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n/config'
import { comisionesAPI } from '@/lib/api'
import ComisionesLiquidacionesPage from './liquidaciones'

vi.mock('@/lib/api', () => ({
  comisionesAPI: {
    listLiquidaciones: vi.fn(),
    ranking: vi.fn(),
    generarLiquidaciones: vi.fn(),
    aprobarLiquidacion: vi.fn(),
    pagarLiquidacion: vi.fn(),
  },
}))

vi.mock('@/components/CanAccess', () => ({
  CanAccess: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const LIQ_BORRADOR = {
  id: 1,
  tenantId: 1,
  vendedorId: 3,
  periodo: '2026-07',
  totalVentas: 1000,
  totalComision: 30,
  estado: 'borrador' as const,
  aprobadoPorId: null,
  pagadoEn: null,
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
  vendedorUsername: 'seller1',
}

const LIQ_APROBADA = {
  ...LIQ_BORRADOR,
  id: 2,
  estado: 'aprobada' as const,
  aprobadoPorId: 1,
}

describe('ComisionesLiquidacionesPage (#237)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(comisionesAPI.listLiquidaciones).mockResolvedValue({
      success: true,
      data: [LIQ_BORRADOR, LIQ_APROBADA],
      total: 2,
      take: 100,
      skip: 0,
    })
    vi.mocked(comisionesAPI.ranking).mockResolvedValue([
      {
        vendedorId: 3,
        vendedorUsername: 'seller1',
        totalVentas: 1000,
        totalComision: 30,
        liquidacionId: 1,
        estado: 'borrador',
      },
    ])
    vi.mocked(comisionesAPI.generarLiquidaciones).mockResolvedValue({ created: [], skipped: 0 })
    vi.mocked(comisionesAPI.aprobarLiquidacion).mockResolvedValue({
      ...LIQ_BORRADOR,
      estado: 'aprobada',
      aprobadoPorId: 1,
    })
    vi.mocked(comisionesAPI.pagarLiquidacion).mockResolvedValue({
      ...LIQ_APROBADA,
      estado: 'pagada',
      pagadoEn: '2026-07-23T00:00:00.000Z',
    })
  })

  it('renders ranking and settlements table', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ComisionesLiquidacionesPage />
      </I18nextProvider>,
    )
    await waitFor(() => {
      expect(screen.getByTestId('comisiones-liq-table')).toBeInTheDocument()
    })
    expect(screen.getByTestId('comisiones-rank-3')).toBeInTheDocument()
    expect(screen.getByTestId('comisiones-liq-row-1')).toBeInTheDocument()
  })

  it('generates and approves a settlement', async () => {
    const user = userEvent.setup()
    render(
      <I18nextProvider i18n={i18n}>
        <ComisionesLiquidacionesPage />
      </I18nextProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('comisiones-generar')).toBeInTheDocument())
    await user.click(screen.getByTestId('comisiones-generar'))
    await waitFor(() => {
      expect(comisionesAPI.generarLiquidaciones).toHaveBeenCalled()
    })
    await user.click(screen.getByTestId('comisiones-aprobar-1'))
    await waitFor(() => {
      expect(comisionesAPI.aprobarLiquidacion).toHaveBeenCalledWith(1)
    })
    await user.click(screen.getByTestId('comisiones-pagar-2'))
    await waitFor(() => {
      expect(comisionesAPI.pagarLiquidacion).toHaveBeenCalledWith(2)
    })
  })
})
