import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createCobrosAPI } from './cobros'
import { createFormasPagoAPI } from './formasPago'

function mockHttp(): AxiosInstance {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  } as unknown as AxiosInstance
}

describe('createCobrosAPI (#162)', () => {
  it('getTransferInfo returns tenant CBU payload or null', async () => {
    const http = mockHttp()
    const info = { banco: 'Galicia', cbu: '1234567890123456789012', alias: 'biz.gal' }
    vi.mocked(http.get).mockResolvedValueOnce({ data: { success: true, data: info } })
    await expect(createCobrosAPI(http).getTransferInfo()).resolves.toEqual(info)

    vi.mocked(http.get).mockResolvedValueOnce({ data: { success: true, data: null } })
    await expect(createCobrosAPI(http).getTransferInfo()).resolves.toBeNull()
  })

  it('create posts cobro body', async () => {
    const http = mockHttp()
    vi.mocked(http.post).mockResolvedValueOnce({
      data: { success: true, data: { cobro: { id: 10 }, updatedCliente: { id: 1 }, retenciones: [], montoBruto: '10.00' } },
    })
    const created = await createCobrosAPI(http).create({
      clienteId: 1,
      fecha: '2026-08-18',
      monto: 10,
    })
    expect(created?.cobro.id).toBe(10)
    expect(http.post).toHaveBeenCalledWith('/cobros', { clienteId: 1, fecha: '2026-08-18', monto: 10 })
  })
})

describe('createFormasPagoAPI (#162)', () => {
  it('lists formas through the injected HTTP client', async () => {
    const http = mockHttp()
    vi.mocked(http.get).mockResolvedValueOnce({
      data: { success: true, data: [{ id: 1, codigo: 1, descripcion: 'Efectivo', vto_dias: 0, esEfectivo: true }] },
    })
    await expect(createFormasPagoAPI(http).list()).resolves.toEqual([
      { id: 1, codigo: 1, descripcion: 'Efectivo', vto_dias: 0, esEfectivo: true },
    ])
    expect(http.get).toHaveBeenCalledWith('/formas-pago')
  })
})
