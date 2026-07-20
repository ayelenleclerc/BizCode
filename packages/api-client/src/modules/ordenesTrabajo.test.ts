import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createOrdenesTrabajoAPI } from './ordenesTrabajo'

describe('createOrdenesTrabajoAPI', () => {
  const http = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists and creates work orders', async () => {
    http.get.mockResolvedValue({
      data: { success: true, data: [], total: 0, take: 50, skip: 0, counts: {} },
    })
    http.post.mockResolvedValue({ data: { success: true, data: { id: 1, numero: 1 } } })
    const api = createOrdenesTrabajoAPI(http as never)
    await api.list({ estado: 'listo' })
    expect(http.get).toHaveBeenCalledWith('/ordenes-trabajo', { params: { estado: 'listo' } })
    await api.create({ clienteId: 1, equipoDescripcion: 'Notebook', sintomaReportado: 'No enciende' })
    expect(http.post).toHaveBeenCalledWith('/ordenes-trabajo', {
      clienteId: 1,
      equipoDescripcion: 'Notebook',
      sintomaReportado: 'No enciende',
    })
  })

  it('transitions and invoices', async () => {
    http.post.mockResolvedValue({ data: { success: true, data: { id: 2, estado: 'listo' } } })
    const api = createOrdenesTrabajoAPI(http as never)
    await api.transition(2, { estado: 'listo' })
    expect(http.post).toHaveBeenCalledWith('/ordenes-trabajo/2/transicion', { estado: 'listo' })
    http.post.mockResolvedValue({
      data: { success: true, data: { orden: { id: 2 }, facturaId: 99 } },
    })
    await api.facturar(2, { skipArcaCae: true })
    expect(http.post).toHaveBeenCalledWith('/ordenes-trabajo/2/facturar', { skipArcaCae: true })
  })
})
