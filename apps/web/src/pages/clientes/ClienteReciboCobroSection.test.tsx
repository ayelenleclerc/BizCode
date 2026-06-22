import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { clientesAPI, fiscalRetencionesAPI } from '@/lib/api'
import ClienteReciboCobroSection from './ClienteReciboCobroSection'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { permissions: ['reports.financial.read', 'sales.create'] },
  }),
}))

vi.mock('@/lib/api', () => ({
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
  clientesAPI: {
    listRecibos: vi.fn(),
    facturasPendientes: vi.fn(),
    createRecibo: vi.fn(),
    downloadReciboPdf: vi.fn(),
    anularRecibo: vi.fn(),
  },
  chequesAPI: { list: vi.fn().mockResolvedValue({ data: [] }) },
  fiscalRetencionesAPI: {
    getConfig: vi.fn(),
    previewRetenciones: vi.fn(),
  },
}))

describe('ClienteReciboCobroSection (#233)', () => {
  beforeEach(() => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      hasModule: () => false,
      modules: [],
      loading: false,
    } as never)
    vi.mocked(clientesAPI.listRecibos).mockResolvedValue({
      data: [],
      total: 0,
      limit: 50,
      offset: 0,
    })
    vi.mocked(clientesAPI.facturasPendientes).mockResolvedValue([
      {
        facturaId: 10,
        facturaRef: 'B-0001-50',
        fecha: '2026-05-01T00:00:00.000Z',
        total: '242.00',
        pagado: '0.00',
        pendiente: '242.00',
      },
    ])
    vi.mocked(clientesAPI.createRecibo).mockResolvedValue({
      id: 1,
      numero: 1,
      totalCobrado: '100.00',
      totalBruto: '100.00',
      estado: 'emitido',
    } as never)
  })

  it('shows empty state when no receipts', async () => {
    render(<ClienteReciboCobroSection clienteId={1} />)
    await waitFor(() => {
      expect(screen.getByTestId('cliente-recibos-empty')).toBeInTheDocument()
    })
  })

  it('opens form and submits FIFO receipt', async () => {
    const user = userEvent.setup()
    const onRegistered = vi.fn()
    render(<ClienteReciboCobroSection clienteId={1} onReciboRegistered={onRegistered} />)

    await user.click(screen.getByTestId('cliente-recibos-open'))
    expect(screen.getByTestId('cliente-recibos-form')).toBeInTheDocument()

    await user.type(screen.getByTestId('cliente-recibo-importe'), '100')
    await user.click(screen.getByTestId('cliente-recibo-submit'))

    await waitFor(() => {
      expect(clientesAPI.createRecibo).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          totalCobrado: 100,
          fifo: true,
        }),
      )
      expect(onRegistered).toHaveBeenCalled()
    })
  })

  it('loads retenciones preview when module enabled', async () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      hasModule: (key: string) => key === 'finance.retenciones',
      modules: ['finance.retenciones'],
      loading: false,
    } as never)
    vi.mocked(fiscalRetencionesAPI.getConfig).mockResolvedValue({
      esAgenteRetencionGanancias: true,
      esAgenteRetencionIVA: false,
      esAgenteRetencionIIBB: false,
    })
    vi.mocked(fiscalRetencionesAPI.previewRetenciones).mockResolvedValue([
      {
        regimenId: 1,
        nombre: 'Ganancias',
        tipo: 'ganancias',
        alicuota: '4.5',
        baseImponible: '100.00',
        importe: '4.50',
      },
    ])

    const user = userEvent.setup()
    render(<ClienteReciboCobroSection clienteId={1} />)
    await user.click(screen.getByTestId('cliente-recibos-open'))
    await user.type(screen.getByTestId('cliente-recibo-importe'), '100')
    await user.click(screen.getByTestId('cliente-recibo-retenciones'))

    await waitFor(() => {
      expect(fiscalRetencionesAPI.previewRetenciones).toHaveBeenCalled()
      expect(screen.getByTestId('cliente-recibo-retenciones-list')).toBeInTheDocument()
    })
  })
})
