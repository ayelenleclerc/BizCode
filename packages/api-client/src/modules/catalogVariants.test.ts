import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createCatalogVariantsAPI } from './catalogVariants'

describe('createCatalogVariantsAPI', () => {
  it('lists categorias via GET /categorias-articulo', async () => {
    const get = vi.fn().mockResolvedValue({
      data: { success: true, data: [], total: 0, limit: 10, offset: 0 },
    })
    const http = { get, post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as AxiosInstance
    const api = createCatalogVariantsAPI(http)
    await api.listCategorias({ take: 10 })
    expect(get).toHaveBeenCalledWith('/categorias-articulo', expect.objectContaining({ params: expect.any(Object) }))
  })

  it('posts generate variantes', async () => {
    const post = vi.fn().mockResolvedValue({
      data: { success: true, creadas: 2, variantes: [] },
    })
    const http = { get: vi.fn(), post, patch: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as AxiosInstance
    const api = createCatalogVariantsAPI(http)
    await api.generarVariantes(3, { atributoValorIdsPorAtributo: [[1], [2]] })
    expect(post).toHaveBeenCalledWith('/articulos/3/variantes/generar', {
      atributoValorIdsPorAtributo: [[1], [2]],
    })
  })
})
