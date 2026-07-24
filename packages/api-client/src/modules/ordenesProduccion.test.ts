import type { AxiosError, AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createOrdenesProduccionAPI } from './ordenesProduccion'

describe('createOrdenesProduccionAPI (#249)', () => {
  const row = {
    id: 5,
    tenantId: 1,
    numero: 1,
    articuloId: 100,
    formulaId: 10,
    depositoId: 3,
    cantidadPlanif: 500,
    cantidadReal: null,
    estado: 'planificada' as const,
    fechaPlanif: '2026-07-24T12:00:00.000Z',
    fechaInicio: null,
    fechaFin: null,
    costoTotal: null,
    operadorId: null,
    observaciones: null,
    createdAt: '2026-07-24T12:00:00.000Z',
    updatedAt: '2026-07-24T12:00:00.000Z',
    articulo: null,
    deposito: null,
    formula: null,
    insumos: [],
  }

  const disponibilidad = {
    ordenId: 5,
    depositoId: 3,
    suficiente: true,
    lineas: [],
  }

  it('covers list, getById, availability, create and lifecycle helpers', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: { success: true, data: [row], total: 1, limit: 50, offset: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: row } })
        .mockResolvedValueOnce({ data: { success: true, data: disponibilidad } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: row } })
        .mockResolvedValueOnce({ data: { success: true, data: { ...row, estado: 'en_proceso' } } })
        .mockResolvedValueOnce({
          data: { success: true, data: { ...row, estado: 'completada', cantidadReal: 480 } },
        })
        .mockResolvedValueOnce({ data: { success: true, data: { ...row, estado: 'cancelada' } } })
        .mockResolvedValueOnce({
          data: { success: true, data: { ordenCompraId: 77, items: [] } },
        }),
    } as unknown as AxiosInstance
    const api = createOrdenesProduccionAPI(http)

    await expect(api.list({ limit: 50, offset: 0 })).resolves.toMatchObject({
      data: [row],
      take: 50,
      skip: 0,
    })
    await expect(api.getById(5)).resolves.toMatchObject({ id: 5 })
    await expect(api.getDisponibilidad(5)).resolves.toMatchObject({ suficiente: true })
    await expect(api.create({ articuloId: 100, cantidadPlanif: 500 })).resolves.toMatchObject({
      id: 5,
    })
    await expect(api.iniciar(5)).resolves.toMatchObject({ estado: 'en_proceso' })
    await expect(api.completar(5, { cantidadReal: 480 })).resolves.toMatchObject({
      cantidadReal: 480,
    })
    await expect(api.cancelar(5)).resolves.toMatchObject({ estado: 'cancelada' })
    await expect(api.sugerirCompra(5, 9)).resolves.toMatchObject({ ordenCompraId: 77 })
  })

  it('propagates Axios errors through handleError for every method', async () => {
    const boom = {
      isAxiosError: true,
      response: { status: 502, data: { success: false, error: 'down' } },
      message: 'Request failed',
    } as AxiosError
    const http = {
      get: vi.fn().mockRejectedValue(boom),
      post: vi.fn().mockRejectedValue(boom),
    } as unknown as AxiosInstance
    const api = createOrdenesProduccionAPI(http)

    await expect(api.list()).rejects.toBeTruthy()
    await expect(api.getById(1)).rejects.toBeTruthy()
    await expect(api.getDisponibilidad(1)).rejects.toBeTruthy()
    await expect(api.create({ articuloId: 1, cantidadPlanif: 1 })).rejects.toBeTruthy()
    await expect(api.iniciar(1)).rejects.toBeTruthy()
    await expect(api.completar(1, { cantidadReal: 1 })).rejects.toBeTruthy()
    await expect(api.cancelar(1)).rejects.toBeTruthy()
    await expect(api.sugerirCompra(1, 2)).rejects.toBeTruthy()
  })
})
