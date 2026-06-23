import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { DBFFile } from 'dbffile'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const rubroRow = { id: 1, codigo: 7, nombre: 'DBF Rubro' }

async function buildRubrosDbfBuffer(): Promise<Buffer> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bizcode-contract-rubros-'))
  const filePath = path.join(dir, 'RUBROS.DBF')
  try {
    const dbf = await DBFFile.create(filePath, [
      { name: 'COD_RUBRO', type: 'N', size: 5, decimalPlaces: 0 },
      { name: 'NOMBRE', type: 'C', size: 20 },
    ])
    await dbf.appendRecords([{ COD_RUBRO: 7, NOMBRE: 'DBF Rubro' }])
    return await fs.readFile(filePath)
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
}

function buildPrismaForDbfMigrate(): PrismaClient {
  const rubroUpsert = vi.fn().mockResolvedValue(rubroRow)
  const rubroFindUnique = vi.fn().mockResolvedValue(null)
  const articuloUpsert = vi.fn().mockResolvedValue({
    id: 2,
    codigo: 888,
    descripcion: 'DBF Articulo',
    rubroId: 1,
    condIva: '1',
    umedida: 'UN',
    precioLista1: 10,
    precioLista2: 10,
    costo: 5,
    stock: 0,
    minimo: 0,
    activo: true,
  })
  const articuloFindUnique = vi.fn().mockResolvedValue(null)

  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: articuloFindUnique,
      upsert: articuloUpsert,
    },
    rubro: {
      findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 1 }]),
      findUnique: rubroFindUnique,
      upsert: rubroUpsert,
      create: vi.fn(),
    },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
    ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
    notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return fn({
          rubro: { findUnique: rubroFindUnique, upsert: rubroUpsert },
          articulo: { findUnique: articuloFindUnique, upsert: articuloUpsert },
        })
      }
      return fn
    }),
  } as unknown as PrismaClient
}

describe('POST /api/rubros|articulos/migrate-dbf', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('POST /api/rubros/migrate-dbf imports from DBF', async () => {
    const buffer = await buildRubrosDbfBuffer()
    const app = createApp(buildPrismaForDbfMigrate())
    const res = await request(app)
      .post('/api/rubros/migrate-dbf')
      .attach('file', buffer, 'RUBROS.DBF')
      .expect(200)

    await assertMatchesOpenApi('/api/rubros/migrate-dbf', 'post', '200', res.body)
    expect(res.body.data.created).toBe(1)
  })

  it('POST /api/articulos/migrate-dbf returns 403 without settings.business.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaForDbfMigrate())
    const res = await request(app)
      .post('/api/articulos/migrate-dbf')
      .attach('file', Buffer.from(''), 'ARTICULOS.DBF')
      .expect(403)

    expect(res.body.error).toContain('settings.business.manage')
  })
})
