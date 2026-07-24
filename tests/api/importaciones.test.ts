import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), update: vi.fn() },
    proveedor: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), update: vi.fn() },
    rubro: { findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 10 }]) },
    movimientoClienteCC: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn() },
    importJob: {
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        id: 1,
        tenantId: 1,
        entity: data.entity,
        estado: 'ready',
        modo: data.modo ?? 'mejores_esfuerzos',
        duplicateMode: data.duplicateMode ?? 'skip',
        totalRows: data.totalRows ?? 0,
        processedRows: 0,
        okCount: data.okCount ?? 0,
        errorCount: data.errorCount ?? 0,
        duplicateCount: data.duplicateCount ?? 0,
        createdCount: 0,
        updatedCount: 0,
        skippedCount: 0,
        reportJson: data.reportJson ?? null,
        createdById: data.createdById ?? 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        completedAt: null,
      })),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        modules: [
          'platform.data_import',
          'core.clients',
          'core.catalog',
          'core.auth',
          'core.invoicing',
        ],
      }),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: { findFirst: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) =>
      fn(buildPrismaMock(overrides) as PrismaClient),
    ),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Importaciones API (#238)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.BIZCODE_TEST_MODULES =
      'core.auth,core.catalog,core.clients,core.invoicing,platform.data_import'
  })

  it('GET template csv for clientes', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/importaciones/templates/clientes')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/csv/)
    expect(res.text).toContain('codigo')
  })

  it('POST validate dry-run for clientes csv', async () => {
    const app = createApp(buildPrismaMock())
    const csv = Buffer.from(
      'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId\n1001,Demo SA,RI,true,,,,,,,\n',
      'utf8',
    )
    const res = await request(app)
      .post('/api/importaciones/validate')
      .field('entity', 'clientes')
      .field('duplicateMode', 'skip')
      .attach('file', csv, 'clientes.csv')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.totalRows).toBe(1)
  })

  it('returns 403 when module disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/importaciones/templates/clientes')
    expect(res.status).toBe(403)
  })

  it('GET template xlsx for articulos', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/importaciones/templates/articulos?format=xlsx')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/spreadsheetml/)
  })

  it('POST validate without file returns 400', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/importaciones/validate')
      .field('entity', 'clientes')
    expect(res.status).toBe(400)
  })

  it('POST jobs starts async import and GET report works', async () => {
    const prisma = buildPrismaMock({
      importJob: {
        create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          id: 42,
          tenantId: 1,
          entity: data.entity,
          estado: 'ready',
          modo: data.modo ?? 'mejores_esfuerzos',
          duplicateMode: data.duplicateMode ?? 'skip',
          totalRows: data.totalRows ?? 0,
          processedRows: 0,
          okCount: data.okCount ?? 0,
          errorCount: data.errorCount ?? 0,
          duplicateCount: data.duplicateCount ?? 0,
          createdCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          reportJson: data.reportJson ?? { issues: [] },
          createdById: data.createdById ?? 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        })),
        findFirst: vi.fn().mockResolvedValue({
          id: 42,
          tenantId: 1,
          entity: 'clientes',
          estado: 'completed',
          modo: 'mejores_esfuerzos',
          duplicateMode: 'skip',
          totalRows: 1,
          processedRows: 1,
          okCount: 1,
          errorCount: 0,
          duplicateCount: 0,
          createdCount: 1,
          updatedCount: 0,
          skippedCount: 0,
          reportJson: { issues: [], final: { created: 1, updated: 0, skipped: 0, errors: [] } },
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
        }),
        findUnique: vi.fn().mockResolvedValue({
          id: 42,
          tenantId: 1,
          entity: 'clientes',
          estado: 'ready',
          modo: 'mejores_esfuerzos',
          duplicateMode: 'skip',
          totalRows: 1,
          processedRows: 0,
          okCount: 1,
          errorCount: 0,
          duplicateCount: 0,
          createdCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          reportJson: { issues: [] },
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: null,
        }),
        update: vi.fn().mockResolvedValue({
          id: 42,
          tenantId: 1,
          entity: 'clientes',
          estado: 'completed',
          modo: 'mejores_esfuerzos',
          duplicateMode: 'skip',
          totalRows: 1,
          processedRows: 1,
          okCount: 1,
          errorCount: 0,
          duplicateCount: 0,
          createdCount: 1,
          updatedCount: 0,
          skippedCount: 0,
          reportJson: { issues: [] },
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: new Date(),
        }),
      },
    })
    const app = createApp(prisma)
    const csv = Buffer.from(
      'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId\n1001,Demo SA,RI,true,,,,,,,\n',
      'utf8',
    )
    const start = await request(app)
      .post('/api/importaciones/jobs')
      .field('entity', 'clientes')
      .field('modo', 'mejores_esfuerzos')
      .field('duplicateMode', 'skip')
      .attach('file', csv, 'clientes.csv')
    expect(start.status).toBe(201)
    expect(start.body.data.id).toBe(42)

    const job = await request(app).get('/api/importaciones/jobs/42')
    expect(job.status).toBe(200)

    const report = await request(app).get('/api/importaciones/jobs/42/report')
    expect(report.status).toBe(200)
    expect(report.text).toContain('kind,row,code,message')
  })
})
