import type { AxiosError, AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createTiposCambioAPI } from './tiposCambio'

describe('createTiposCambioAPI (#243)', () => {
  const row = {
    id: 1,
    tenantId: 1,
    moneda: 'USD' as const,
    tipo: 'oficial' as const,
    valor: 1250,
    fecha: '2026-07-24T00:00:00.000Z',
    fuente: 'bcra_api' as const,
    createdById: null,
    createdAt: '2026-07-24T00:00:00.000Z',
  }

  it('covers list, preference, manual rate and BCRA sync helpers', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: { success: true, data: [row], total: 1, limit: 50, offset: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: row } })
        .mockResolvedValueOnce({
          data: { success: true, data: { tipoCambioPreferido: 'oficial' } },
        }),
      put: vi.fn().mockResolvedValue({
        data: { success: true, data: { tipoCambioPreferido: 'mep' } },
      }),
      post: vi.fn().mockResolvedValue({
        data: {
          success: true,
          data: row,
          recalc: { updatedCount: 2, moneda: 'USD', tipo: 'oficial', valor: 1250 },
        },
      }),
    } as unknown as AxiosInstance
    const api = createTiposCambioAPI(http)

    await expect(api.list({ limit: 50, offset: 0 })).resolves.toMatchObject({
      data: [row],
      take: 50,
      skip: 0,
    })
    await expect(api.getVigente({ moneda: 'USD' })).resolves.toMatchObject({ id: 1 })
    await expect(api.getPreferido()).resolves.toEqual({ tipoCambioPreferido: 'oficial' })
    await expect(api.setPreferido('mep')).resolves.toEqual({ tipoCambioPreferido: 'mep' })
    await expect(
      api.createManual({ moneda: 'USD', tipo: 'manual', valor: 1250 }),
    ).resolves.toMatchObject({ row: { id: 1 } })
    await expect(api.syncBcra()).resolves.toMatchObject({ recalc: { updatedCount: 2 } })
  })

  it('propagates Axios errors through handleError for every method', async () => {
    const boom = {
      isAxiosError: true,
      response: { status: 502, data: { success: false, error: 'BCRA down' } },
      message: 'Request failed',
    } as AxiosError
    const http = {
      get: vi.fn().mockRejectedValue(boom),
      put: vi.fn().mockRejectedValue(boom),
      post: vi.fn().mockRejectedValue(boom),
    } as unknown as AxiosInstance
    const api = createTiposCambioAPI(http)

    await expect(api.list()).rejects.toBeTruthy()
    await expect(api.getVigente({ moneda: 'EUR' })).rejects.toBeTruthy()
    await expect(api.getPreferido()).rejects.toBeTruthy()
    await expect(api.setPreferido('blue')).rejects.toBeTruthy()
    await expect(api.createManual({ moneda: 'EUR', tipo: 'ccl', valor: 1 })).rejects.toBeTruthy()
    await expect(api.syncBcra('USD')).rejects.toBeTruthy()
  })
})
