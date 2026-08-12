import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createPlantillasPedidoAPI } from './plantillasPedido'

function mockHttp(methods: Partial<AxiosInstance>): AxiosInstance {
  return methods as AxiosInstance
}

const PREFILL = {
  source: 'last_pedido' as const,
  pedidoId: 9,
  plantillaId: null,
  total: '10.00',
  createdAt: '2026-08-01T12:00:00.000Z',
  lines: [],
  omitted: [],
  omittedCount: 0,
}

describe('createPlantillasPedidoAPI', () => {
  it('gets last-order prefill and lists plantillas', async () => {
    const get = vi.fn().mockResolvedValue({ data: { success: true, data: PREFILL } })
    const api = createPlantillasPedidoAPI(mockHttp({ get }))
    await api.getUltimoPedidoRepeat(2)
    expect(get).toHaveBeenCalledWith('/clientes/2/ultimo-pedido-repeat')
    get.mockResolvedValueOnce({ data: { success: true, data: [] } })
    await api.list(2)
    expect(get).toHaveBeenCalledWith('/clientes/2/plantillas-pedido')
  })

  it('creates, loads, patches and deletes a plantilla', async () => {
    const post = vi.fn().mockResolvedValue({
      data: { success: true, data: { id: 1, nombre: 'Habitual', items: [] } },
    })
    const get = vi.fn().mockResolvedValue({ data: { success: true, data: PREFILL } })
    const patch = vi.fn().mockResolvedValue({
      data: { success: true, data: { id: 1, nombre: 'Fin de mes', items: [] } },
    })
    const del = vi.fn().mockResolvedValue({ data: { success: true, data: { id: 1 } } })
    const api = createPlantillasPedidoAPI(mockHttp({ post, get, patch, delete: del }))
    await api.create(2, { nombre: 'Habitual', items: [{ articuloId: 10, cantidad: 2 }] })
    expect(post).toHaveBeenCalledWith('/clientes/2/plantillas-pedido', {
      nombre: 'Habitual',
      items: [{ articuloId: 10, cantidad: 2 }],
    })
    await api.cargar(1)
    expect(get).toHaveBeenCalledWith('/plantillas-pedido/1/cargar')
    await api.patch(1, { nombre: 'Fin de mes' })
    expect(patch).toHaveBeenCalledWith('/plantillas-pedido/1', { nombre: 'Fin de mes' })
    await api.remove(1)
    expect(del).toHaveBeenCalledWith('/plantillas-pedido/1')
  })
})
