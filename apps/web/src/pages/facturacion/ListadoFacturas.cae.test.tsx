import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@/i18n/config'
import ListadoFacturas from './ListadoFacturas'
import type { Cliente, Factura } from '@bizcode/types'

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    claims: {
      role: 'owner',
      tenantId: 1,
      userId: 1,
      permissions: ['sales.create', 'sales.cancel', 'reports.operational.read'],
    },
  }),
}))

vi.mock('@/lib/api', () => ({
  facturasAPI: {
    void: vi.fn(),
    downloadPdf: vi.fn(),
    downloadPdfPreview: vi.fn(),
    downloadTicket: vi.fn(),
  },
  printingAPI: {
    status: vi.fn().mockResolvedValue({
      fiscalPrinterEnabled: false,
      thermalPrinterEnabled: false,
      fiscalMode: 'mock',
      thermalMode: 'mock',
    }),
    test: vi.fn(),
  },
  arcaAPI: { requestCae: vi.fn() },
}))

import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'

const now = new Date()

const clientes: Cliente[] = [
  {
    id: 1,
    codigo: 1,
    rsocial: 'ACME',
    condIva: 'RI',
    activo: true,
    createdAt: now,
    updatedAt: now,
  },
]

const baseFactura: Factura = {
  id: 10,
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

describe('ListadoFacturas — CAE UI', () => {
  it('shows pending badge and retry when module enabled', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.arca_cae'],
      integrations: [],
      hasModule: (key) => key === 'billing.arca_cae',
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })

    render(
      <ListadoFacturas
        facturas={[{ ...baseFactura, estadoCae: 'pending' }]}
        clientes={clientes}
      />,
    )

    expect(screen.getByTestId('factura-cae-badge-pending')).toBeInTheDocument()

    fireEvent.click(screen.getAllByRole('row')[1])
    expect(screen.getByTestId('btn-factura-retry-cae')).toBeInTheDocument()
    expect(screen.getByTestId('btn-factura-pdf-preview')).toBeInTheDocument()
    expect(screen.queryByTestId('btn-factura-pdf-download')).not.toBeInTheDocument()
  })

  it('shows download PDF when CAE issued', () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      status: 'ready',
      modules: ['billing.arca_cae'],
      integrations: [],
      hasModule: (key) => key === 'billing.arca_cae',
      hasIntegration: () => false,
      refreshFeatures: vi.fn(),
    })

    render(
      <ListadoFacturas
        facturas={[{ ...baseFactura, estadoCae: 'issued', cae: '70000000000010' }]}
        clientes={clientes}
      />,
    )

    fireEvent.click(screen.getAllByRole('row')[1])
    expect(screen.getByTestId('btn-factura-pdf-download')).toBeInTheDocument()
    expect(screen.queryByTestId('btn-factura-retry-cae')).not.toBeInTheDocument()
  })
})
