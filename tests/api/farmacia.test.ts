/**
 * @en API tests for the pharmacy vertical endpoints (#204).
 * @es Tests API de los endpoints del vertical farmacia (#204).
 * @pt-BR Testes API dos endpoints do vertical farmácia (#204).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

const PHARMACY_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing,inventory.stock,inventory.fefo,inventory.lots,vertical.pharmacy'

function buildPrismaMock(): PrismaClient {
  return {
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    factura: { findFirst: vi.fn().mockResolvedValue({ id: 31 }) },
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 4 }) },
    articulo: { findFirst: vi.fn().mockResolvedValue({ id: 5, esPsicotropico: true }) },
    lote: {
      findFirst: vi.fn().mockResolvedValue({ id: 8 }),
      update: vi.fn().mockResolvedValue({ id: 8, serialUnidad: 'AB-1', codigoDatamatrix: null }),
    },
    recetaDispensacion: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    libroPsicotropicoMovimiento: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
  } as unknown as PrismaClient
}

const recetaRow = {
  id: 1,
  tenantId: 1,
  facturaId: null,
  clienteId: null,
  numeroReceta: 'R-1',
  medicoNombre: 'Dra. Ana Pérez',
  matricula: 'MN 1',
  fechaReceta: new Date('2026-08-28T00:00:00.000Z'),
  observaciones: null,
  createdAt: new Date('2026-08-28T10:00:00.000Z'),
  updatedAt: new Date('2026-08-28T10:00:00.000Z'),
  cliente: null,
}

const libroRow = {
  id: 2,
  tenantId: 1,
  articuloId: 5,
  loteId: null,
  recetaId: null,
  tipo: 'ingreso',
  cantidad: new Prisma.Decimal(3),
  referencia: 'compra:9',
  observaciones: null,
  createdAt: new Date('2026-08-28T10:00:00.000Z'),
  articulo: { id: 5, codigo: 900, descripcion: 'Clonazepam 2mg' },
  lote: null,
}

const validRecetaBody = {
  numeroReceta: 'R-1',
  medicoNombre: 'Dra. Ana Pérez',
  matricula: 'MN 1',
  fechaReceta: '2026-08-28',
}

describe('pharmacy vertical REST endpoints (#204)', () => {
  const previousModules = process.env.BIZCODE_TEST_MODULES
  let prisma: PrismaClient

  beforeEach(() => {
    process.env.BIZCODE_TEST_MODULES = PHARMACY_MODULES
    prisma = buildPrismaMock()
  })

  afterEach(() => {
    if (previousModules === undefined) delete process.env.BIZCODE_TEST_MODULES
    else process.env.BIZCODE_TEST_MODULES = previousModules
    vi.restoreAllMocks()
  })

  describe('module gate', () => {
    it('returns 403 module_not_enabled when vertical.pharmacy is off', async () => {
      process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
      const app = createApp(prisma)
      const res = await request(app).get('/api/farmacia/recetas').expect(403)
      expect(res.body).toMatchObject({ error: 'module_not_enabled', module: 'vertical.pharmacy' })
    })
  })

  describe('GET /api/farmacia/recetas', () => {
    it('lists prescriptions serialized as ISO strings', async () => {
      vi.mocked(prisma.recetaDispensacion.findMany).mockResolvedValueOnce([recetaRow] as never)
      const app = createApp(prisma)
      const res = await request(app).get('/api/farmacia/recetas').expect(200)
      expect(res.body.data).toHaveLength(1)
      expect(res.body.data[0]).toMatchObject({
        id: 1,
        numeroReceta: 'R-1',
        fechaReceta: '2026-08-28',
      })
    })

    it('rejects a malformed date filter with 400', async () => {
      const app = createApp(prisma)
      await request(app).get('/api/farmacia/recetas?desde=28-08-2026').expect(400)
    })
  })

  describe('GET /api/farmacia/recetas/:id', () => {
    it('returns 404 when the prescription does not belong to the tenant', async () => {
      const app = createApp(prisma)
      const res = await request(app).get('/api/farmacia/recetas/99').expect(404)
      expect(res.body).toMatchObject({ success: false, error: 'Receta not found' })
    })

    it('returns the prescription when found', async () => {
      vi.mocked(prisma.recetaDispensacion.findFirst).mockResolvedValueOnce(recetaRow as never)
      const app = createApp(prisma)
      const res = await request(app).get('/api/farmacia/recetas/1').expect(200)
      expect(res.body.data).toMatchObject({ id: 1, matricula: 'MN 1' })
    })
  })

  describe('POST /api/farmacia/recetas', () => {
    it('creates a prescription and writes an audit event', async () => {
      vi.mocked(prisma.recetaDispensacion.create).mockResolvedValueOnce(recetaRow as never)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/farmacia/recetas')
        .send(validRecetaBody)
        .expect(201)
      expect(res.body.data).toMatchObject({ id: 1, numeroReceta: 'R-1' })
      expect(prisma.auditEvent.create).toHaveBeenCalled()
    })

    it('rejects a body without numeroReceta', async () => {
      const app = createApp(prisma)
      await request(app)
        .post('/api/farmacia/recetas')
        .send({ ...validRecetaBody, numeroReceta: '' })
        .expect(400)
    })

    it('returns 409 when the prescription number already exists', async () => {
      vi.mocked(prisma.recetaDispensacion.create).mockRejectedValueOnce(
        Object.assign(new Error('unique'), { code: 'P2002' }),
      )
      const app = createApp(prisma)
      const res = await request(app).post('/api/farmacia/recetas').send(validRecetaBody).expect(409)
      expect(res.body).toMatchObject({ error: 'RECETA_ALREADY_EXISTS' })
    })
  })

  describe('libro psicotropicos', () => {
    it('lists book entries', async () => {
      vi.mocked(prisma.libroPsicotropicoMovimiento.findMany).mockResolvedValueOnce([
        libroRow,
      ] as never)
      const app = createApp(prisma)
      const res = await request(app).get('/api/farmacia/libro-psicotropicos').expect(200)
      expect(res.body.data[0]).toMatchObject({ id: 2, tipo: 'ingreso', cantidad: 3 })
    })

    it('exports the book as CSV', async () => {
      vi.mocked(prisma.libroPsicotropicoMovimiento.findMany).mockResolvedValueOnce([
        libroRow,
      ] as never)
      const app = createApp(prisma)
      const res = await request(app)
        .get('/api/farmacia/libro-psicotropicos/export')
        .expect(200)
      expect(res.headers['content-type']).toContain('text/csv')
      expect(res.headers['content-disposition']).toContain('libro-psicotropicos.csv')
      expect(res.text.split('\n')[0]).toContain('"fecha","tipo"')
      expect(res.text).toContain('Clonazepam 2mg')
    })

    it('creates an entry for a psychotropic article', async () => {
      vi.mocked(prisma.libroPsicotropicoMovimiento.create).mockResolvedValueOnce(libroRow as never)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/farmacia/libro-psicotropicos')
        .send({ articuloId: 5, tipo: 'ingreso', cantidad: 3, referencia: 'compra:9' })
        .expect(201)
      expect(res.body.data).toMatchObject({ id: 2, referencia: 'compra:9' })
    })

    it('returns 422 when the article is not flagged as psychotropic', async () => {
      vi.mocked(prisma.articulo.findFirst).mockResolvedValueOnce({
        id: 5,
        esPsicotropico: false,
      } as never)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/farmacia/libro-psicotropicos')
        .send({ articuloId: 5, tipo: 'ingreso', cantidad: 3 })
        .expect(422)
      expect(res.body).toMatchObject({ error: 'ARTICLE_NOT_PSYCHOTROPIC' })
    })

    it('rejects an unknown tipo with 400', async () => {
      const app = createApp(prisma)
      await request(app)
        .post('/api/farmacia/libro-psicotropicos')
        .send({ articuloId: 5, tipo: 'venta', cantidad: 3 })
        .expect(400)
    })
  })

  describe('PUT /api/farmacia/lotes/:id/serial', () => {
    it('stores the unit serial on the lot', async () => {
      const app = createApp(prisma)
      const res = await request(app)
        .put('/api/farmacia/lotes/8/serial')
        .send({ serialUnidad: 'AB-1' })
        .expect(200)
      expect(res.body.data).toMatchObject({ id: 8, serialUnidad: 'AB-1' })
      expect(prisma.lote.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { serialUnidad: 'AB-1', codigoDatamatrix: null },
        }),
      )
    })

    it('returns 404 when the lot is not from this tenant', async () => {
      vi.mocked(prisma.lote.findFirst).mockResolvedValueOnce(null as never)
      const app = createApp(prisma)
      await request(app).put('/api/farmacia/lotes/8/serial').send({ serialUnidad: 'AB-1' }).expect(404)
    })

    it('rejects an oversized DataMatrix payload with 400', async () => {
      const app = createApp(prisma)
      await request(app)
        .put('/api/farmacia/lotes/8/serial')
        .send({ codigoDatamatrix: 'x'.repeat(201) })
        .expect(400)
    })
  })
})
