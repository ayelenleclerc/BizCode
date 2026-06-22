import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(): PrismaClient {
  return {
    plan: {
      findMany: vi.fn().mockResolvedValue([
        {
          key: 'starter',
          name: 'Starter',
          monthlyPrice: 0,
          currency: 'ARS',
          maxUsers: 3,
          maxInvoicesPerMonth: 100,
          features: [],
          active: true,
        },
      ]),
    },
    appSession: { findFirst: vi.fn().mockResolvedValue(null) },
  } as unknown as PrismaClient
}

describe('GET /api/planes', () => {
  it('returns plan catalog without auth', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/planes')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data[0].key).toBe('starter')
    await assertMatchesOpenApi('/api/planes', 'get', '200', res.body)
  })
})
