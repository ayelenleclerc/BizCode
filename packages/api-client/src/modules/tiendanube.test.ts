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

import { tiendanubeAPI, ecommerceAPI } from './rest'

describe('tiendanubeAPI (#187)', () => {
  beforeEach(() => {
    http.get.mockReset()
    http.post.mockReset()
    http.put.mockReset()
    http.delete.mockReset()
  })

  it('covers config, OAuth and disconnect', async () => {
    const config = {
      connected: true,
      storeId: '123',
      storeName: 'Mi Tienda',
      storeUrl: 'https://mitienda.mitiendanube.com',
      accessTokenLast4: '7890',
      conectadoAt: '2026-08-01T10:00:00.000Z',
    }
    http.get
      .mockResolvedValueOnce({ data: { success: true, data: config } })
      .mockResolvedValueOnce({
        data: { success: true, data: { authorizationUrl: 'https://tn.example/auth' } },
      })
    http.post.mockResolvedValueOnce({ data: { success: true, data: { disconnected: true } } })

    await expect(tiendanubeAPI.getConfig()).resolves.toEqual(config)
    await expect(tiendanubeAPI.getAuthorizeUrl()).resolves.toEqual({
      authorizationUrl: 'https://tn.example/auth',
    })
    await expect(tiendanubeAPI.disconnect()).resolves.toEqual({ disconnected: true })

    expect(http.get).toHaveBeenCalledWith('/configuracion/tiendanube')
    expect(http.get).toHaveBeenCalledWith('/oauth/tiendanube/authorize')
    expect(http.post).toHaveBeenCalledWith('/oauth/tiendanube/disconnect')
  })

  it('covers articulo listing publish and unlink', async () => {
    const status = {
      linked: true,
      hasPhotos: true,
      photoWarning: false,
      tnProductId: '99',
      estado: 'active',
      syncStatus: 'synced',
      permalink: 'https://tienda.example/p/99',
    }
    http.get.mockResolvedValueOnce({ data: { success: true, data: status } })
    http.put.mockResolvedValueOnce({ data: { success: true, data: status } })
    http.delete.mockResolvedValueOnce({ data: { success: true, data: { unlinked: true } } })

    await expect(tiendanubeAPI.getArticuloListing(42)).resolves.toEqual(status)
    await expect(tiendanubeAPI.upsertArticuloListing(42)).resolves.toEqual(status)
    await expect(tiendanubeAPI.unlinkArticuloListing(42)).resolves.toEqual({ unlinked: true })

    expect(http.get).toHaveBeenCalledWith('/articulos/42/tiendanube')
    expect(http.put).toHaveBeenCalledWith('/articulos/42/tiendanube', {})
    expect(http.delete).toHaveBeenCalledWith('/articulos/42/tiendanube')
  })

  it('covers ordenes list and facturar', async () => {
    const row = {
      id: 1,
      tnOrderId: 'TN-1',
      status: 'paid',
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

    await expect(tiendanubeAPI.listOrdenes({ estado: 'pendiente', limit: 50 })).resolves.toEqual({
      data: [row],
      total: 1,
      limit: 50,
      offset: 0,
    })
    await expect(
      tiendanubeAPI.facturarOrden('TN-1', {
        fecha: '2026-08-01',
        tipo: 'B',
        numero: 1,
        prefijo: '0001',
      }),
    ).resolves.toEqual({ pedidoId: 10, facturaId: 5 })

    expect(http.get).toHaveBeenCalledWith('/tiendanube/ordenes', {
      params: { estado: 'pendiente', limit: 50 },
    })
    expect(http.post).toHaveBeenCalledWith('/tiendanube/ordenes/TN-1/facturar', {
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
    await expect(tiendanubeAPI.getConfig()).rejects.toThrow('boom')
  })
})

describe('ecommerceAPI (#189)', () => {
  beforeEach(() => {
    http.get.mockReset()
  })

  it('lists connectors and sync logs', async () => {
    const connectors = [
      { connectorType: 'tiendanube' as const, status: 'active' as const, registered: true },
    ]
    const logs = [
      {
        id: 1,
        connectorType: 'tiendanube',
        operation: 'update_stock',
        status: 'success',
        errorMsg: null,
        jobId: 9,
        createdAt: '2026-08-01T12:00:00.000Z',
      },
    ]
    http.get
      .mockResolvedValueOnce({ data: { success: true, data: connectors } })
      .mockResolvedValueOnce({
        data: { success: true, data: logs, total: 1, limit: 20, offset: 0 },
      })

    await expect(ecommerceAPI.listConnectors()).resolves.toEqual(connectors)
    await expect(
      ecommerceAPI.listSyncLogs({ connectorType: 'tiendanube', status: 'success' }),
    ).resolves.toEqual({ data: logs, total: 1, limit: 20, offset: 0 })

    expect(http.get).toHaveBeenCalledWith('/ecommerce/connectors')
    expect(http.get).toHaveBeenCalledWith('/ecommerce/sync-logs', {
      params: { connectorType: 'tiendanube', status: 'success' },
    })
  })
})
