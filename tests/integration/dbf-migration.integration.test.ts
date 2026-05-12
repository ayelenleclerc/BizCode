import 'dotenv/config'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { DBFFile } from 'dbffile'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { runDbfMigration } from '../../scripts/migrate-from-dbf'

async function truncateMigrationTables(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.facturaItem.deleteMany(),
    prisma.factura.deleteMany(),
    prisma.articulo.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.rubro.deleteMany(),
  ])
}

async function createFixtureDbfTree(root: string, options?: { includeClientes?: boolean }): Promise<void> {
  const sistema = path.join(root, '16-07-2025 completa', 'sistema')
  await fs.mkdir(sistema, { recursive: true })

  const pvar = await DBFFile.create(path.join(sistema, 'PVAR.DBF'), [
    { name: 'CODIG', type: 'N', size: 10, decimalPlaces: 0 },
    { name: 'DESCR', type: 'C', size: 30 },
  ])
  await pvar.appendRecords([
    { CODIG: 1001, DESCR: 'Arroz' },
    { CODIG: 1002, DESCR: 'Yerba' },
  ])

  const pvar2 = await DBFFile.create(path.join(sistema, 'PVAR2.DBF'), [
    { name: 'ARTIC', type: 'N', size: 10, decimalPlaces: 0 },
    { name: 'IMPORTE', type: 'N', size: 14, decimalPlaces: 2 },
    { name: 'COSTO_N', type: 'N', size: 14, decimalPlaces: 2 },
    { name: 'IVA', type: 'N', size: 6, decimalPlaces: 2 },
    { name: 'CAJA', type: 'N', size: 10, decimalPlaces: 0 },
    { name: 'UNID', type: 'N', size: 10, decimalPlaces: 0 },
  ])
  await pvar2.appendRecords([
    { ARTIC: 1001, IMPORTE: 150, COSTO_N: 120, IVA: 21, CAJA: 3, UNID: 2 },
    { ARTIC: 1002, IMPORTE: 80, COSTO_N: 60, IVA: 10.5, CAJA: 1, UNID: 5 },
  ])

  const listCli = await DBFFile.create(path.join(sistema, 'LIST_CLI.DBF'), [
    { name: 'FIELD_NAME', type: 'C', size: 40 },
    { name: 'FIELD_TYPE', type: 'C', size: 10 },
  ])
  await listCli.appendRecords([{ FIELD_NAME: 'RSOCIAL', FIELD_TYPE: 'C' }])

  if (options?.includeClientes) {
    const clientes = await DBFFile.create(path.join(sistema, 'CLIENTES.DBF'), [
      { name: 'CODIG', type: 'N', size: 5, decimalPlaces: 0 },
      { name: 'RSOCIAL', type: 'C', size: 30 },
      { name: 'COND', type: 'C', size: 1 },
      { name: 'BAJA', type: 'L', size: 1 },
      { name: 'CREDITO', type: 'N', size: 12, decimalPlaces: 2 },
    ])
    await clientes.appendRecords([
      { CODIG: 501, RSOCIAL: 'Cliente DBF Uno', COND: 'I', BAJA: false, CREDITO: 1000 },
      { CODIG: 502, RSOCIAL: 'Cliente DBF Dos', COND: 'M', BAJA: true, CREDITO: 0 },
      { CODIG: 503, RSOCIAL: 'Cliente DBF Tres', COND: 'Z', BAJA: false, CREDITO: 0 },
    ])
  }
}

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
    const t = await prisma.tenant.upsert({
      where: { slug: 'dbf-migration-test' },
      create: { name: 'DBF migration test', slug: 'dbf-migration-test', active: true },
      update: {},
    })
    process.env.BIZCODE_MIGRATION_TENANT_ID = String(t.id)
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-dbf-'))
    await createFixtureDbfTree(fixtureRoot)
  })

  beforeEach(async () => {
    await truncateMigrationTables(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await fs.rm(fixtureRoot, { recursive: true, force: true })
  })

  it('imports placeholder clients and products from generated DBF fixtures', async () => {
    process.env.PROGRAMA_VIEJO_ROOT = fixtureRoot
    await runDbfMigration()

    const tenantId = parseInt(process.env.BIZCODE_MIGRATION_TENANT_ID ?? '0', 10)
    const placeholders = await prisma.cliente.findMany({
      where: { tenantId, codigo: { gte: 91001, lte: 91010 } },
    })
    expect(placeholders).toHaveLength(10)

    const importedProducts = await prisma.articulo.findMany({ where: { tenantId } })
    expect(importedProducts.length).toBeGreaterThan(0)
  })

  it('imports real clients from CLIENTES.DBF and skips invalid COND rows', async () => {
    const clientesRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-dbf-clientes-'))
    await createFixtureDbfTree(clientesRoot, { includeClientes: true })
    process.env.PROGRAMA_VIEJO_ROOT = clientesRoot
    await runDbfMigration()

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

    await fs.rm(clientesRoot, { recursive: true, force: true })
  })
})

