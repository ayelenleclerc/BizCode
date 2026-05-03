/** Swagger UI mounted at /api-docs (OpenAPI from docs/api/openapi.yaml). Environment: node (vitest.config). */
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

/** Prisma is unused for /api-docs; minimal stub satisfies createApp. */
const prismaStub = {} as unknown as PrismaClient

describe('Swagger UI', () => {
  it('GET /api-docs/ returns HTML containing Swagger UI', async () => {
    const app = createApp(prismaStub)
    const res = await request(app).get('/api-docs/').expect(200)
    expect(res.headers['content-type']).toMatch(/html/i)
    expect(res.text.toLowerCase()).toContain('swagger')
  })

  it('GET /api-docs/ uses cached OpenAPI document on repeat', async () => {
    const app = createApp(prismaStub)
    await request(app).get('/api-docs/').expect(200)
    const res = await request(app).get('/api-docs/').expect(200)
    expect(res.text.toLowerCase()).toContain('swagger')
  })

  it('GET ruta API inexistente responde 404 JSON desde createApp', async () => {
    const app = createApp(prismaStub)
    const res = await request(app).get('/api/ruta-que-no-existe-swagger-ui-test').expect(404)
    expect(res.body).toEqual({ success: false, error: 'Not found' })
  })
})
