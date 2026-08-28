import type { AxiosError, AxiosInstance } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFarmaciaAPI } from './farmacia'

vi.mock('../errors', () => ({
  handleError: (error: AxiosError) => {
    throw error
  },
}))

describe('farmaciaAPI (#204)', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const api = createFarmaciaAPI({ get, post, put } as unknown as AxiosInstance)

  beforeEach(() => {
    get.mockReset()
    post.mockReset()
    put.mockReset()
  })

  it('lists and reads prescriptions', async () => {
    get.mockResolvedValue({ data: { success: true, data: [] } })
    await expect(api.listRecetas({ clienteId: 4 })).resolves.toEqual([])
    expect(get).toHaveBeenCalledWith('/farmacia/recetas', { params: { clienteId: 4 } })

    get.mockResolvedValue({ data: { success: true, data: { id: 1 } } })
    await expect(api.getReceta(1)).resolves.toMatchObject({ id: 1 })
    expect(get).toHaveBeenLastCalledWith('/farmacia/recetas/1')
  })

  it('creates a prescription', async () => {
    post.mockResolvedValue({ data: { success: true, data: { id: 1 } } })
    const body = {
      numeroReceta: 'R-1',
      medicoNombre: 'Dra. Ana',
      matricula: 'MN 1',
      fechaReceta: '2026-08-28',
    }
    await expect(api.createReceta(body)).resolves.toMatchObject({ id: 1 })
    expect(post).toHaveBeenCalledWith('/farmacia/recetas', body)
  })

  it('lists, creates and exports psychotropic book entries', async () => {
    get.mockResolvedValue({ data: { success: true, data: [] } })
    await expect(api.listLibro({ tipo: 'egreso' })).resolves.toEqual([])
    expect(get).toHaveBeenCalledWith('/farmacia/libro-psicotropicos', {
      params: { tipo: 'egreso' },
    })

    post.mockResolvedValue({ data: { success: true, data: { id: 2 } } })
    await expect(
      api.createLibroMovimiento({ articuloId: 5, tipo: 'ingreso', cantidad: 3 }),
    ).resolves.toMatchObject({ id: 2 })

    get.mockResolvedValue({ data: '"fecha","tipo"' })
    await expect(api.exportLibroCsv()).resolves.toContain('"fecha"')
    expect(get).toHaveBeenLastCalledWith('/farmacia/libro-psicotropicos/export', {
      params: undefined,
      responseType: 'text',
    })
  })

  it('stores the lot unit serial', async () => {
    put.mockResolvedValue({
      data: { success: true, data: { id: 8, serialUnidad: 'AB-1', codigoDatamatrix: null } },
    })
    await expect(api.setLoteSerial(8, { serialUnidad: 'AB-1' })).resolves.toMatchObject({
      serialUnidad: 'AB-1',
    })
    expect(put).toHaveBeenCalledWith('/farmacia/lotes/8/serial', { serialUnidad: 'AB-1' })
  })

  it('propagates transport errors', async () => {
    const failure = new Error('network') as AxiosError
    get.mockRejectedValue(failure)
    post.mockRejectedValue(failure)
    put.mockRejectedValue(failure)
    await expect(api.listRecetas()).rejects.toThrow('network')
    await expect(api.getReceta(1)).rejects.toThrow('network')
    await expect(
      api.createReceta({
        numeroReceta: 'R',
        medicoNombre: 'M',
        matricula: 'X',
        fechaReceta: '2026-08-28',
      }),
    ).rejects.toThrow('network')
    await expect(api.listLibro()).rejects.toThrow('network')
    await expect(
      api.createLibroMovimiento({ articuloId: 1, tipo: 'ingreso', cantidad: 1 }),
    ).rejects.toThrow('network')
    await expect(api.exportLibroCsv()).rejects.toThrow('network')
    await expect(api.setLoteSerial(8, {})).rejects.toThrow('network')
  })
})
