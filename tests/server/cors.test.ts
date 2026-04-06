import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp, getCorsAllowedOrigins, parseCorsOriginsFromEnv } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(0) },
    tenant: { findUnique: vi.fn() },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  } as unknown as PrismaClient
}

describe('CORS (credentialed SPA)', () => {
  let prevCors: string | undefined

  beforeEach(() => {
    prevCors = process.env.CORS_ORIGINS
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.CORS_ORIGINS
  })

  afterEach(() => {
    if (prevCors === undefined) {
      delete process.env.CORS_ORIGINS
    } else {
      process.env.CORS_ORIGINS = prevCors
    }
  })

  it('reflects allowed Origin and sets credentials for localhost:5173', async () => {
    const app = createApp(buildPrismaMock())
    const origin = 'http://localhost:5173'
    const res = await request(app).options('/api/health').set('Origin', origin).set('Access-Control-Request-Method', 'GET')
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('reflects 127.0.0.1:5173', async () => {
    const app = createApp(buildPrismaMock())
    const origin = 'http://127.0.0.1:5173'
    const res = await request(app).get('/api/health').set('Origin', origin)
    expect(res.headers['access-control-allow-origin']).toBe(origin)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
  })

  it('does not allow arbitrary origins', async () => {
    const app = createApp(buildPrismaMock())
    const origin = 'https://evil.example'
    const res = await request(app).get('/api/health').set('Origin', origin)
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('merges CORS_ORIGINS from env', async () => {
    process.env.CORS_ORIGINS = ' https://app.example ,https://staging.example'
    const origins = getCorsAllowedOrigins()
    expect(origins.has('https://app.example')).toBe(true)
    expect(origins.has('https://staging.example')).toBe(true)
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health').set('Origin', 'https://app.example')
    expect(res.headers['access-control-allow-origin']).toBe('https://app.example')
  })
})

describe('parseCorsOriginsFromEnv', () => {
  let prevCors: string | undefined

  beforeEach(() => {
    prevCors = process.env.CORS_ORIGINS
  })

  afterEach(() => {
    if (prevCors === undefined) {
      delete process.env.CORS_ORIGINS
    } else {
      process.env.CORS_ORIGINS = prevCors
    }
  })

  it('returns empty when unset', () => {
    delete process.env.CORS_ORIGINS
    expect(parseCorsOriginsFromEnv()).toEqual([])
  })

  it('trims and drops empty segments', () => {
    process.env.CORS_ORIGINS = ' https://a.test , ,https://b.test'
    expect(parseCorsOriginsFromEnv()).toEqual(['https://a.test', 'https://b.test'])
  })
})
