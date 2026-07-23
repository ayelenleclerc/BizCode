import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createListasPreciosAPI } from './listasPrecios'

const LISTA = {
  id: 2,
  tenantId: 1,
  nombre: 'Mayorista',
  moneda: 'ARS',
  activa: true,
  esDefault: false,
  vigenciaHasta: null,
  createdAt: '2026-07-21T00:00:00.000Z',
  updatedAt: '2026-07-21T00:00:00.000Z',
  items: [],
}

const ITEM = {
  id: 11,
  tenantId: 1,
  listaPrecioId: 2,
  articuloId: 5,
  tipoPrecio: 'fijo' as const,
  precio: 80,
  porcentaje: null,
  createdAt: '2026-07-21T00:00:00.000Z',
  updatedAt: '2026-07-21T00:00:00.000Z',
  escalonados: [],
}

describe('createListasPreciosAPI (#234)', () => {
  it('lists, gets, creates, updates and removes price lists', async () => {
    const listBody = {
      success: true,
      data: [LISTA],
      total: 1,
      take: 100,
      skip: 0,
    }
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: listBody })
        .mockResolvedValueOnce({ data: { success: true, data: LISTA } }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: LISTA } }),
      patch: vi.fn().mockResolvedValue({ data: { success: true, data: { ...LISTA, activa: false } } }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
    } as unknown as AxiosInstance
    const api = createListasPreciosAPI(http)

    await expect(api.list({ activa: true })).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/listas-precios', { params: { activa: true } })

    await expect(api.getById(2)).resolves.toEqual(LISTA)
    expect(http.get).toHaveBeenCalledWith('/listas-precios/2')

    await expect(api.create({ nombre: 'Mayorista' })).resolves.toEqual(LISTA)
    expect(http.post).toHaveBeenCalledWith('/listas-precios', { nombre: 'Mayorista' })

    await expect(api.update(2, { activa: false })).resolves.toEqual({ ...LISTA, activa: false })
    expect(http.patch).toHaveBeenCalledWith('/listas-precios/2', { activa: false })

    await expect(api.remove(2)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/listas-precios/2')
  })

  it('upserts and removes items, bulk-updates and resolves effective price', async () => {
    const bulk = {
      success: true,
      preview: true,
      afectados: 1,
      ejemplos: [
        {
          listaPrecioItemId: 11,
          articuloId: 5,
          descripcion: 'A',
          precioActual: 80,
          precioNuevo: 88,
        },
      ],
    }
    const efectivo = {
      success: true,
      articuloId: 5,
      listaPrecioId: 2,
      cantidad: 1,
      precioBase: 100,
      precio: 80,
      origen: 'fijo' as const,
      moneda: 'ARS',
    }
    const http = {
      get: vi.fn().mockResolvedValue({ data: efectivo }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: ITEM } })
        .mockResolvedValueOnce({ data: bulk }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
    } as unknown as AxiosInstance
    const api = createListasPreciosAPI(http)

    const itemBody = {
      articuloId: 5,
      tipoPrecio: 'fijo' as const,
      precio: 80,
      porcentaje: null,
      escalonados: [],
    }
    await expect(api.upsertItem(2, itemBody)).resolves.toEqual(ITEM)
    expect(http.post).toHaveBeenCalledWith('/listas-precios/2/items', itemBody)

    await expect(api.removeItem(2, 11)).resolves.toBeUndefined()
    expect(http.delete).toHaveBeenCalledWith('/listas-precios/2/items/11')

    await expect(api.bulkUpdate(2, { porcentaje: 10, preview: true })).resolves.toEqual(bulk)
    expect(http.post).toHaveBeenCalledWith('/listas-precios/2/actualizar-masivo', {
      porcentaje: 10,
      preview: true,
    })

    await expect(
      api.getPrecioEfectivo({ articuloId: 5, listaPrecioId: 2, cantidad: 1 }),
    ).resolves.toEqual(efectivo)
    expect(http.get).toHaveBeenCalledWith('/listas-precios/precio-efectivo', {
      params: { articuloId: 5, listaPrecioId: 2, cantidad: 1 },
    })
  })
})
