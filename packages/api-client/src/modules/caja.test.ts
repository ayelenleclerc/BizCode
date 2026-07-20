import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createCajaAPI } from './caja'

const CAJA = {
  id: 1,
  nombre: 'Caja 1',
  activa: true,
  createdAt: '2026-07-20T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z',
}

const TURNO = {
  id: 10,
  cajaId: 1,
  cajeroId: 2,
  estado: 'abierto' as const,
  montoApertura: 1000,
  fechaApertura: '2026-07-20T10:00:00.000Z',
  fechaCierre: null,
  totalVentasEfectivo: null,
  totalVentasTarjeta: null,
  totalVentasMP: null,
  totalVentasTransf: null,
  totalEgresos: null,
  totalIngresosExtra: null,
  efectivoEsperado: null,
  efectivoContado: null,
  diferencia: null,
  observaciones: null,
  createdAt: '2026-07-20T10:00:00.000Z',
  updatedAt: '2026-07-20T10:00:00.000Z',
}

describe('createCajaAPI', () => {
  it('lists and creates cajas', async () => {
    const http = {
      get: vi.fn().mockResolvedValue({ data: { success: true, data: [CAJA] } }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: CAJA } }),
    } as unknown as AxiosInstance
    const api = createCajaAPI(http)

    await expect(api.listCajas()).resolves.toEqual([CAJA])
    expect(http.get).toHaveBeenCalledWith('/cajas')

    await expect(api.createCaja({ nombre: 'Caja 1' })).resolves.toEqual(CAJA)
    expect(http.post).toHaveBeenCalledWith('/cajas', { nombre: 'Caja 1' })
  })

  it('lists, gets, opens, moves, closes turnos and builds pdf url', async () => {
    const listBody = {
      success: true,
      data: [TURNO],
      total: 1,
      take: 50,
      skip: 0,
      counts: { abiertos: 1, cerradosHoy: 0, diferenciaHoy: 0 },
    }
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: listBody })
        .mockResolvedValueOnce({ data: { success: true, data: TURNO } }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: TURNO } }),
    } as unknown as AxiosInstance
    const api = createCajaAPI(http)

    await expect(api.listTurnos({ estado: 'abierto', cajaId: 1 })).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/turnos-caja', {
      params: { estado: 'abierto', cajaId: 1 },
    })

    await expect(api.getTurno(10)).resolves.toEqual(TURNO)
    expect(http.get).toHaveBeenCalledWith('/turnos-caja/10')

    await expect(api.open({ cajaId: 1, montoApertura: 1000 })).resolves.toEqual(TURNO)
    expect(http.post).toHaveBeenCalledWith('/turnos-caja', {
      cajaId: 1,
      montoApertura: 1000,
    })

    await expect(
      api.addMovimiento(10, { tipo: 'egreso', importe: 50, concepto: 'retiro' }),
    ).resolves.toEqual(TURNO)
    expect(http.post).toHaveBeenCalledWith('/turnos-caja/10/movimientos', {
      tipo: 'egreso',
      importe: 50,
      concepto: 'retiro',
    })

    await expect(
      api.close(10, { conteo: { b1000: 1 }, observaciones: null }),
    ).resolves.toEqual(TURNO)
    expect(http.post).toHaveBeenCalledWith('/turnos-caja/10/cerrar', {
      conteo: { b1000: 1 },
      observaciones: null,
    })

    expect(api.pdfUrl(10)).toBe('/turnos-caja/10/pdf')
  })
})
