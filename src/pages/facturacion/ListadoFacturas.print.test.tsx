import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@/i18n/config'
import ListadoFacturas from './ListadoFacturas'
import type { Cliente, Factura } from '@/types'
import { facturasAPI, printingAPI } from '@/lib/api'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(() => ({
    status: 'ready',
    modules: [],
    integrations: [],
    hasModule: () => false,
    hasIntegration: () => false,
    refreshFeatures: vi.fn(),
  })),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: {
      role: 'owner',
      tenantId: 1,
      userId: 1,
      permissions: ['reports.operational.read'],
    },
  }),
}))

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    print: vi.fn(),
    downloadPdf: vi.fn(),
    downloadPdfPreview: vi.fn(),
  },
  printingAPI: {
    status: vi.fn(),
    test: vi.fn(),
  },
  afipAPI: { requestCae: vi.fn() },
}))

const clientes: Cliente[] = [
  {
    id: 1,
    codigo: 1,
    rsocial: 'ACME',
    condIva: 'RI',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const factura: Factura = {
  id: 42,
  fecha: '2026-01-15',
  tipo: 'B',
  prefijo: '0001',
  numero: 5,
  clienteId: 1,
  neto1: 100,
  neto2: 0,
  neto3: 0,
  iva1: 21,
  iva2: 0,
  total: 121,
  estado: 'A',
  items: [],
}

describe('ListadoFacturas — device print', () => {
  beforeEach(() => {
    vi.mocked(facturasAPI.print).mockReset()
    vi.mocked(printingAPI.status).mockResolvedValue({
      fiscalPrinterEnabled: false,
      thermalPrinterEnabled: true,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    })
  })

  it('hides fiscal and thermal buttons when devices are disabled', async () => {
    vi.mocked(printingAPI.status).mockResolvedValue({
      fiscalPrinterEnabled: false,
      thermalPrinterEnabled: false,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    })

    render(<ListadoFacturas facturas={[factura]} clientes={clientes} />)
    fireEvent.click(screen.getAllByRole('row')[1])

    await waitFor(() => {
      expect(screen.getByTestId('btn-factura-print-pdf')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('btn-factura-print-thermal')).not.toBeInTheDocument()
    expect(screen.queryByTestId('btn-factura-print-fiscal')).not.toBeInTheDocument()
  })

  it('calls thermal print and shows mock success feedback when enabled', async () => {
    vi.mocked(facturasAPI.print).mockResolvedValue({
      device: 'thermal',
      channel: 'thermal_mock',
      fallbackToPdf: false,
      jobId: 'job-thermal-1',
      transport: 'mock-serial',
    })

    render(<ListadoFacturas facturas={[factura]} clientes={clientes} />)
    fireEvent.click(screen.getAllByRole('row')[1])

    await waitFor(() => {
      expect(screen.getByTestId('btn-factura-print-thermal')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-factura-print-thermal'))

    await waitFor(() => {
      expect(facturasAPI.print).toHaveBeenCalledWith(42, 'thermal')
    })
    expect(screen.getByTestId('factura-print-feedback')).toHaveTextContent('job-thermal-1')
  })

  it('fiscal fallback triggers PDF preview path', async () => {
    vi.mocked(printingAPI.status).mockResolvedValue({
      fiscalPrinterEnabled: true,
      thermalPrinterEnabled: false,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    })
    vi.mocked(facturasAPI.print).mockResolvedValue({
      device: 'fiscal',
      channel: 'pdf',
      fallbackToPdf: true,
      downloadPath: '/api/facturas/42/pdf',
    })
    vi.mocked(facturasAPI.downloadPdfPreview).mockResolvedValue(new Blob(['%PDF'], { type: 'application/pdf' }))

    render(<ListadoFacturas facturas={[factura]} clientes={clientes} />)
    fireEvent.click(screen.getAllByRole('row')[1])

    await waitFor(() => {
      expect(screen.getByTestId('btn-factura-print-fiscal')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('btn-factura-print-fiscal'))

    await waitFor(() => {
      expect(facturasAPI.print).toHaveBeenCalledWith(42, 'fiscal')
      expect(facturasAPI.downloadPdfPreview).toHaveBeenCalledWith(42)
    })
  })
})
