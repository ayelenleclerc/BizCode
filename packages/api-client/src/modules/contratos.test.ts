import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createContratosAPI } from './contratos'

function mockHttp(getData: unknown, postData?: unknown): AxiosInstance {
  return {
    get: vi.fn().mockResolvedValue({ data: getData }),
    post: vi.fn().mockResolvedValue({ data: postData ?? getData }),
    put: vi.fn().mockResolvedValue({ data: postData ?? getData }),
  } as unknown as AxiosInstance
}

describe('createContratosAPI', () => {
  it('lists and creates contracts through HTTP helpers', async () => {
    const listBody = { success: true, data: [{ id: 1 }], total: 1, take: 100, skip: 0 }
    const created = { success: true, data: { id: 2, numero: 1 } }
    const http = mockHttp(listBody, created)
    const api = createContratosAPI(http)

    await expect(api.list()).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/contratos')

    await expect(api.create({ nombre: 'Soporte' })).resolves.toEqual(created.data)
    expect(http.post).toHaveBeenCalledWith('/contratos', { nombre: 'Soporte' })
  })

  it('pauses and lists facturas for a contract', async () => {
    const paused = { success: true, data: { id: 3, estado: 'pausado' } }
    const facturas = { success: true, data: [{ id: 9 }] }
    const http = {
      get: vi.fn().mockResolvedValue({ data: facturas }),
      post: vi.fn().mockResolvedValue({ data: paused }),
      put: vi.fn(),
    } as unknown as AxiosInstance
    const api = createContratosAPI(http)

    await expect(api.pause(3)).resolves.toEqual(paused.data)
    await expect(api.listFacturas(3)).resolves.toEqual(facturas.data)
    expect(http.post).toHaveBeenCalledWith('/contratos/3/pause')
    expect(http.get).toHaveBeenCalledWith('/contratos/3/facturas')
  })
})
