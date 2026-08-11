import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createSellerAlertsAPI } from './sellerAlerts'

function mockHttp(methods: Partial<AxiosInstance>): AxiosInstance {
  return methods as AxiosInstance
}

describe('createSellerAlertsAPI', () => {
  it('gets estado-credito by cliente id', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          deudaTotal: '100.00',
          deudaVencida: '0.00',
          limiteCredito: '500.00',
          disponible: '400.00',
          diasMoraMax: 0,
          nivel: 'amarillo',
          facturasPendientes: [],
          asOf: '2026-08-11T12:00:00.000Z',
        },
      },
    })
    const api = createSellerAlertsAPI(mockHttp({ get }))
    await api.getEstadoCredito(9)
    expect(get).toHaveBeenCalledWith('/clientes/9/estado-credito')
  })

  it('gets stock-multiple and seller policies', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: { asOf: '2026-08-11T12:00:00.000Z', items: [] } },
    })
    const patch = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          sellerCreditOverLimitAction: 'block',
          sellerCreditOverdueAction: 'warn',
          sellerStockZeroAction: 'warn',
          sellerStockCapQtyToAvailable: true,
        },
      },
    })
    const api = createSellerAlertsAPI(mockHttp({ get, patch }))
    await api.getStockMultiple([1, 2])
    expect(get).toHaveBeenCalledWith('/articulos/stock-multiple', { params: { ids: '1,2' } })
    await api.getSellerPolicies()
    expect(get).toHaveBeenCalledWith('/tenant-config/seller-policies')
    await api.patchSellerPolicies({ sellerStockZeroAction: 'block' })
    expect(patch).toHaveBeenCalledWith('/tenant-config/seller-policies', {
      sellerStockZeroAction: 'block',
    })
  })
})
