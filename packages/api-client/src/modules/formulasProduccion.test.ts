import type { AxiosError, AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createFormulasProduccionAPI } from './formulasProduccion'

describe('createFormulasProduccionAPI (#248)', () => {
  const row = {
    id: 10,
    tenantId: 1,
    articuloId: 100,
    rendimiento: 1,
    unidadRendimiento: 'unidad',
    version: 1,
    activa: true,
    observaciones: null,
    createdAt: '2026-07-24T12:00:00.000Z',
    updatedAt: '2026-07-24T12:00:00.000Z',
    articulo: null,
    insumos: [],
  }

  const costo = {
    formulaId: 10,
    articuloId: 100,
    rendimiento: 1,
    costoInsumos: 20,
    costoUnitario: 20,
    precioVenta: 120,
    margenAbsoluto: 100,
    margenPorcentaje: 83.33,
    lineas: [],
  }

  const proyeccion = {
    formulaId: 10,
    articuloId: 100,
    unidadesObjetivo: 5,
    corridas: 5,
    lineas: [],
  }

  it('covers list, getById, create, update, deactivate, costo and proyeccion helpers', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: { success: true, data: [row], total: 1, limit: 50, offset: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: row } })
        .mockResolvedValueOnce({ data: { success: true, data: costo } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: row } })
        .mockResolvedValueOnce({ data: { success: true, data: { ...row, activa: false } } })
        .mockResolvedValueOnce({ data: { success: true, data: proyeccion } }),
      put: vi.fn().mockResolvedValue({
        data: { success: true, data: { ...row, version: 2 } },
      }),
    } as unknown as AxiosInstance
    const api = createFormulasProduccionAPI(http)

    await expect(api.list({ limit: 50, offset: 0 })).resolves.toMatchObject({
      data: [row],
      take: 50,
      skip: 0,
    })
    await expect(api.getById(10)).resolves.toMatchObject({ id: 10 })
    await expect(
      api.create({
        articuloId: 100,
        rendimiento: 1,
        insumos: [{ articuloId: 200, cantidad: 2, unidad: 'kg' }],
      }),
    ).resolves.toMatchObject({ id: 10 })
    await expect(
      api.update(10, {
        rendimiento: 1,
        insumos: [{ articuloId: 200, cantidad: 2, unidad: 'kg' }],
      }),
    ).resolves.toMatchObject({ version: 2 })
    await expect(api.deactivate(10)).resolves.toMatchObject({ activa: false })
    await expect(api.getCosto(10)).resolves.toMatchObject({ costoUnitario: 20 })
    await expect(api.proyectar(10, 5)).resolves.toMatchObject({ corridas: 5 })
  })

  it('propagates Axios errors through handleError for every method', async () => {
    const boom = {
      isAxiosError: true,
      response: { status: 502, data: { success: false, error: 'down' } },
      message: 'Request failed',
    } as AxiosError
    const http = {
      get: vi.fn().mockRejectedValue(boom),
      put: vi.fn().mockRejectedValue(boom),
      post: vi.fn().mockRejectedValue(boom),
    } as unknown as AxiosInstance
    const api = createFormulasProduccionAPI(http)

    await expect(api.list()).rejects.toBeTruthy()
    await expect(api.getById(1)).rejects.toBeTruthy()
    await expect(
      api.create({ articuloId: 1, rendimiento: 1, insumos: [{ articuloId: 2, cantidad: 1, unidad: 'unidad' }] }),
    ).rejects.toBeTruthy()
    await expect(
      api.update(1, { rendimiento: 1, insumos: [{ articuloId: 2, cantidad: 1, unidad: 'unidad' }] }),
    ).rejects.toBeTruthy()
    await expect(api.deactivate(1)).rejects.toBeTruthy()
    await expect(api.getCosto(1)).rejects.toBeTruthy()
    await expect(api.proyectar(1, 2)).rejects.toBeTruthy()
  })
})
