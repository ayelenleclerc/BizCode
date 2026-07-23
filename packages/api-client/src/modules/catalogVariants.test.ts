import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createCatalogVariantsAPI } from './catalogVariants'

const CATEGORIA = {
  id: 1,
  tenantId: 1,
  nombre: 'Indumentaria',
  codigo: 'IND',
  padreId: null,
  precioDefault: null,
  activo: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
  atributos: [],
}

const ATRIBUTO = {
  id: 10,
  tenantId: 1,
  categoriaId: 1,
  nombre: 'Color',
  orden: 0,
  valores: [{ id: 100, atributoId: 10, valor: 'Roja', orden: 0 }],
}

const VALOR = { id: 101, atributoId: 10, valor: 'Azul', orden: 1 }

const VARIANTE = {
  id: 20,
  codigo: 200,
  descripcion: 'Remera - Roja',
  padreId: 5,
  esPadre: false,
  categoriaId: 1,
  heredaPrecio: true,
  precioOverride: null,
  costoOverride: null,
  precioLista1: 100,
  costo: 50,
  stock: 3,
  activo: true,
  atributoValores: [],
}

const OFERTA = {
  id: 7,
  tenantId: 1,
  articuloId: 20,
  precioOferta: 80,
  vigenciaDesde: '2026-07-01T00:00:00.000Z',
  vigenciaHasta: '2026-07-31T00:00:00.000Z',
  activa: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
}

const IMAGEN = {
  id: 3,
  tenantId: 1,
  articuloId: 20,
  pathOriginal: '1/20/a-original.webp',
  pathMedium: '1/20/a-medium.webp',
  pathThumb: '1/20/a-thumb.webp',
  urlOriginal: '/uploads/articulos/1/20/a-original.webp',
  urlMedium: '/uploads/articulos/1/20/a-medium.webp',
  urlThumb: '/uploads/articulos/1/20/a-thumb.webp',
  orden: 0,
  esPrincipal: true,
  createdAt: '2026-07-23T00:00:00.000Z',
}

