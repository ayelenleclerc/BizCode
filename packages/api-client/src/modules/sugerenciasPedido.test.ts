import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createSugerenciasPedidoAPI } from './sugerenciasPedido'

function mockHttp(methods: Partial<AxiosInstance>): AxiosInstance {
  return methods as AxiosInstance
}

describe('createSugerenciasPedidoAPI', () => {
  it('gets suggestions for a customer', async () => {
    const get = vi.fn().mockResolvedValue({
      data: {
        success: true,
        data: { source: 'historial', habituales: [], ofertas: [] },
      },
    })
    const api = createSugerenciasPedidoAPI(mockHttp({ get }))
    await api.get(2, { limit: 10, offset: 0 })
    expect(get).toHaveBeenCalledWith('/clientes/2/sugerencias-pedido', {
      params: { limit: 10, offset: 0 },
    })
  })
})
