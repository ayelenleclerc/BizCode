import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import { createClientesAPI } from './clientes'

describe('createClientesAPI privacy (#195)', () => {
  it('exports JSON package by default', async () => {
    const payload = { exportedAt: '2026-07-30T00:00:00.000Z', cliente: { id: 7 } }
    const http = {
      get: vi.fn().mockResolvedValue({ data: { success: true, data: payload } }),
    } as unknown as AxiosInstance
    const api = createClientesAPI(http)

    await expect(api.exportarDatos(7)).resolves.toEqual(payload)
    expect(http.get).toHaveBeenCalledWith('/clientes/7/exportar-datos')
  })

  it('exports CSV blob when format=csv', async () => {
    const blob = new Blob(['cliente,rsocial'], { type: 'text/csv' })
    const http = {
      get: vi.fn().mockResolvedValue({ data: blob }),
    } as unknown as AxiosInstance
    const api = createClientesAPI(http)

    await expect(api.exportarDatos(7, 'csv')).resolves.toBe(blob)
    expect(http.get).toHaveBeenCalledWith('/clientes/7/exportar-datos', {
      params: { format: 'csv' },
      responseType: 'blob',
    })
  })

  it('anonymizes with confirm token', async () => {
    const anonymized = { id: 7, rsocial: 'ANON-7', activo: false }
    const http = {
      post: vi.fn().mockResolvedValue({ data: { success: true, data: anonymized } }),
    } as unknown as AxiosInstance
    const api = createClientesAPI(http)

    await expect(api.anonimizar(7)).resolves.toEqual(anonymized)
    expect(http.post).toHaveBeenCalledWith('/clientes/7/anonimizar', { confirm: 'ANONYMIZE' })
  })
})
