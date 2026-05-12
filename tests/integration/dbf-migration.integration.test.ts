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
  writeProductFixtureTree,
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
})
