/**
 * Verifies tenant-scoped reads do not leak another tenant when ID is enumerated (#75 baseline).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

describe('tenant isolation — GET single resources', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    if (!process.env.DATABASE_URL?.trim()) {
      process.env.DATABASE_URL = 'postgresql://x@localhost:5432/y'
    }
  })

  it('GET /api/clientes/:id returns null data when prisma findFirst resolves null (wrong tenant/id)', async () => {
    const prisma = {
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      deliveryZone: { findFirst: vi.fn() },
      articulo: { findMany: vi.fn().mockResolvedValue([]) },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
      },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        update: vi.fn(),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      appUser: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
      appSession: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    } as unknown as PrismaClient

    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/99999').expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data).toBeNull()
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 99999, tenantId: 1 }) }),
    )
  })
})
