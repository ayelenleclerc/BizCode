import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createComisionesAPI } from './comisiones'

describe('createComisionesAPI (#237)', () => {
  it('covers settings, configs and liquidaciones lifecycle', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: { modoDevengo: 'porcentaje_cobrado' } } })
        .mockResolvedValueOnce({
          data: { success: true, data: [], total: 0, take: 100, skip: 0 },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: [], total: 0, take: 100, skip: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: [] } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            periodo: '2026-07',
            estimacion: { totalVentas: 0, totalComision: 0, lineas: [] },
            liquidaciones: [],
          },
        }),
      post: vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              id: 1,
              tenantId: 1,
              vendedorId: 3,
              tipo: 'porcentaje_cobrado',
              alicuota: 3,
              vigenciaDesde: '2026-07-01T00:00:00.000Z',
              vigenciaHasta: null,
              articuloCategoriaId: null,
              clienteId: null,
              createdAt: '2026-07-01T00:00:00.000Z',
              updatedAt: '2026-07-01T00:00:00.000Z',
            },
          },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { created: [], skipped: 0 } },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: {
              id: 9,
              tenantId: 1,
              vendedorId: 3,
              periodo: '2026-07',
              totalVentas: 0,
              totalComision: 0,
              estado: 'aprobada',
              aprobadoPorId: 1,
              pagadoEn: null,
              createdAt: '2026-07-01T00:00:00.000Z',
              updatedAt: '2026-07-01T00:00:00.000Z',
            },
          },
        }),
      patch: vi.fn().mockResolvedValue({
        data: { success: true, data: { modoDevengo: 'porcentaje_facturado' } },
      }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
    } as unknown as AxiosInstance
    const api = createComisionesAPI(http)

    await expect(api.getSettings()).resolves.toEqual({ modoDevengo: 'porcentaje_cobrado' })
    await expect(api.updateSettings({ modoDevengo: 'porcentaje_facturado' })).resolves.toEqual({
      modoDevengo: 'porcentaje_facturado',
    })
    await expect(api.listConfigs()).resolves.toMatchObject({ data: [] })
    await expect(
      api.createConfig({
        vendedorId: 3,
        tipo: 'porcentaje_cobrado',
        alicuota: 3,
        vigenciaDesde: '2026-07-01T00:00:00.000Z',
      }),
    ).resolves.toMatchObject({ id: 1 })
    await expect(api.removeConfig(1)).resolves.toBeUndefined()
    await expect(api.listLiquidaciones({ periodo: '2026-07' })).resolves.toMatchObject({ data: [] })
    await expect(api.generarLiquidaciones({ periodo: '2026-07' })).resolves.toMatchObject({
      skipped: 0,
    })
    await expect(api.aprobarLiquidacion(9)).resolves.toMatchObject({ estado: 'aprobada' })
    await expect(api.ranking('2026-07')).resolves.toEqual([])
    await expect(api.misComisiones('2026-07')).resolves.toMatchObject({ periodo: '2026-07' })
  })
})
