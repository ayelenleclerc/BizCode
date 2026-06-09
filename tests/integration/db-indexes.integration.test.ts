/**
 * PostgreSQL index presence for tenant-scoped listings and FK filters (issue #89).
 * Requires DATABASE_URL and applied migrations (`prisma migrate deploy`).
 */
import 'dotenv/config'
import { Prisma, PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const TENANT_SCOPED_INDEXES = [
  'Cliente_tenantId_codigo_idx',
  'Articulo_tenantId_codigo_idx',
  'Articulo_tenantId_rubroId_idx',
  'Factura_tenantId_fecha_idx',
  'Factura_tenantId_estado_fecha_idx',
  'Factura_tenantId_clienteId_idx',
] as const

describe('DB — índices tenant-scoped (issue #89)', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error(
        'DATABASE_URL no está definida. Para pruebas locales: configura .env o exporta DATABASE_URL apuntando a tu PostgreSQL.',
      )
    }
    prisma = new PrismaClient()
    await prisma.$connect()
    await prisma.tenant.upsert({
      where: { id: 1 },
      create: { id: 1, name: 'Integration tenant', slug: 'integration-tenant-1', active: true },
      update: { active: true },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('pg_indexes incluye índices tenant-scoped de listados y FK', async () => {
    const rows = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname IN (${Prisma.join(TENANT_SCOPED_INDEXES)})
    `
    const found = new Set(rows.map((row) => row.indexname))
    for (const indexName of TENANT_SCOPED_INDEXES) {
      expect(found.has(indexName)).toBe(true)
    }
  })
})
