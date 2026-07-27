import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  cleanupTempDbfRoot,
  countPlaceholderClients,
  createTempDbfRoot,
  ensureMigrationTenant,
  runMigrationFromRoot,
  truncateMigrationTables,
  writeClientesFixtureTree,
  writeProductFixtureTree,
  writeRubrosArticulosFixtureTree,
} from '../helpers/migration-harness'

describe('DBF migration integration', () => {
  let prisma: PrismaClient
  let fixtureRoot: string

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL is required for DBF integration tests')
    }
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    prisma = new PrismaClient()
    await prisma.$connect()
    await ensureMigrationTenant(prisma, 'dbf-migration-test')
    fixtureRoot = await createTempDbfRoot()
    await writeProductFixtureTree(fixtureRoot)
  })

  beforeEach(async () => {
    await truncateMigrationTables(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await cleanupTempDbfRoot(fixtureRoot)
  })

  it('imports placeholder clients and products from generated DBF fixtures', async () => {
    await runMigrationFromRoot(fixtureRoot)

    const tenantId = parseInt(process.env.BIZCODE_MIGRATION_TENANT_ID ?? '0', 10)
    expect(await countPlaceholderClients(prisma, tenantId)).toBe(10)

    const importedProducts = await prisma.articulo.findMany({ where: { tenantId } })
    expect(importedProducts.length).toBeGreaterThan(0)
  })

  it('imports real clients from CLIENTES.DBF and skips invalid COND rows', async () => {
    const clientesRoot = await createTempDbfRoot()
    await writeClientesFixtureTree(clientesRoot)
    await runMigrationFromRoot(clientesRoot)

    const tenantId = parseInt(process.env.BIZCODE_MIGRATION_TENANT_ID ?? '0', 10)
    const imported = await prisma.cliente.findMany({
      where: { tenantId, codigo: { in: [501, 502, 503] } },
      orderBy: { codigo: 'asc' },
    })
    expect(imported).toHaveLength(2)
    expect(imported[0]?.codigo).toBe(501)
    expect(imported[0]?.condIva).toBe('RI')
    expect(imported[0]?.activo).toBe(true)
    expect(imported[1]?.codigo).toBe(502)
    expect(imported[1]?.condIva).toBe('Mono')
    expect(imported[1]?.activo).toBe(false)

    const placeholders = await prisma.cliente.count({
      where: { tenantId, codigo: { gte: 91001, lte: 91010 } },
    })
    expect(placeholders).toBe(0)

    await cleanupTempDbfRoot(clientesRoot)
  })

  it('imports rubros and articulos from RUBROS.DBF and ARTICULOS.DBF with upsert', async () => {
    const catalogRoot = await createTempDbfRoot()
    await writeRubrosArticulosFixtureTree(catalogRoot)
    await runMigrationFromRoot(catalogRoot)

    const tenantId = parseInt(process.env.BIZCODE_MIGRATION_TENANT_ID ?? '0', 10)
    const rubros = await prisma.rubro.findMany({ where: { tenantId }, orderBy: { codigo: 'asc' } })
    expect(rubros.map((r) => r.codigo)).toEqual(expect.arrayContaining([1, 2]))

    const imported = await prisma.articulo.findMany({
      where: { tenantId, codigo: 2001 },
    })
    expect(imported).toHaveLength(1)
    expect(imported[0]?.descripcion).toBe('Detergente 1L')
    // stock is Decimal(14,4) after #203 — compare numeric value, not Object.is identity
    expect(Number(imported[0]?.stock)).toBe(15)

    const rejected = await prisma.articulo.count({ where: { tenantId, codigo: 2002 } })
    expect(rejected).toBe(0)

    await runMigrationFromRoot(catalogRoot)
    const rubroCount = await prisma.rubro.count({ where: { tenantId, codigo: { in: [1, 2] } } })
    expect(rubroCount).toBe(2)

    await cleanupTempDbfRoot(catalogRoot)
  })
})
