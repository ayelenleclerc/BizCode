import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { DBFFile } from 'dbffile'
import type { PrismaClient } from '@prisma/client'
import { runDbfMigration } from '../../scripts/migrate-from-dbf'

export async function truncateMigrationTables(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.facturaItem.deleteMany(),
    prisma.factura.deleteMany(),
    prisma.articulo.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.rubro.deleteMany(),
  ])
}

export async function ensureMigrationTenant(prisma: PrismaClient, slug: string): Promise<number> {
  const tenant = await prisma.tenant.upsert({
    where: { slug },
    create: { name: `DBF migration ${slug}`, slug, active: true },
    update: {},
  })
  process.env.BIZCODE_MIGRATION_TENANT_ID = String(tenant.id)
  return tenant.id
}

export async function createTempDbfRoot(): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-dbf-'))
}

export async function writeProductFixtureTree(root: string): Promise<void> {
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
}

export async function runMigrationFromRoot(root: string): Promise<void> {
  process.env.PROGRAMA_VIEJO_ROOT = root
  await runDbfMigration()
}

export async function countPlaceholderClients(prisma: PrismaClient, tenantId: number): Promise<number> {
  return prisma.cliente.count({
    where: { tenantId, codigo: { gte: 91001, lte: 91010 } },
  })
}

export async function cleanupTempDbfRoot(root: string): Promise<void> {
  await fs.rm(root, { recursive: true, force: true })
}
