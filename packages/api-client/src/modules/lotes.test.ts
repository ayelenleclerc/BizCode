import type { AxiosError, AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLotesAPI } from './lotes'

vi.mock('../errors', () => ({
  handleError: (error: AxiosError) => {
    throw error
  },
}))

describe('createLotesAPI (#202)', () => {
  const get = vi.fn()
  const put = vi.fn()
  const post = vi.fn()
  const http = { get, put, post } as unknown as AxiosInstance
  const api = createLotesAPI(http)

  beforeEach(() => {
    get.mockReset()
    put.mockReset()
    post.mockReset()
  })

  it('getConfig hits /fefo/config', async () => {
    get.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 1,
          tenantId: 1,
          diasAlertaVencimiento: 30,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    })
    const cfg = await api.getConfig()
    expect(get).toHaveBeenCalledWith('/fefo/config')
    expect(cfg.diasAlertaVencimiento).toBe(30)
  })

  it('previewFefo passes query params', async () => {
    get.mockResolvedValue({
      data: {
        success: true,
        data: [{ loteId: 1, nroLote: 'A', fechaVencimiento: '2026-07-01', cantidad: 2 }],
      },
    })
    const rows = await api.previewFefo({ articuloId: 5, depositoId: 2, quantity: 2 })
    expect(get).toHaveBeenCalledWith('/lotes/preview-fefo', {
      params: { articuloId: 5, depositoId: 2, quantity: 2 },
    })
    expect(rows).toHaveLength(1)
  })

  it('create posts /lotes', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          id: 9,
          tenantId: 1,
          articuloId: 1,
          depositoId: 1,
          proveedorId: null,
          nroLote: 'L1',
          fechaVencimiento: '2026-12-01',
          fechaIngreso: '2026-07-01T00:00:00.000Z',
          stockInicial: 0,
          stockActual: 0,
          activo: true,
          preavisoEnviadoAt: null,
          createdAt: '2026-07-01T00:00:00.000Z',
          updatedAt: '2026-07-01T00:00:00.000Z',
        },
      },
    })
    const created = await api.create({
      articuloId: 1,
      depositoId: 1,
      nroLote: 'L1',
      fechaVencimiento: '2026-12-01',
    })
    expect(post).toHaveBeenCalledWith('/lotes', {
      articuloId: 1,
      depositoId: 1,
      nroLote: 'L1',
      fechaVencimiento: '2026-12-01',
    })
    expect(created.id).toBe(9)
  })

  it('updates configuration and reads lot collections and traceability', async () => {
    put.mockResolvedValue({
      data: { success: true, data: { diasAlertaVencimiento: 45 } },
    })
    get
      .mockResolvedValueOnce({ data: { success: true, data: [] } })
      .mockResolvedValueOnce({ data: { success: true, data: [] } })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: { lote: { id: 9 }, facturas: [] },
        },
      })

    await expect(api.upsertConfig({ diasAlertaVencimiento: 45 })).resolves.toMatchObject({
      diasAlertaVencimiento: 45,
    })
    await expect(api.list({ articuloId: 1, soloActivos: true })).resolves.toEqual([])
    await expect(api.listExpiring()).resolves.toEqual([])
    await expect(api.getTrazabilidad(1, 9)).resolves.toMatchObject({ lote: { id: 9 } })

    expect(put).toHaveBeenCalledWith('/fefo/config', { diasAlertaVencimiento: 45 })
    expect(get).toHaveBeenNthCalledWith(1, '/lotes', {
      params: { articuloId: 1, soloActivos: true },
    })
    expect(get).toHaveBeenNthCalledWith(2, '/lotes/por-vencer')
    expect(get).toHaveBeenNthCalledWith(3, '/articulos/1/trazabilidad', {
      params: { loteId: 9 },
    })
  })
})
