import type { AxiosInstance } from 'axios'
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
})
