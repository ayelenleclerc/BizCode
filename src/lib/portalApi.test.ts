import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockGet, mockPost, mockPut, mockCreate, AxiosErrorMock } = vi.hoisted(() => {
  class AxiosErrorMock extends Error {
    response?: { status: number; data: unknown; statusText: string; headers: Record<string, string> }
    constructor(message: string, response?: AxiosErrorMock['response']) {
      super(message)
      this.response = response
    }
  }
  const mockGet = vi.fn()
  const mockPost = vi.fn()
  const mockPut = vi.fn()
  const mockCreate = vi.fn(() => ({ get: mockGet, post: mockPost, put: mockPut }))
  return { mockGet, mockPost, mockPut, mockCreate, AxiosErrorMock }
})

vi.mock('axios', () => ({
  default: {
    create: mockCreate,
  },
  AxiosError: AxiosErrorMock,
}))

import { portalAPI, portalConfigAPI } from './portalApi'
import { ApiRequestFailedError } from './api'

beforeEach(() => {
  mockGet.mockReset()
  mockPost.mockReset()
  mockPut.mockReset()
})

describe('portalAPI', () => {
  it('getBranding returns tenant branding', async () => {
    mockGet.mockResolvedValueOnce({
      data: { success: true, data: { tenantName: 'Demo', tenantSlug: 'demo', enabled: true } },
    })
    const branding = await portalAPI.getBranding('demo')
    expect(branding.tenantSlug).toBe('demo')
    expect(mockGet).toHaveBeenCalledWith('/portal/demo/branding')
  })

  it('requestMagicLink posts email payload', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true, data: { sent: true } } })
    const result = await portalAPI.requestMagicLink('demo', 'cliente@example.com')
    expect(result.sent).toBe(true)
    expect(mockPost).toHaveBeenCalledWith('/portal/demo/auth/magic-link', { email: 'cliente@example.com' })
  })

  it('listFacturas forwards query params', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: { facturas: [], total: 0 } } })
    await portalAPI.listFacturas('demo', { estado: 'pendiente', limit: 10 })
    expect(mockGet).toHaveBeenCalledWith('/portal/demo/facturas', {
      params: { estado: 'pendiente', limit: 10 },
    })
  })

  it('downloadFacturaPdf returns blob payload', async () => {
    const blob = new Blob(['pdf'])
    mockGet.mockResolvedValueOnce({ data: blob })
    const result = await portalAPI.downloadFacturaPdf('demo', 9)
    expect(result).toBe(blob)
  })

  it('getCuentaCorriente returns statement data', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        success: true,
        data: { clienteId: 1, codigo: 1, rsocial: 'A', saldo: '0', movimientos: [], serie: [], total: 0, limit: 50, offset: 0 },
      },
    })
    const cc = await portalAPI.getCuentaCorriente('demo')
    expect(cc.rsocial).toBe('A')
  })

  it('listPedidos returns pedidos page', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: { pedidos: [], total: 0 } } })
    const page = await portalAPI.listPedidos('demo')
    expect(page.total).toBe(0)
  })
})

describe('portalConfigAPI', () => {
  it('get and update portal config', async () => {
    const config = { enabled: true, showPedidos: true, logoUrl: null, primaryColor: null, footerText: null }
    mockGet.mockResolvedValueOnce({ data: { success: true, data: config } })
    mockPut.mockResolvedValueOnce({ data: { success: true, data: { ...config, enabled: false } } })

    await expect(portalConfigAPI.get()).resolves.toEqual(config)
    await expect(portalConfigAPI.update({ enabled: false })).resolves.toEqual({
      ...config,
      enabled: false,
    })
  })

  it('propagates API errors through handleError', async () => {
    mockGet.mockRejectedValueOnce(
      new AxiosErrorMock('fail', {
        status: 500,
        data: { error: 'boom' },
        statusText: 'ERR',
        headers: {},
      }),
    )
    await expect(portalConfigAPI.get()).rejects.toBeInstanceOf(ApiRequestFailedError)
  })
})
