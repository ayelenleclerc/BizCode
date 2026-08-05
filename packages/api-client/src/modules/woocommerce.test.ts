import { beforeEach, describe, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
}))

vi.mock('../default-client', () => ({
  api: http,
  portalHttp: http,
  configureApiClient: vi.fn(),
  configurePortalApiClient: vi.fn(),
  configureApiClients: vi.fn(),
}))

import { woocommerceAPI } from './rest'

describe('woocommerceAPI (#188)', () => {
  beforeEach(() => {
    http.get.mockReset()
    http.post.mockReset()
    http.put.mockReset()
    http.delete.mockReset()
  })

  it('covers config get/verifyAndSave/verify/disconnect', async () => {
    const config = {
      connected: true,
      storeUrl: 'https://mitienda.com',
      storeName: 'Mi Tienda',
      consumerKeyLast4: '7890',
      hasWebhookSecret: true,
      conectadoAt: '2026-08-01T10:00:00.000Z',
      webhookUrl: 'https://api.example.com/api/webhooks/woocommerce/1',
    }
    http.get.mockResolvedValueOnce({ data: { success: true, data: config } })
    http.put.mockResolvedValueOnce({ data: { success: true, data: config } })
    http.post.mockResolvedValueOnce({ data: { success: true, data: { verified: true } } })
    http.delete.mockResolvedValueOnce({ data: { success: true, data: { disconnected: true } } })

    await expect(woocommerceAPI.getConfig()).resolves.toEqual(config)
    await expect(
      woocommerceAPI.verifyAndSave({
        storeUrl: 'https://mitienda.com',
        consumerKey: 'ck_123',
        consumerSecret: 'cs_456',
        webhookSecret: 'whsec',
      }),
    ).resolves.toEqual(config)
    await expect(woocommerceAPI.verify()).resolves.toEqual({ verified: true })
    await expect(woocommerceAPI.disconnect()).resolves.toEqual({ disconnected: true })

    expect(http.get).toHaveBeenCalledWith('/configuracion/woocommerce')
    expect(http.put).toHaveBeenCalledWith('/configuracion/woocommerce', {
      storeUrl: 'https://mitienda.com',
      consumerKey: 'ck_123',
      consumerSecret: 'cs_456',
      webhookSecret: 'whsec',
    })
    expect(http.post).toHaveBeenCalledWith('/configuracion/woocommerce/verificar')
    expect(http.delete).toHaveBeenCalledWith('/configuracion/woocommerce')
  })

  it('covers articulo listing publish and unlink', async () => {
    const status = {
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      wcProductId: '99',
      estado: 'active',
      syncStatus: 'synced',
      permalink: 'https://mitienda.com/producto/99',
    }
    http.get.mockResolvedValueOnce({ data: { success: true, data: status } })
    http.put.mockResolvedValueOnce({ data: { success: true, data: status } })
    http.delete.mockResolvedValueOnce({ data: { success: true, data: { unlinked: true } } })

    await expect(woocommerceAPI.getArticuloListing(42)).resolves.toEqual(status)
    await expect(woocommerceAPI.upsertArticuloListing(42)).resolves.toEqual(status)
    await expect(woocommerceAPI.unlinkArticuloListing(42)).resolves.toEqual({ unlinked: true })

    expect(http.get).toHaveBeenCalledWith('/articulos/42/woocommerce')
    expect(http.put).toHaveBeenCalledWith('/articulos/42/woocommerce', {})
    expect(http.delete).toHaveBeenCalledWith('/articulos/42/woocommerce')
  })

  it('covers ordenes list and facturar', async () => {
    const row = {
      id: 1,
      wcOrderId: 'WC-1',
      status: 'processing',
      buyerNickname: 'BUYER',
      cuitPending: false,
      stockAppliedAt: null,
      lastSyncedAt: '2026-08-01T12:00:00.000Z',
      pedidoId: 10,
      pedidoEstado: 'confirmed',
      pedidoTotal: '100',
      facturaId: null,
      clienteId: 2,
      clienteRsocial: 'Cliente',
      clienteCuit: null,
    }
    http.get.mockResolvedValueOnce({
      data: { success: true, data: [row], total: 1, limit: 50, offset: 0 },
    })
    http.post.mockResolvedValueOnce({
      data: { success: true, data: { pedidoId: 10, facturaId: 5 } },
    })

    await expect(woocommerceAPI.listOrdenes({ estado: 'pendiente', limit: 50 })).resolves.toEqual({
      data: [row],
      total: 1,
      limit: 50,
      offset: 0,
    })
    await expect(
      woocommerceAPI.facturarOrden('WC-1', {
        fecha: '2026-08-01',
        tipo: 'B',
        numero: 1,
        prefijo: '0001',
      }),
    ).resolves.toEqual({ pedidoId: 10, facturaId: 5 })

    expect(http.get).toHaveBeenCalledWith('/woocommerce/ordenes', {
      params: { estado: 'pendiente', limit: 50 },
    })
    expect(http.post).toHaveBeenCalledWith('/woocommerce/ordenes/WC-1/facturar', {
      fecha: '2026-08-01',
      tipo: 'B',
      numero: 1,
      prefijo: '0001',
    })
  })

  it('propagates API errors via handleError', async () => {
    http.get.mockRejectedValueOnce({
      isAxiosError: true,
      message: 'Request failed',
      response: { status: 500, data: { error: 'boom' }, headers: {} },
    })
    await expect(woocommerceAPI.getConfig()).rejects.toThrow('boom')
  })
})
