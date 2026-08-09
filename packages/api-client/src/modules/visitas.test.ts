import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createVisitasAPI } from './visitas'

function mockHttp(impl: Partial<AxiosInstance>): AxiosInstance {
  return impl as unknown as AxiosInstance
}

describe('createVisitasAPI', () => {
  it('lists visitas with fecha and vendedorId', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: [{ id: 1 }],
        total: 1,
        kpi: { planificadas: 1, visitados: 0, pedidos: 0, conversionPct: 0 },
      },
    })
    const api = createVisitasAPI(mockHttp({ get }))
    const res = await api.list({ fecha: '2026-08-09', vendedorId: 3 })
    expect(res.data).toHaveLength(1)
    expect(get).toHaveBeenCalledWith('/visitas', {
      params: { fecha: '2026-08-09', vendedorId: 3 },
    })
  })

  it('creates and updates visita', async () => {
    const post = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 9 } } })
    const put = vi.fn().mockResolvedValue({
      data: { success: true, data: { id: 9, resultado: 'venta' } },
    })
    const api = createVisitasAPI(mockHttp({ post, put }))
    await expect(
      api.create({ vendedorId: 1, clienteId: 2, fechaPlanificada: '2026-08-09' }),
    ).resolves.toEqual({ id: 9 })
    await expect(api.update(9, { resultado: 'venta', pedidoId: 5 })).resolves.toEqual({
      id: 9,
      resultado: 'venta',
    })
  })
})
