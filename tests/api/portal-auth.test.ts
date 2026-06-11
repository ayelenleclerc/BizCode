import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/createApp'
import { initializeAppConfig, resetAppConfigCache } from '../../server/config/env'
import {
  createPortalMagicToken,
  createPortalPrismaMock,
  hashPortalTestToken,
  PORTAL_TEST_JWT_SECRET,
  PORTAL_TEST_TENANT_SLUG,
} from '../helpers/portalPrismaMock'

vi.mock('../../server/channels', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/channels')>()
  return {
    ...actual,
    sendPortalMagicLinkEmail: vi.fn().mockResolvedValue(undefined),
  }
})

describe('Portal auth endpoints', () => {
  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = PORTAL_TEST_JWT_SECRET
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    process.env.BIZCODE_TEST_PORTAL_CLIENTE_ID = ''
    initializeAppConfig()
  })

  it('returns generic success for magic-link request', async () => {
    const prisma = createPortalPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .post(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/auth/magic-link`)
      .send({ email: 'cliente@example.com' })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.sent).toBe(true)
  })

  it('returns generic success for unknown email (anti-enumeration)', async () => {
    const prisma = createPortalPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .post(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/auth/magic-link`)
      .send({ email: 'unknown@example.com' })
    expect(res.status).toBe(200)
    expect(res.body.data.sent).toBe(true)
  })

  it('verifies magic link and sets portal session cookie', async () => {
    const prisma = createPortalPrismaMock()
    const token = createPortalMagicToken()
    const tokenHash = hashPortalTestToken(token)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await prisma.portalMagicLink.create({
      data: {
        tenantId: 1,
        clienteId: 10,
        tokenHash,
        expiresAt,
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/auth/verify`)
      .query({ token })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.me.rsocial).toBe('Cliente A SA')
    expect(res.headers['set-cookie']?.[0]).toMatch(/bizcode_portal_session=/)
  })

  it('rejects expired magic link token', async () => {
    const prisma = createPortalPrismaMock()
    const token = createPortalMagicToken()
    const tokenHash = hashPortalTestToken(token)
    await prisma.portalMagicLink.create({
      data: {
        tenantId: 1,
        clienteId: 10,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/auth/verify`)
      .query({ token })
    expect(res.status).toBe(401)
  })

  it('returns me for authenticated portal session bypass', async () => {
    process.env.BIZCODE_TEST_PORTAL_CLIENTE_ID = '10'
    const prisma = createPortalPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/me`)
    expect(res.status).toBe(200)
    expect(res.body.data.me.clienteId).toBe(10)
    expect(res.body.data.branding.tenantSlug).toBe(PORTAL_TEST_TENANT_SLUG)
  })
})
