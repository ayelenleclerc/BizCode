/**
 * @en Mercado Libre OAuth API tests with mocked token endpoint (#183).
 * @es Tests API OAuth Mercado Libre con mock del endpoint de tokens (#183).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'
import { signMeliOAuthState } from '../../apps/server/integrations/meli/meliOAuthState'

vi.mock('../../apps/server/integrations/meli/meliOAuthClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../apps/server/integrations/meli/meliOAuthClient')>()
  return {
    ...actual,
    exchangeMeliAuthorizationCode: vi.fn(),
    refreshMeliAccessToken: vi.fn(),
    fetchMeliUserMe: vi.fn(),
    revokeMeliApplication: vi.fn(),
  }
})

import {
  exchangeMeliAuthorizationCode,
  fetchMeliUserMe,
  revokeMeliApplication,
} from '../../apps/server/integrations/meli/meliOAuthClient'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        businessType: 'mayorista',
        rubros: [],
        plan: 'pro',
        modules: [],
        integrations: ['meli'],
        updatedAt: new Date(),
      }),
    },
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Libre OAuth API (#183)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-meli-oauth'
    process.env.MELI_CLIENT_ID = 'meli-app-id'
    process.env.MELI_CLIENT_SECRET = 'meli-app-secret'
    process.env.MELI_REDIRECT_URI = 'http://localhost:3001/api/oauth/meli/callback'
    process.env.PORTAL_PUBLIC_URL = 'http://localhost:5173'
    clearTenantFeaturesCache()
    vi.mocked(exchangeMeliAuthorizationCode).mockReset()
    vi.mocked(fetchMeliUserMe).mockReset()
    vi.mocked(revokeMeliApplication).mockReset()
  })

  it('GET /api/configuracion/meli returns connected:false without tokens', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/meli').expect(200)
    expect(res.body).toEqual({ success: true, data: { connected: false } })
    expect(JSON.stringify(res.body)).not.toMatch(/access_token|refresh_token|accessTokenEncrypted/i)
  })

  it('GET /api/configuracion/meli returns metadata without secrets when connected', async () => {
    const app = createApp(
      buildPrismaMock({
        meliConfig: {
          findUnique: vi.fn().mockResolvedValue({
            meliUserId: '12345',
            sellerId: '12345',
            sitio: 'MLA',
            nickname: 'SELLER_TEST',
            tokenExpiresAt: new Date('2026-08-01T18:00:00.000Z'),
            accessTokenLast4: '7890',
            activo: true,
            conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
          }),
          upsert: vi.fn(),
          deleteMany: vi.fn(),
          findMany: vi.fn(),
        },
      }),
    )
    const res = await request(app).get('/api/configuracion/meli').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.connected).toBe(true)
    expect(res.body.data.accessTokenLast4).toBe('7890')
    expect(res.body.data.nickname).toBe('SELLER_TEST')
    expect(JSON.stringify(res.body)).not.toMatch(/encrypt|Bearer |APP_USR/i)
  })

  it('GET /api/oauth/meli/authorize returns authorizationUrl', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/oauth/meli/authorize').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.authorizationUrl).toContain('auth.mercadolibre.com.ar')
    expect(res.body.data.authorizationUrl).toContain('client_id=meli-app-id')
    expect(res.body.data.authorizationUrl).toContain('state=')
  })

  it('GET /api/oauth/meli/authorize returns 403 when integration disabled', async () => {
    const app = createApp(
      buildPrismaMock({
        tenantConfig: {
          findUnique: vi.fn().mockResolvedValue({
            tenantId: 1,
            businessType: 'mayorista',
            rubros: [],
            plan: 'pro',
            modules: [],
            integrations: [],
            updatedAt: new Date(),
          }),
        },
      }),
    )
    const res = await request(app).get('/api/oauth/meli/authorize').expect(403)
    expect(res.body.integration).toBe('meli')
  })

  it('GET /api/oauth/meli/callback exchanges code and redirects', async () => {
    const upsert = vi.fn().mockResolvedValue({})
    const app = createApp(
      buildPrismaMock({
        meliConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          upsert,
          deleteMany: vi.fn(),
          findMany: vi.fn(),
        },
      }),
    )
    vi.mocked(exchangeMeliAuthorizationCode).mockResolvedValue({
      access_token: 'ACCESS-TOKEN-7890',
      token_type: 'bearer',
      expires_in: 21600,
      user_id: 12345,
      refresh_token: 'REFRESH-TOKEN-SECRET',
    })
    vi.mocked(fetchMeliUserMe).mockResolvedValue({
      id: 12345,
      nickname: 'SELLER_TEST',
      site_id: 'MLA',
    })

    const state = signMeliOAuthState(1, 1)
    const res = await request(app)
      .get('/api/oauth/meli/callback')
      .query({ code: 'auth-code', state })
      .expect(302)

    expect(res.headers.location).toBe('http://localhost:5173/configuracion?meli=connected')
    expect(exchangeMeliAuthorizationCode).toHaveBeenCalledOnce()
    expect(upsert).toHaveBeenCalledOnce()
    const upsertArgs = upsert.mock.calls[0][0] as {
      create: { accessTokenEncrypted: string; refreshTokenEncrypted: string }
    }
    expect(upsertArgs.create.accessTokenEncrypted).not.toContain('ACCESS-TOKEN')
    expect(upsertArgs.create.refreshTokenEncrypted).not.toContain('REFRESH-TOKEN')
  })

  it('POST /api/oauth/meli/disconnect revokes and deletes local config', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const app = createApp(
      buildPrismaMock({
        meliConfig: {
          findUnique: vi.fn().mockResolvedValue({
            meliUserId: '12345',
            accessTokenEncrypted: encryptFiscalSecret('ACCESS-TOKEN-7890'),
            refreshTokenEncrypted: encryptFiscalSecret('REFRESH-TOKEN-SECRET'),
            accessTokenLast4: '7890',
            sellerId: '12345',
            sitio: 'MLA',
            nickname: 'SELLER_TEST',
            tokenExpiresAt: new Date(Date.now() + 3600_000),
            activo: true,
            conectadoAt: new Date(),
          }),
          upsert: vi.fn(),
          deleteMany,
          findMany: vi.fn(),
        },
      }),
    )
    vi.mocked(revokeMeliApplication).mockResolvedValue(undefined)

    const res = await request(app).post('/api/oauth/meli/disconnect').expect(200)
    expect(res.body).toEqual({ success: true, data: { disconnected: true } })
    expect(revokeMeliApplication).toHaveBeenCalledOnce()
    expect(deleteMany).toHaveBeenCalledOnce()
  })
})
