import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import { fiscalRetencionesAPI, proveedoresAPI } from '@/lib/api'
import ProveedorReciboPagoSection from './ProveedorReciboPagoSection'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: { permissions: ['suppliers.read', 'suppliers.manage'] },
  }),
}))

vi.mock('@/lib/api', () => ({
  ApiRequestFailedError: class ApiRequestFailedError extends Error {},
  proveedoresAPI: {
    listPagos: vi.fn(),
    pagosComprobantesPendientes: vi.fn(),
    createPago: vi.fn(),
    downloadPagoPdf: vi.fn(),
    anularPago: vi.fn(),
  },
  fiscalRetencionesAPI: {
    getConfig: vi.fn(),
    previewRetenciones: vi.fn(),
    downloadConstanciaPdf: vi.fn(),
  },
}))

describe('ProveedorReciboPagoSection retenciones (#276)', () => {
  beforeEach(() => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      hasModule: (key: string) => key === 'finance.retenciones',
      modules: ['finance.retenciones'],
      loading: false,
    } as never)
    vi.mocked(proveedoresAPI.listPagos).mockResolvedValue({ data: [], total: 0, limit: 50, offset: 0 })
    vi.mocked(proveedoresAPI.pagosComprobantesPendientes).mockResolvedValue([
      {
        comprobanteCompraId: 10,
        facturaRef: 'B-0001-50',
        fecha: '2026-05-01T00:00:00.000Z',
        total: '242.00',
        pagado: '0.00',
        pendiente: '242.00',
      },
    ])
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
        baseImponible: '242.00',
        importe: '10.89',
      },
    ])
    vi.mocked(proveedoresAPI.createPago).mockResolvedValue({
      id: 1,
      numero: 1,
      total: '231.11',
      totalBruto: '242.00',
      retenciones: [],
    })
  })

  it('loads preview when apply retenciones is checked', async () => {
    const user = userEvent.setup()
    render(<ProveedorReciboPagoSection proveedorId={1} />)

    await user.click(screen.getByTestId('proveedor-pago-open'))
    await user.click(screen.getByTestId('proveedor-pago-select-10'))
    await user.click(screen.getByTestId('proveedor-pago-apply-retenciones'))

    await waitFor(() => {
      expect(fiscalRetencionesAPI.previewRetenciones).toHaveBeenCalledWith({
        entidadTipo: 'proveedor',
        entidadId: 1,
        monto: 242,
      })
    })
    expect(screen.getByTestId('proveedor-pago-retenciones-table')).toBeInTheDocument()
  })
})
