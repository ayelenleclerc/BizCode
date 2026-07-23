import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createDepositosAPI } from './depositos'

const DEPOSITO = {
  id: 1,
  tenantId: 1,
  nombre: 'Central',
  codigo: 'DEFAULT',
  tipo: 'central' as const,
  direccion: null,
  responsableId: null,
  activo: true,
  esDefault: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
}

const TRANSF = {
  id: 9,
  tenantId: 1,
  numero: 1,
  origenId: 1,
  destinoId: 2,
  estado: 'pendiente' as const,
  solicitadoPorId: 3,
  aprobadoPorId: null,
  fechaEnvio: null,
  fechaRecepcion: null,
  nota: null,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
  items: [],
}

describe('createDepositosAPI (#236)', () => {
  it('covers depositos CRUD and stock breakdown', async () => {
    const listBody = { success: true, data: [DEPOSITO], total: 1, take: 100, skip: 0 }
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({ data: listBody })
        .mockResolvedValueOnce({ data: { success: true, data: DEPOSITO } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            articuloId: 5,
            stockTotal: 10,
            enTransito: 0,
            depositos: [],
          },
        }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: DEPOSITO } }),
      patch: vi.fn().mockResolvedValue({
        data: { success: true, data: { ...DEPOSITO, nombre: 'Central 2' } },
      }),
      delete: vi.fn().mockResolvedValue({ data: undefined }),
    } as unknown as AxiosInstance
    const api = createDepositosAPI(http)

    await expect(api.listDepositos({ activo: true })).resolves.toEqual(listBody)
    await expect(api.getDeposito(1)).resolves.toEqual(DEPOSITO)
    await expect(
      api.createDeposito({ nombre: 'Central', codigo: 'DEFAULT', tipo: 'central' }),
    ).resolves.toEqual(DEPOSITO)
    await expect(api.updateDeposito(1, { nombre: 'Central 2' })).resolves.toEqual({
      ...DEPOSITO,
      nombre: 'Central 2',
    })
    await expect(api.removeDeposito(1)).resolves.toBeUndefined()
    await expect(api.stockPorArticulo(5)).resolves.toMatchObject({ articuloId: 5, stockTotal: 10 })
  })

  it('covers transferencias lifecycle', async () => {
    const http = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          data: { success: true, data: [TRANSF], total: 1, take: 100, skip: 0 },
        })
        .mockResolvedValueOnce({ data: { success: true, data: TRANSF } }),
      post: vi
        .fn()
        .mockResolvedValueOnce({ data: { success: true, data: TRANSF } })
        .mockResolvedValueOnce({
          data: { success: true, data: { ...TRANSF, estado: 'en_transito' } },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { ...TRANSF, estado: 'recibida' } },
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { ...TRANSF, estado: 'anulada' } },
        }),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as AxiosInstance
    const api = createDepositosAPI(http)

    await expect(api.listTransferencias()).resolves.toMatchObject({ data: [TRANSF] })
    await expect(api.getTransferencia(9)).resolves.toEqual(TRANSF)
    await expect(
      api.createTransferencia({
        origenId: 1,
        destinoId: 2,
        items: [{ articuloId: 5, cantidadEnviada: 3 }],
      }),
    ).resolves.toEqual(TRANSF)
    await expect(api.markEnTransito(9)).resolves.toMatchObject({ estado: 'en_transito' })
    await expect(
      api.recibirTransferencia(9, { items: [{ articuloId: 5, cantidadRecibida: 3 }] }),
    ).resolves.toMatchObject({ estado: 'recibida' })
    await expect(api.anularTransferencia(9)).resolves.toMatchObject({ estado: 'anulada' })
  })
})
