import { describe, expect, it, vi } from 'vitest'
import type { AxiosError, AxiosInstance } from 'axios'
import type { PedidoRow } from '@bizcode/types'
import { createPedidosAPI } from './pedidos'

const PEDIDO: PedidoRow = {
  id: 1,
  clienteId: 2,
  vendedorId: null,
  estado: 'draft',
  total: 120,
  validUntil: null,
  facturaId: null,
  createdAt: '2026-01-15T12:00:00.000Z',
  updatedAt: '2026-01-15T12:00:00.000Z',
  cliente: { id: 2, codigo: 10, rsocial: 'Cliente SA' },
}

const listBody = {
  success: true,
  data: [PEDIDO],
  total: 1,
  take: 100,
  skip: 0,
}

function mockHttp(): AxiosInstance {
  return {
    get: vi.fn().mockResolvedValue({ data: listBody }),
    post: vi.fn().mockResolvedValue({ data: { success: true, data: PEDIDO } }),
    put: vi.fn().mockResolvedValue({ data: { success: true, data: PEDIDO } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true, data: { ...PEDIDO, estado: 'cancelled' } } }),
  } as unknown as AxiosInstance
}

describe('createPedidosAPI', () => {
  it('lists and gets pedidos through HTTP helpers', async () => {
    const http = mockHttp()
    vi.mocked(http.get)
      .mockResolvedValueOnce({ data: listBody })
      .mockResolvedValueOnce({ data: listBody })
      .mockResolvedValueOnce({ data: { success: true, data: PEDIDO } })
    const api = createPedidosAPI(http)

    await expect(api.list({ estado: 'confirmed', clienteId: 2 })).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/pedidos', {
      params: { estado: 'confirmed', clienteId: 2 },
    })

    await expect(api.list({ clienteId: 2, limit: 10, offset: 0 })).resolves.toEqual(listBody)
    expect(http.get).toHaveBeenCalledWith('/pedidos', {
      params: { clienteId: 2, limit: 10, offset: 0 },
    })

    await expect(api.get(1)).resolves.toEqual(PEDIDO)
    expect(http.get).toHaveBeenCalledWith('/pedidos/1')
  })

  it('creates and updates pedidos', async () => {
    const http = mockHttp()
    const api = createPedidosAPI(http)
    const body = {
      clienteId: 2,
      items: [{ descripcion: 'Item', condIva: '1', cantidad: 1, precio: 10, dscto: 0 }],
    }

    await expect(api.create(body)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos', body)

    await expect(api.update(1, { notas: 'x' })).resolves.toEqual(PEDIDO)
    expect(http.put).toHaveBeenCalledWith('/pedidos/1', { notas: 'x' })
  })

  it('runs lifecycle mutations confirm/pack/ship/deliver/collect/transition/invoice/cancel', async () => {
    const http = mockHttp()
    const api = createPedidosAPI(http)

    await expect(api.confirm(1)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/confirm')

    await expect(api.pack(1)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/pack')

    await expect(api.ship(1)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/ship')

    await expect(api.deliver(1)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/deliver')

    await expect(api.collect(1)).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/collect')

    await expect(api.transition(1, { to: 'packed' })).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/transitions', { to: 'packed' })

    await expect(api.invoice(1, { fecha: '2026-08-01', tipo: 'B', numero: 1 })).resolves.toEqual(PEDIDO)
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/invoice', {
      fecha: '2026-08-01',
      tipo: 'B',
      numero: 1,
    })

    await expect(api.cancel(1)).resolves.toMatchObject({ estado: 'cancelled' })
    expect(http.delete).toHaveBeenCalledWith('/pedidos/1')
  })

  it('propagates Axios errors through handleError for every method', async () => {
    const boom = {
      isAxiosError: true,
      response: { status: 502, data: { success: false, error: 'down' } },
      message: 'Request failed',
    } as AxiosError
    const http = {
      get: vi.fn().mockRejectedValue(boom),
      post: vi.fn().mockRejectedValue(boom),
      put: vi.fn().mockRejectedValue(boom),
      delete: vi.fn().mockRejectedValue(boom),
    } as unknown as AxiosInstance
    const api = createPedidosAPI(http)

    await expect(api.list()).rejects.toBeTruthy()
    await expect(api.get(1)).rejects.toBeTruthy()
    await expect(api.create({})).rejects.toBeTruthy()
    await expect(api.update(1, {})).rejects.toBeTruthy()
    await expect(api.confirm(1)).rejects.toBeTruthy()
    await expect(api.pack(1)).rejects.toBeTruthy()
    await expect(api.ship(1)).rejects.toBeTruthy()
    await expect(api.deliver(1)).rejects.toBeTruthy()
    await expect(api.collect(1)).rejects.toBeTruthy()
    await expect(api.transition(1, { to: 'packed' })).rejects.toBeTruthy()
    await expect(api.invoice(1, {})).rejects.toBeTruthy()
    await expect(api.cancel(1)).rejects.toBeTruthy()
    await expect(api.getWhatsAppShare(1)).rejects.toBeTruthy()
    await expect(api.sendWhatsApp(1, { canal: 'link' })).rejects.toBeTruthy()
  })

  it('previews and sends WhatsApp confirmation (#265)', async () => {
    const share = {
      phone: '5491112345678',
      text: 'Pedido #1',
      waMeUrl: 'https://wa.me/5491112345678?text=Pedido%20%231',
      twilioAvailable: false,
    }
    const http = mockHttp()
    vi.mocked(http.get).mockResolvedValue({ data: { success: true, data: share } })
    vi.mocked(http.post).mockResolvedValue({
      data: { success: true, data: { canal: 'link', sent: false } },
    })
    const api = createPedidosAPI(http)

    await expect(api.getWhatsAppShare(1, 'es')).resolves.toEqual(share)
    expect(http.get).toHaveBeenCalledWith('/pedidos/1/whatsapp-share', { params: { locale: 'es' } })

    await expect(api.sendWhatsApp(1, { canal: 'link' })).resolves.toEqual({
      canal: 'link',
      sent: false,
    })
    expect(http.post).toHaveBeenCalledWith('/pedidos/1/whatsapp', { canal: 'link' }, undefined)
  })
})
