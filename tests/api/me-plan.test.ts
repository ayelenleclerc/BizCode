import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../../server/createApp'
import { buildPrismaMock } from './me-features.test'
import { assertMatchesOpenApi } from './validate-openapi-response'

describe('GET /api/me/plan', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns tenant plan snapshot', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/me/plan')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/me/plan', 'get', '200', res.body)
    expect(res.body.data.planKey).toBe('starter')
    expect(res.body.data.usage).toHaveProperty('usersUsed')
  })
})
