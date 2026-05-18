import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@/i18n/config'
import FinanzasPage from './index'
import { cobranzasAPI, reportesAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
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

describe('FinanzasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('lang', 'es')
    mockAuth(baseClaims.permissions)
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
