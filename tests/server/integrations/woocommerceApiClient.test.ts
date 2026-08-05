/**
 * @en Unit tests for WooCommerce HTTP API client + store URL hardening (#188).
 * @es Tests unitarios del cliente HTTP WooCommerce + endurecimiento de store URL (#188).
 * @pt-BR Testes unitários do cliente HTTP WooCommerce + hardening de store URL (#188).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createWooCommerceProduct,
  getWooCommerceOrder,
  updateWooCommerceOrder,
  updateWooCommerceProduct,
  verifyWooCommerceConnection,
  woocommerceApiUrl,
  WooCommerceApiError,
} from '../../../apps/server/integrations/woocommerce/woocommerceApiClient'
import {
  isBlockedWooCommerceHostname,
  normalizeAndValidateWooCommerceStoreUrl,
  normalizeWooCommerceApiPath,
  stripTrailingSlashes,
  WooCommerceStoreUrlError,
} from '../../../apps/server/lib/woocommerceStoreUrl'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('woocommerceStoreUrl (#188)', () => {
  it('strips trailing slashes without regex', () => {
    expect(stripTrailingSlashes('https://shop.example///')).toBe('https://shop.example')
    expect(stripTrailingSlashes('abc')).toBe('abc')
  })

  it('accepts public https origins and rejects private/http hosts', () => {
    expect(normalizeAndValidateWooCommerceStoreUrl('https://shop.example.com/path')).toBe(
      'https://shop.example.com',
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('http://shop.example.com')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('https://127.0.0.1')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('https://192.168.1.10')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('https://10.0.0.5')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('https://172.16.0.1')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeAndValidateWooCommerceStoreUrl('https://localhost')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(isBlockedWooCommerceHostname('metadata.google.internal')).toBe(true)
    expect(normalizeWooCommerceApiPath('products')).toBe('/products')
    expect(() => normalizeWooCommerceApiPath('https://evil.example/x')).toThrow(
      WooCommerceStoreUrlError,
    )
    expect(() => normalizeWooCommerceApiPath('../etc/passwd')).toThrow(WooCommerceStoreUrlError)
  })
})

describe('woocommerceApiClient (#188)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds api urls after validating the store base', () => {
    expect(woocommerceApiUrl('https://shop.example.com/', '/products?per_page=1')).toBe(
      'https://shop.example.com/wp-json/wc/v3/products?per_page=1',
    )
    expect(() => woocommerceApiUrl('http://shop.example.com', '/products')).toThrow(
      WooCommerceStoreUrlError,
    )
  })

  it('covers product/order helpers and Basic Auth header', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(200, [{ id: 1 }]))
      .mockResolvedValueOnce(jsonResponse(200, { id: 10, name: 'Demo' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 10, stock_quantity: 3 }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 99, status: 'processing' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 99, status: 'completed' }))

    await expect(
      verifyWooCommerceConnection('https://shop.example.com', 'ck', 'cs'),
    ).resolves.toBeUndefined()
    await expect(
      createWooCommerceProduct('https://shop.example.com', 'ck', 'cs', {
        name: 'Demo',
        regular_price: '10.00',
        manage_stock: true,
        stock_quantity: 1,
      }),
    ).resolves.toMatchObject({ id: 10 })
    await expect(
      updateWooCommerceProduct('https://shop.example.com', 'ck', 'cs', '10', {
        stock_quantity: 3,
      }),
    ).resolves.toMatchObject({ stock_quantity: 3 })
    await expect(
      getWooCommerceOrder('https://shop.example.com', 'ck', 'cs', '99'),
    ).resolves.toMatchObject({ status: 'processing' })
    await expect(
      updateWooCommerceOrder('https://shop.example.com', 'ck', 'cs', '99', {
        status: 'completed',
      }),
    ).resolves.toMatchObject({ status: 'completed' })

    expect(fetch).toHaveBeenCalledTimes(5)
    const firstCall = vi.mocked(fetch).mock.calls[0]
    expect(String(firstCall[0])).toContain('/wp-json/wc/v3/products?per_page=1')
    const headers = firstCall[1]?.headers as Headers
    expect(headers.get('Authorization')).toMatch(/^Basic /)
  })

  it('throws WooCommerceApiError with detail on failed responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(400, { message: 'invalid product' }))
    await expect(
      createWooCommerceProduct('https://shop.example.com', 'ck', 'cs', { name: 'X' }),
    ).rejects.toMatchObject({
      name: 'WooCommerceApiError',
      status: 400,
      message: expect.stringContaining('invalid product'),
    })
  })

  it('maps unauthorized verify failures', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, {}))
    await expect(
      verifyWooCommerceConnection('https://shop.example.com', 'bad', 'bad'),
    ).rejects.toBeInstanceOf(WooCommerceApiError)
  })
})
