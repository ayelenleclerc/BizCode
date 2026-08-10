import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createRutasAPI } from './rutas'

function mockHttp(methods: Partial<AxiosInstance>): AxiosInstance {
  return methods as AxiosInstance
}

describe('createRutasAPI', () => {
  it('lists feriados by year', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: [], total: 0 },
    })
    const api = createRutasAPI(mockHttp({ get }))
    await api.listFeriados({ year: 2026 })
    expect(get).toHaveBeenCalledWith('/feriados', { params: { year: 2026 } })
  })

  it('gets route and patches parada', async () => {
    const get = vi.fn().mockResolvedValue({ data: { success: true, data: null } })
    const patch = vi.fn().mockResolvedValue({
      data: { success: true, data: { id: 1, paradas: [] } },
    })
    const api = createRutasAPI(mockHttp({ get, patch }))
    await api.getRuta({ fecha: '2026-08-10' })
    expect(get).toHaveBeenCalledWith('/rutas', { params: { fecha: '2026-08-10' } })
    await api.patchParada(1, 2, { estado: 'visitado' })
    expect(patch).toHaveBeenCalledWith('/rutas/1/paradas/2', { estado: 'visitado' })
  })
})