describe('createCatalogVariantsAPI (#235)', () => {
  it('covers category CRUD and attributes', async () => {
    const listBody = {
      success: true,
      data: [CATEGORIA],
      total: 1,
      take: 100,
      skip: 0,
    }
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: listBody })
        .mockResolvedValueOnce({ data: { success: true, data: CATEGORIA } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: CATEGORIA } })
        .mockResolvedValueOnce({ data: { success: true, data: ATRIBUTO } })
        .mockResolvedValueOnce({ data: { success: true, data: VALOR } }),
      patch: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: { ...CATEGORIA, nombre: 'Ropa' } } })
        .mockResolvedValueOnce({ data: { success: true, data: { ...ATRIBUTO, nombre: 'Talle' } } }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
      put: vi.fn(),
    } as unknown as AxiosInstance
    const api = createCatalogVariantsAPI(http)

    await expect(api.listCategorias({ padreId: null, activo: true })).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/categorias-articulo', {
      params: { padreId: 'null', activo: true },
    })

    await expect(api.getCategoria(1)).resolves.toEqual(CATEGORIA)
    await expect(api.createCategoria({ nombre: 'Indumentaria' })).resolves.toEqual(CATEGORIA)
    await expect(api.updateCategoria(1, { nombre: 'Ropa' })).resolves.toEqual({
      ...CATEGORIA,
      nombre: 'Ropa',
    })
    await expect(api.removeCategoria(1)).resolves.toBeUndefined()

    await expect(api.addAtributo(1, { nombre: 'Color', valores: [{ valor: 'Roja' }] })).resolves.toEqual(
      ATRIBUTO,
    )
    await expect(api.patchAtributo(1, 10, { nombre: 'Talle' })).resolves.toEqual({
      ...ATRIBUTO,
      nombre: 'Talle',
    })
    await expect(api.removeAtributo(1, 10)).resolves.toBeUndefined()
    await expect(api.addValor(1, 10, { valor: 'Azul' })).resolves.toEqual(VALOR)
    await expect(api.removeValor(1, 10, 101)).resolves.toBeUndefined()
  })

  it('covers variantes, precio, ofertas e imagenes', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: [VARIANTE] } })
        .mockResolvedValueOnce({
          data: { success: true, padreId: 5, stockFamilia: 3, variantes: [] },
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            articuloId: 20,
            precio: 100,
            origen: 'precio_lista1',
            ofertaId: null,
          },
        })
        .mockResolvedValueOnce({ data: { success: true, data: [OFERTA] } })
        .mockResolvedValueOnce({ data: { success: true, data: [IMAGEN] } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({
          data: { success: true, creadas: 1, variantes: [VARIANTE] },
        })
        .mockResolvedValueOnce({ data: { success: true, data: OFERTA } })
        .mockResolvedValueOnce({ data: { success: true, data: IMAGEN } }),
      patch: vi.fn().mockResolvedValue({ data: { success: true, data: { ...OFERTA, activa: false } } }),
      put: vi.fn().mockResolvedValue({ data: { success: true, data: [IMAGEN] } }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
    } as unknown as AxiosInstance
    const api = createCatalogVariantsAPI(http)

    await expect(api.listVariantes(5)).resolves.toEqual([VARIANTE])
    await expect(
      api.generarVariantes(5, { atributoValorIdsPorAtributo: [[100], [200]] }),
    ).resolves.toEqual({ success: true, creadas: 1, variantes: [VARIANTE] })
    await expect(api.stockFamilia(5)).resolves.toEqual({
      success: true,
      padreId: 5,
      stockFamilia: 3,
      variantes: [],
    })
    await expect(api.getPrecioCatalogoEfectivo(20)).resolves.toEqual({
      success: true,
      articuloId: 20,
      precio: 100,
      origen: 'precio_lista1',
      ofertaId: null,
    })

    await expect(api.listOfertas(20)).resolves.toEqual([OFERTA])
    await expect(
      api.createOferta(20, {
        precioOferta: 80,
        vigenciaDesde: OFERTA.vigenciaDesde,
        vigenciaHasta: OFERTA.vigenciaHasta,
      }),
    ).resolves.toEqual(OFERTA)
    await expect(api.updateOferta(20, 7, { activa: false })).resolves.toEqual({
      ...OFERTA,
      activa: false,
    })
    await expect(api.removeOferta(20, 7)).resolves.toBeUndefined()

    await expect(api.listImagenes(20)).resolves.toEqual([IMAGEN])
    const blob = new Blob(['x'], { type: 'image/png' })
    await expect(api.uploadImagen(20, blob)).resolves.toEqual(IMAGEN)
    await expect(api.reorderImagenes(20, [3])).resolves.toEqual([IMAGEN])
    await expect(api.removeImagen(20, 3)).resolves.toBeUndefined()
  })

  it('propagates API errors through handleError on key methods', async () => {
    const fail = Object.assign(new Error('fail'), {
      response: { data: { error: 'Server Error' }, status: 500 },
      isAxiosError: true,
    })
    const http = {
      get: vi.fn().mockRejectedValue(fail),
      post: vi.fn().mockRejectedValue(fail),
      patch: vi.fn().mockRejectedValue(fail),
      put: vi.fn().mockRejectedValue(fail),
      delete: vi.fn().mockRejectedValue(fail),
    } as unknown as AxiosInstance
    const api = createCatalogVariantsAPI(http)

    await expect(api.listCategorias()).rejects.toThrow('Server Error')
    await expect(api.getCategoria(1)).rejects.toThrow('Server Error')
    await expect(api.createCategoria({ nombre: 'X' })).rejects.toThrow('Server Error')
    await expect(api.updateCategoria(1, { nombre: 'Y' })).rejects.toThrow('Server Error')
    await expect(api.removeCategoria(1)).rejects.toThrow('Server Error')
    await expect(api.addAtributo(1, { nombre: 'Color' })).rejects.toThrow('Server Error')
    await expect(api.patchAtributo(1, 10, { nombre: 'Talle' })).rejects.toThrow('Server Error')
    await expect(api.removeAtributo(1, 10)).rejects.toThrow('Server Error')
    await expect(api.addValor(1, 10, { valor: 'Azul' })).rejects.toThrow('Server Error')
    await expect(api.removeValor(1, 10, 101)).rejects.toThrow('Server Error')
    await expect(api.listVariantes(5)).rejects.toThrow('Server Error')
    await expect(
      api.generarVariantes(5, { atributoValorIdsPorAtributo: [[100]] }),
    ).rejects.toThrow('Server Error')
    await expect(api.stockFamilia(5)).rejects.toThrow('Server Error')
    await expect(api.getPrecioCatalogoEfectivo(20)).rejects.toThrow('Server Error')
    await expect(api.listOfertas(20)).rejects.toThrow('Server Error')
    await expect(
      api.createOferta(20, {
        precioOferta: 80,
        vigenciaDesde: OFERTA.vigenciaDesde,
        vigenciaHasta: OFERTA.vigenciaHasta,
      }),
    ).rejects.toThrow('Server Error')
    await expect(api.updateOferta(20, 7, { activa: false })).rejects.toThrow('Server Error')
    await expect(api.removeOferta(20, 7)).rejects.toThrow('Server Error')
    await expect(api.listImagenes(20)).rejects.toThrow('Server Error')
    await expect(api.uploadImagen(20, new Blob(['x']))).rejects.toThrow('Server Error')
    await expect(api.reorderImagenes(20, [3])).rejects.toThrow('Server Error')
    await expect(api.removeImagen(20, 3)).rejects.toThrow('Server Error')
  })
})
