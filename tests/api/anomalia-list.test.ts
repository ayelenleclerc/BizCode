import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const NOW = new Date('2026-11-12T12:00:00.000Z')

const ROW = {
  id: 7,
  tenantId: 1,
  tipo: 'monto_inusual',
  severidad: 'warning',
  facturaId: 42,
  clienteId: 3,
  descripcion: 'Z-score high',
  detalle: { z: 3.5 },
  confirmada: false,
  createdAt: NOW,
}

describe('GET /api/anomalias (#200 residual panel)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns 403 for seller without audit.read', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const prisma = {
      anomaliaDetectada: { count: vi.fn(), findMany: vi.fn() },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma)).get('/api/anomalias')
    expect(res.status).toBe(403)
    expect(String(res.body.error)).toContain('audit.read')
    await assertMatchesOpenApi('/api/anomalias', 'get', '403', res.body)
  })

  it('lists paginated anomalies for auditor', async () => {
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    const count = vi.fn().mockResolvedValue(1)
    const findMany = vi.fn().mockResolvedValue([ROW])
    const prisma = {
      anomaliaDetectada: { count, findMany },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma)).get('/api/anomalias').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.total).toBe(1)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].tipo).toBe('monto_inusual')
    expect(res.body.data[0].createdAt).toBe(NOW.toISOString())
    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 1 }) }),
    )
    await assertMatchesOpenApi('/api/anomalias', 'get', '200', res.body)
  })

  it('applies tipo, confirmada, clienteId and facturaId filters', async () => {
    const count = vi.fn().mockResolvedValue(0)
    const findMany = vi.fn().mockResolvedValue([])
    const prisma = {
      anomaliaDetectada: { count, findMany },
    } as unknown as PrismaClient
    const res = await request(createApp(prisma))
      .get('/api/anomalias')
      .query({
        tipo: 'descuento_excesivo',
        confirmada: 'true',
        clienteId: '9',
        facturaId: '11',
        limit: '10',
        offset: '0',
      })
      .expect(200)
    expect(count).toHaveBeenCalledWith({
      where: {
        tenantId: 1,
        tipo: 'descuento_excesivo',
        confirmada: true,
        clienteId: 9,
        facturaId: 11,
      },
    })
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 1,
          tipo: 'descuento_excesivo',
          confirmada: true,
          clienteId: 9,
          facturaId: 11,
        },
        take: 10,
        skip: 0,
      }),
    )
    await assertMatchesOpenApi('/api/anomalias', 'get', '200', res.body)
  })
})
