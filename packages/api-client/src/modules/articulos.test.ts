import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createArticulosAPI } from './articulos'
import { createRubrosAPI } from './rubros'

function mockHttp(getImpl: AxiosInstance['get']): AxiosInstance {
  return { get: getImpl } as unknown as AxiosInstance
}

describe('createArticulosAPI', () => {
  it('lists artículos with optional q filter', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: [{ id: 1, descripcion: 'Cafe', precioLista1: 10, stock: 5 }] },
    })
    const api = createArticulosAPI(mockHttp(get))
    const rows = await api.list('cafe', { limit: 50 })
    expect(rows).toHaveLength(1)
    expect(get).toHaveBeenCalledWith('/articulos', { params: { q: 'cafe', limit: 50 } })
  })

  it('gets artículo by id', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: { id: 5, descripcion: 'Te' } },
    })
    const api = createArticulosAPI(mockHttp(get))
    await expect(api.get(5)).resolves.toEqual({ id: 5, descripcion: 'Te' })
    expect(get).toHaveBeenCalledWith('/articulos/5')
  })
})

describe('createRubrosAPI', () => {
  it('lists rubros', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: [{ id: 1, codigo: 10, nombre: 'Bebidas' }] },
    })
    const api = createRubrosAPI(mockHttp(get))
    const rows = await api.list({ limit: 100 })
    expect(rows[0]?.nombre).toBe('Bebidas')
    expect(get).toHaveBeenCalledWith('/rubros', { params: { limit: 100 } })
  })
})
