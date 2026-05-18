import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { DEFAULT_MODULES } from '../../src/lib/modules'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(): PrismaClient {
  return {
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        businessType: 'ambos',
        rubros: [],
        plan: 'starter',
        modules: [...DEFAULT_MODULES, 'billing.orders'],
        integrations: [],
        updatedAt: new Date(),
      }),
    },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
  } as unknown as PrismaClient
}

describe('GET /api/me/features', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('returns 401 without session bypass disabled', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/me/features')
    expect(res.status).toBe(401)
  })

  it('returns tenant modules', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/me/features')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/me/features', 'get', '200', res.body)
    expect(res.body.data.modules).toContain('billing.orders')
  })
})
