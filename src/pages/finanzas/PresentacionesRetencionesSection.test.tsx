import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import PresentacionesRetencionesSection from './PresentacionesRetencionesSection'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/lib/api', () => ({
  fiscalPresentacionesAPI: {
    preview: vi.fn().mockResolvedValue({
      formato: 'sicore',
      periodo: '2026-06',
      filas: [
        {
          retencionId: 1,
          fecha: '2026-06-10T00:00:00.000Z',
          cuit: '20123456786',
          denominacion: 'Proveedor Demo',
          regimenNombre: 'Ganancias',
          regimenTipo: 'ganancias',
          operacionTipo: 'retencion',
          provincia: null,
          baseImponible: '10000.00',
          alicuota: '3.5000',
          importe: '350.00',
          incluida: true,
        },
      ],
      totalesPorRegimen: [{ regimenNombre: 'Ganancias', operaciones: 1, totalImporte: '350.00' }],
      warnings: [],
      canGenerate: true,
    }),
    listar: vi.fn().mockResolvedValue([]),
    generar: vi.fn(),
    downloadArchivo: vi.fn(),
    marcarPresentado: vi.fn(),
  },
}))

describe('PresentacionesRetencionesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section and preview table', async () => {
    render(<PresentacionesRetencionesSection />)
    expect(screen.getByTestId('presentaciones-section')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByTestId('presentaciones-preview-table')).toBeInTheDocument()
    })
    expect(screen.getByText('Proveedor Demo')).toBeInTheDocument()
  })

  it('switches to SIFERE tab', async () => {
    const user = userEvent.setup()
    render(<PresentacionesRetencionesSection />)
    await user.click(screen.getByTestId('presentaciones-tab-sifere'))
    expect(screen.getByTestId('presentaciones-tab-sifere')).toHaveAttribute('aria-selected', 'true')
  })
})
