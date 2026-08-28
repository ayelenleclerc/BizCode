import type { AxiosError, AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createExportacionAPI } from './exportacion'

vi.mock('../errors', () => ({
  handleError: (error: AxiosError) => {
    throw error
  },
}))

describe('exportacionAPI (#206)', () => {
  const get = vi.fn()
  const post = vi.fn()
  const api = createExportacionAPI({ get, post } as unknown as AxiosInstance)

  beforeEach(() => {
    get.mockReset()
    post.mockReset()
  })

  it('lists the Incoterms catalog', async () => {
    get.mockResolvedValue({ data: { success: true, data: ['FOB', 'CIF'] } })
    await expect(api.listIncoterms()).resolves.toEqual(['FOB', 'CIF'])
    expect(get).toHaveBeenCalledWith('/exportacion/incoterms')
  })

  it('notifies the customs broker', async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: { pedidoId: 12, despachanteEmail: 'broker@example.com', enviado: true },
      },
    })
    const body = { despachanteEmail: 'broker@example.com' }
    await expect(api.notificarDespachante(12, body)).resolves.toMatchObject({ enviado: true })
    expect(post).toHaveBeenCalledWith('/pedidos/12/notificar-despachante', body)
  })

  it('propagates request failures', async () => {
    const error = new Error('boom') as AxiosError
    post.mockRejectedValue(error)
    await expect(api.notificarDespachante(12, {})).rejects.toBe(error)

    get.mockRejectedValue(error)
    await expect(api.listIncoterms()).rejects.toBe(error)
  })
})
