/**
 * @en Tiendanube OAuth API tests with mocked token exchange (#187).
 * @es Tests API OAuth Tiendanube con mock del intercambio de tokens (#187).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'
import { signTiendanubeOAuthState } from '../../apps/server/integrations/tiendanube/tiendanubeOAuthState'

vi.mock('../../apps/server/integrations/tiendanube/tiendanubeOAuthClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../apps/server/integrations/tiendanube/tiendanubeOAuthClient')
    >()
  return {
    ...actual,
    exchangeTiendanubeAuthorizationCode: vi.fn(),
    fetchTiendanubeStore: vi.fn(),
  }
})

vi.mock('../../apps/server/integrations/tiendanube/tiendanubeApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../apps/server/integrations/tiendanube/tiendanubeApiClient')
    >()
  return {
    ...actual,
    ensureTiendanubeOrderPaidWebhook: vi.fn().mockResolvedValue(undefined),
  }
})

import {
  exchangeTiendanubeAuthorizationCode,
  fetchTiendanubeStore,
} from '../../apps/server/integrations/tiendanube/tiendanubeOAuthClient'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }),
    },
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
        integrations: ['tiendanube'],
        updatedAt: new Date(),
      }),
    },
    tiendanubeConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Tiendanube OAuth API (#187)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-tn-oauth'
    process.env.TIENDANUBE_CLIENT_ID = 'tn-app-id'
    process.env.TIENDANUBE_CLIENT_SECRET = 'tn-app-secret'
    process.env.TIENDANUBE_REDIRECT_URI = 'http://localhost:3001/api/oauth/tiendanube/callback'
    process.env.PORTAL_PUBLIC_URL = 'http://localhost:5173'
    clearTenantFeaturesCache()
    vi.mocked(exchangeTiendanubeAuthorizationCode).mockReset()
    vi.mocked(fetchTiendanubeStore).mockReset()
  })

  it('GET /api/configuracion/tiendanube returns connected:false without tokens', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/tiendanube').expect(200)
    expect(res.body).toEqual({ success: true, data: { connected: false } })
    expect(JSON.stringify(res.body)).not.toMatch(/access_token|accessTokenEncrypted/i)
  })

  it('GET /api/oauth/tiendanube/authorize returns authorizationUrl', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/oauth/tiendanube/authorize').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.authorizationUrl).toContain('tiendanube.com/apps/tn-app-id/authorize')
    expect(res.body.data.authorizationUrl).toContain('state=')
  })

  it('GET /api/oauth/tiendanube/authorize returns 403 when integration disabled', async () => {
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
    await request(app).get('/api/oauth/tiendanube/authorize').expect(403)
  })

  it('GET /api/oauth/tiendanube/callback persists tokens and redirects', async () => {
    vi.mocked(exchangeTiendanubeAuthorizationCode).mockResolvedValue({
      access_token: 'tn-access-token-abcdef',
      token_type: 'bearer',
      scope: 'write_products',
      user_id: 817495,
    })
    vi.mocked(fetchTiendanubeStore).mockResolvedValue({
      id: 817495,
      name: 'Demo Store',
      url_with_protocol: 'https://demo.mitiendanube.com',
    })
    const upsert = vi.fn().mockResolvedValue({})
    const app = createApp(
      buildPrismaMock({
        tiendanubeConfig: {
          findUnique: vi.fn().mockResolvedValue(null),
          upsert,
          deleteMany: vi.fn(),
          findMany: vi.fn(),
        },
      }),
    )
    const state = signTiendanubeOAuthState(1, 1)
    const res = await request(app)
      .get('/api/oauth/tiendanube/callback')
      .query({ code: 'auth-code', state })
      .expect(302)
    expect(res.headers.location).toContain('tiendanube=connected')
    expect(upsert).toHaveBeenCalled()
  })
})
