import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import FinanzasPage from './index'
import { cobranzasAPI, contabilidadAPI, notasCreditoAPI, reportesAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext'
import type { AuthClaims, Permission } from '@/lib/rbac'

const baseClaims: AuthClaims = {
  userId: 1,
  tenantId: 1,
  username: 'fin-user',
  role: 'finance',
  permissions: ['reports.financial.read'] as Permission[],
  scope: {
    tenantId: 1,
    branchIds: [],
    warehouseIds: [],
    routeIds: [],
    channels: ['backoffice'],
  },
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/contexts/FeatureFlagsContext', () => ({
  useFeatureFlags: vi.fn(),
}))

vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    reportesAPI: {
      aging: vi.fn(),
      cuentaCorriente: vi.fn(),
      ventas: vi.fn(),
      stockCritico: vi.fn(),
      cobranzas: vi.fn(),
    },
    cobranzasAPI: {
      listVencidas: vi.fn(),
      sendRecordatorio: vi.fn(),
    },
    notasCreditoAPI: {
      list: vi.fn(),
    },
    contabilidadAPI: {
      libroIvaVentasPreview: vi.fn(),
      downloadLibroIvaVentas: vi.fn(),
      libroIvaComprasPreview: vi.fn(),
      downloadLibroIvaCompras: vi.fn(),
    },
  }
})

function mockAuth(permissions: Permission[]) {
  vi.mocked(useAuth).mockReturnValue({
    status: 'authenticated',
    claims: { ...baseClaims, permissions },
    login: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
  })
}

function mockFlagsWithCreditNotes() {
  vi.mocked(useFeatureFlags).mockReturnValue({
    status: 'ready',
    modules: ['billing.credit_notes', 'finance.ledger'],
    integrations: [],
    hasModule: (k) => k === 'billing.credit_notes' || k === 'finance.ledger',
    hasIntegration: () => false,
    refreshFeatures: vi.fn(),
  })
}

describe('FinanzasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
    mockFlagsWithCreditNotes()
    vi.mocked(notasCreditoAPI.list).mockResolvedValue({ data: [], total: 0, limit: 100, offset: 0 })
    vi.mocked(contabilidadAPI.libroIvaVentasPreview).mockResolvedValue({
      periodo: '2026-05',
      recordCountCbtv: 1,
      recordCountAlicuotas: 1,
      totalsByAlicuota: [{ alicuotaCode: '0005', neto: 100, iva: 21 }],
      totalNeto: 100,
      totalIva: 21,
      totalExento: 0,
      totalGeneral: 121,
      arcaValidationPending: true,
    })
    vi.mocked(contabilidadAPI.libroIvaComprasPreview).mockResolvedValue({
      periodo: '2026-05',
      recordCountCbtu: 0,
      recordCountAlicuotas: 0,
      totalsByAlicuota: [],
      totalNeto: 0,
      totalIva: 0,
      totalExento: 0,
      totalGeneral: 0,
      arcaValidationPending: true,
    })
    vi.mocked(reportesAPI.aging).mockResolvedValue({
      buckets: [
        { label: '0-30d', count: 2, total: '1000' },
        { label: '31-60d', count: 1, total: '500' },
      ],
      totalDeuda: '1500',
      resumen: {
        deudaVencida: '500',
        deudaPorVencer: '1000',
        porcentajeMora: '10',
        clientesSuspendidos: 0,
      },
    })
    vi.mocked(cobranzasAPI.listVencidas).mockResolvedValue([
      {
        facturaId: 9,
        clienteId: 3,
        rsocial: 'ACME',
        fecha: '2025-01-01',
        total: '200',
        diasMora: 10,
      },
    ])
    vi.mocked(reportesAPI.cuentaCorriente).mockResolvedValue({
      clienteId: 3,
      codigo: 10,
      rsocial: 'ACME',
      balanceActual: '200',
      lineas: [],
    })
  })

  it('muestra acceso denegado sin permiso', async () => {
    mockAuth([])
    render(<FinanzasPage />)
    expect(await screen.findByTestId('finanzas-forbidden')).toBeInTheDocument()
  })

  it('carga aging y facturas vencidas', async () => {
    render(<FinanzasPage />)
    expect(await screen.findByTestId('finanzas-page')).toBeInTheDocument()
    await waitFor(() => {
      expect(reportesAPI.aging).toHaveBeenCalled()
      expect(cobranzasAPI.listVencidas).toHaveBeenCalled()
    })
    expect(screen.getByTestId('finanzas-aging-table')).toBeInTheDocument()
  })

  it('lista notas de crédito cuando el módulo está habilitado', async () => {
    vi.mocked(notasCreditoAPI.list).mockResolvedValue({
      data: [
        {
          id: 9,
          tenantId: 1,
          facturaOrigenId: 10,
          motivo: 'xxxxxxxxxx',
          monto: '100',
          cae: null,
          caeVto: null,
          estadoCae: 'pending',
          createdById: 1,
          createdAt: '2026-05-01T10:00:00.000Z',
          facturaOrigen: {
            id: 10,
            tipo: 'B',
            prefijo: '0001',
            numero: 2,
            clienteId: 3,
            fecha: '2026-04-20T00:00:00.000Z',
            total: '100',
            estado: 'N',
          },
        },
      ],
      total: 1,
      limit: 100,
      offset: 0,
    })
    render(<FinanzasPage />)
    await screen.findByTestId('finanzas-page')
    await waitFor(() => {
      expect(notasCreditoAPI.list).toHaveBeenCalled()
    })
    expect(await screen.findByTestId('finanzas-nc-row-9')).toBeInTheDocument()
  })

  it('muestra preview del Libro IVA Ventas con finance.ledger', async () => {
    render(<FinanzasPage />)
    await screen.findByTestId('finanzas-page')
    await waitFor(() => {
      expect(contabilidadAPI.libroIvaVentasPreview).toHaveBeenCalled()
    })
    expect(await screen.findByTestId('finanzas-libro-iva-preview')).toBeInTheDocument()
  })

  it('muestra preview del Libro IVA Compras con finance.ledger', async () => {
    render(<FinanzasPage />)
    await screen.findByTestId('finanzas-page')
    await waitFor(() => {
      expect(contabilidadAPI.libroIvaComprasPreview).toHaveBeenCalled()
    })
    expect(await screen.findByTestId('finanzas-libro-iva-compras-preview')).toBeInTheDocument()
  })

  it('abre cuenta corriente con cliente válido', async () => {
    const user = userEvent.setup()
    render(<FinanzasPage />)
    await screen.findByTestId('finanzas-page')
    const input = document.getElementById('finanzas-cliente-id')
    expect(input).toBeTruthy()
    await user.type(input!, '3')
    await user.click(screen.getByTestId('finanzas-view-statement-btn'))
    await waitFor(() => {
      expect(reportesAPI.cuentaCorriente).toHaveBeenCalledWith(3)
    })
  })
})
