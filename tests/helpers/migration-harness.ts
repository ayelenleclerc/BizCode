import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { DBFFile } from 'dbffile'
import type { PrismaClient } from '@prisma/client'
import { runDbfMigration } from '../../scripts/migrate-from-dbf'

export async function truncateMigrationTables(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.repartoItem.deleteMany(),
    prisma.reparto.deleteMany(),
    prisma.ordenEntrega.deleteMany(),
    prisma.facturaItem.deleteMany(),
    prisma.pedido.deleteMany(),
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

export async function writeRubrosArticulosFixtureTree(root: string): Promise<void> {
  await writeProductFixtureTree(root)
  const sistema = path.join(root, '16-07-2025 completa', 'sistema')

  const rubros = await DBFFile.create(path.join(sistema, 'RUBROS.DBF'), [
    { name: 'COD_RUBRO', type: 'N', size: 5, decimalPlaces: 0 },
    { name: 'NOMBRE', type: 'C', size: 20 },
  ])
  await rubros.appendRecords([
    { COD_RUBRO: 1, NOMBRE: 'General' },
    { COD_RUBRO: 2, NOMBRE: 'Limpieza' },
  ])

  const articulos = await DBFFile.create(path.join(sistema, 'ARTICULOS.DBF'), [
    { name: 'COD_ART', type: 'N', size: 8, decimalPlaces: 0 },
    { name: 'DESCRIP', type: 'C', size: 30 },
    { name: 'COD_RUBRO', type: 'N', size: 5, decimalPlaces: 0 },
    { name: 'COND_IVA', type: 'N', size: 1, decimalPlaces: 0 },
    { name: 'UMEDIDA', type: 'C', size: 6 },
    { name: 'PRECIO1', type: 'N', size: 12, decimalPlaces: 2 },
    { name: 'PRECIO2', type: 'N', size: 12, decimalPlaces: 2 },
    { name: 'COSTO', type: 'N', size: 12, decimalPlaces: 2 },
    { name: 'STOCK', type: 'N', size: 8, decimalPlaces: 0 },
    { name: 'STOCK_MIN', type: 'N', size: 8, decimalPlaces: 0 },
    { name: 'ACTIVO', type: 'L', size: 1 },
  ])
  await articulos.appendRecords([
    {
      COD_ART: 2001,
      DESCRIP: 'Detergente 1L',
      COD_RUBRO: 2,
      COND_IVA: 1,
      UMEDIDA: 'UN',
      PRECIO1: 120,
      PRECIO2: 115,
      COSTO: 80,
      STOCK: 15,
      STOCK_MIN: 2,
      ACTIVO: true,
    },
    {
      COD_ART: 2002,
      DESCRIP: 'Articulo rubro invalido',
      COD_RUBRO: 99,
      COND_IVA: 2,
      UMEDIDA: 'UN',
      PRECIO1: 50,
      PRECIO2: 50,
      COSTO: 30,
      STOCK: 1,
      STOCK_MIN: 0,
      ACTIVO: true,
    },
  ])
}

export async function writeClientesFixtureTree(root: string): Promise<void> {
  await writeProductFixtureTree(root)

  const sistema = path.join(root, '16-07-2025 completa', 'sistema')
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
