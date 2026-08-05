/**
 * @en Unit tests for Tiendanube HTTP API client helpers (#187).
 * @es Tests unitarios del cliente HTTP Tiendanube (#187).
 * @pt-BR Testes unitários do cliente HTTP Tiendanube (#187).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTiendanubeProduct,
  ensureTiendanubeOrderPaidWebhook,
  getTiendanubeOrder,
  updateTiendanubeOrder,
  updateTiendanubeProduct,
  updateTiendanubeVariant,
} from '../../../apps/server/integrations/tiendanube/tiendanubeApiClient'
import {
  exchangeTiendanubeAuthorizationCode,
  fetchTiendanubeStore,
  resolveTiendanubeUserAgent,
  tiendanubeApiUrl,
  TiendanubeApiError,
} from '../../../apps/server/integrations/tiendanube/tiendanubeOAuthClient'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('tiendanubeApiClient + OAuth HTTP (#187)', () => {
  beforeEach(() => {
    process.env.TIENDANUBE_USER_AGENT = 'BizCode-Test/1.0'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds api urls and default user agent', () => {
    expect(tiendanubeApiUrl('817495', 'products')).toBe(
      'https://api.tiendanube.com/v1/817495/products',
    )
    expect(tiendanubeApiUrl('817495', '/store')).toBe(
      'https://api.tiendanube.com/v1/817495/store',
    )
    delete process.env.TIENDANUBE_USER_AGENT
    expect(resolveTiendanubeUserAgent()).toContain('BizCode')
  })

  it('covers product/variant/order CRUD helpers', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse(200, { id: 1, variants: [{ id: 2 }] }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 1, published: false }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 2, stock: 3 }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 9, payment_status: 'paid' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 9, shipping_status: 'shipped' }))

    await expect(
      createTiendanubeProduct('817495', 'tok', {
        name: { es: 'Demo' },
        variants: [{ price: '10', stock: 1 }],
      }),
    ).resolves.toMatchObject({ id: 1 })
    await expect(
      updateTiendanubeProduct('817495', 'tok', '1', { published: false }),
    ).resolves.toMatchObject({ published: false })
    await expect(
      updateTiendanubeVariant('817495', 'tok', '1', '2', { stock: 3 }),
    ).resolves.toMatchObject({ stock: 3 })
    await expect(getTiendanubeOrder('817495', 'tok', '9')).resolves.toMatchObject({
      payment_status: 'paid',
    })
    await expect(
      updateTiendanubeOrder('817495', 'tok', '9', { shipping_status: 'shipped' }),
    ).resolves.toMatchObject({ shipping_status: 'shipped' })
    expect(fetch).toHaveBeenCalledTimes(5)
  })

  it('throws TiendanubeApiError with detail on failed responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(400, { description: 'invalid payload' }))
    await expect(
      createTiendanubeProduct('817495', 'tok', {
        name: { es: 'X' },
        variants: [{ price: 1 }],
      }),
    ).rejects.toMatchObject({
      name: 'TiendanubeApiError',
      status: 400,
      message: expect.stringContaining('invalid payload'),
    })
  })

  it('allows webhook 422 and throws on other errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(422, { message: 'exists' }))
    await expect(
      ensureTiendanubeOrderPaidWebhook('817495', 'tok', 'https://api.example/hook'),
    ).resolves.toBeUndefined()

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(500, { message: 'down' }))
    await expect(
      ensureTiendanubeOrderPaidWebhook('817495', 'tok', 'https://api.example/hook'),
    ).rejects.toBeInstanceOf(TiendanubeApiError)
  })

  it('exchanges authorization code and fetches store profile', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(200, { access_token: 'tok', token_type: 'bearer', user_id: 817495 }),
    )
    await expect(
      exchangeTiendanubeAuthorizationCode(
        {
          clientId: 'app',
          clientSecret: 'sec',
          redirectUri: 'https://example.com/cb',
        },
        'code-1',
      ),
    ).resolves.toMatchObject({ access_token: 'tok', user_id: 817495 })

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(401, {}))
    await expect(
      exchangeTiendanubeAuthorizationCode(
        {
          clientId: 'app',
          clientSecret: 'sec',
          redirectUri: 'https://example.com/cb',
        },
        'bad',
      ),
    ).rejects.toMatchObject({ status: 401 })

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, {}))
    await expect(
      exchangeTiendanubeAuthorizationCode(
        {
          clientId: 'app',
          clientSecret: 'sec',
          redirectUri: 'https://example.com/cb',
        },
        'incomplete',
      ),
    ).rejects.toMatchObject({ status: 502 })

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(200, { name: 'Demo Store' }))
    await expect(fetchTiendanubeStore('817495', 'tok')).resolves.toEqual({ name: 'Demo Store' })

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(403, {}))
    await expect(fetchTiendanubeStore('817495', 'bad')).rejects.toMatchObject({ status: 403 })
  })
})
