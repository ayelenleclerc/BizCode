import type { AxiosInstance } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { createFidelizacionAPI } from './fidelizacion'

describe('createFidelizacionAPI (#250)', () => {
  const config = {
    id: 1,
    tenantId: 1,
    activo: true,
    nombre: 'Programa de Puntos',
    pesosPorPunto: 100,
    puntosPorPeso: 1,
    mesesVencimiento: 12,
    montoMinCompra: 0,
    aplicaEnDescuento: false,
    createdAt: '2026-07-24T12:00:00.000Z',
    updatedAt: '2026-07-24T12:00:00.000Z',
  }

  const detail = {
    clienteId: 10,
    puntos: 50,
    equivalenteDinero: 50,
    movimientos: [],
    totalMovimientos: 0,
  }

  const dashboard = {
    puntosEmitidos: 100,
    puntosCanjeados: 20,
    puntosVencidos: 5,
    puntosAjustados: 0,
    pasivoPuntos: 75,
    pasivoDinero: 75,
    ranking: [],
  }

  it('covers config, dashboard, cliente puntos and ajuste', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: config } })
        .mockResolvedValueOnce({ data: { success: true, data: dashboard } })
        .mockResolvedValueOnce({ data: { success: true, data: detail } }),
      put: vi.fn().mockResolvedValue({ data: { success: true, data: { ...config, activo: false } } }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: detail } }),
    } as unknown as AxiosInstance

    const api = createFidelizacionAPI(http)
    await expect(api.getConfig()).resolves.toEqual(config)
    await expect(api.getDashboard()).resolves.toEqual(dashboard)
    await expect(api.getClientePuntos(10, { limit: 20, offset: 0 })).resolves.toEqual(detail)
    await expect(
      api.upsertConfig({
        activo: false,
        pesosPorPunto: 100,
        puntosPorPeso: 1,
      }),
    ).resolves.toEqual({ ...config, activo: false })
    await expect(api.ajustar({ clienteId: 10, puntos: 5, concepto: 'bonus' })).resolves.toEqual(
      detail,
    )
    expect(http.get).toHaveBeenCalledTimes(3)
    expect(http.put).toHaveBeenCalledWith('/fidelizacion/config', {
      activo: false,
      pesosPorPunto: 100,
      puntosPorPeso: 1,
    })
    expect(http.post).toHaveBeenCalledWith('/fidelizacion/ajuste', {
      clienteId: 10,
      puntos: 5,
      concepto: 'bonus',
    })
  })
})
