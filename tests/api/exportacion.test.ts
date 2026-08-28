/**
 * @en API tests for the export vertical endpoints (#206).
 * @es Tests API de los endpoints del vertical exportación (#206).
 * @pt-BR Testes API dos endpoints do vertical exportação (#206).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import * as channels from '../../apps/server/channels'

const EXPORT_MODULES =
  'core.auth,core.catalog,core.clients,core.invoicing,core.orders,catalog.multicurrency,vertical.export'

const pedidoRow = {
  id: 12,
  tenantId: 1,
  incoterm: 'FOB',
  paisDestino: 'BR',
  despachanteNombre: 'Estudio Aduanero',
  despachanteEmail: 'broker@example.com',
  total: new Prisma.Decimal(1500),
  cliente: { id: 4, rsocial: 'ACME SA' },
  items: [{ descripcion: 'Bomba centrifuga', cantidad: new Prisma.Decimal(2) }],
}

function buildPrismaMock(): PrismaClient {
  return {
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    pedido: {
      findFirst: vi.fn().mockResolvedValue(pedidoRow),
      update: vi.fn().mockResolvedValue(pedidoRow),
    },
  } as unknown as PrismaClient
}

describe('export vertical REST endpoints (#206)', () => {
  const previousModules = process.env.BIZCODE_TEST_MODULES
  let prisma: PrismaClient

  beforeEach(() => {
    process.env.BIZCODE_TEST_MODULES = EXPORT_MODULES
    prisma = buildPrismaMock()
    vi.spyOn(channels, 'sendDespachanteNotificationEmail').mockResolvedValue(true)
  })

  afterEach(() => {
    if (previousModules === undefined) delete process.env.BIZCODE_TEST_MODULES
    else process.env.BIZCODE_TEST_MODULES = previousModules
    vi.restoreAllMocks()
  })

  describe('module gate', () => {
    it('returns 403 module_not_enabled when vertical.export is off', async () => {
      process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
      const app = createApp(prisma)
      const res = await request(app).get('/api/exportacion/incoterms').expect(403)
      expect(res.body).toMatchObject({ error: 'module_not_enabled', module: 'vertical.export' })
    })

    it('gates the broker notification too', async () => {
      process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
      const app = createApp(prisma)
      await request(app).post('/api/pedidos/12/notificar-despachante').send({}).expect(403)
    })
  })

  describe('GET /api/exportacion/incoterms', () => {
    it('returns the 11 Incoterms 2020 rules', async () => {
      const app = createApp(prisma)
      const res = await request(app).get('/api/exportacion/incoterms').expect(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveLength(11)
      expect(res.body.data).toContain('FOB')
      expect(res.body.data).toContain('DPU')
      expect(res.body.data).not.toContain('DAT')
    })
  })

  describe('POST /api/pedidos/:id/notificar-despachante', () => {
    it('notifies the broker stored on the order and audits the event', async () => {
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/pedidos/12/notificar-despachante')
        .send({})
        .expect(200)
      expect(res.body.data).toMatchObject({
        pedidoId: 12,
        despachanteEmail: 'broker@example.com',
        enviado: true,
      })
      expect(channels.sendDespachanteNotificationEmail).toHaveBeenCalledWith(
        'broker@example.com',
        'BizCode - Pedido #12',
        expect.stringContaining('Incoterm: FOB'),
      )
      expect(prisma.auditEvent.create).toHaveBeenCalled()
    })

    it('persists a broker override before sending', async () => {
      const app = createApp(prisma)
      await request(app)
        .post('/api/pedidos/12/notificar-despachante')
        .send({ despachanteNombre: 'Otro Estudio', despachanteEmail: 'Nuevo@Example.com' })
        .expect(200)
      expect(prisma.pedido.update).toHaveBeenCalledWith({
        where: { id: 12 },
        data: { despachanteNombre: 'Otro Estudio', despachanteEmail: 'nuevo@example.com' },
      })
    })

    it('returns 422 when neither the body nor the order has an email', async () => {
      vi.mocked(prisma.pedido.findFirst).mockResolvedValueOnce({
        ...pedidoRow,
        despachanteNombre: null,
        despachanteEmail: null,
      } as never)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/pedidos/12/notificar-despachante')
        .send({})
        .expect(422)
      expect(res.body.error).toContain('despachanteEmail is required')
    })

    it('returns 422 for a malformed broker email', async () => {
      const app = createApp(prisma)
      await request(app)
        .post('/api/pedidos/12/notificar-despachante')
        .send({ despachanteEmail: 'not-an-email' })
        .expect(422)
    })

    it('returns 404 when the order does not belong to the tenant', async () => {
      vi.mocked(prisma.pedido.findFirst).mockResolvedValueOnce(null as never)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/pedidos/99/notificar-despachante')
        .send({})
        .expect(404)
      expect(res.body).toMatchObject({ success: false, error: 'Pedido not found' })
    })

    it('reports enviado false when SMTP is not configured', async () => {
      vi.mocked(channels.sendDespachanteNotificationEmail).mockResolvedValueOnce(false)
      const app = createApp(prisma)
      const res = await request(app)
        .post('/api/pedidos/12/notificar-despachante')
        .send({})
        .expect(200)
      expect(res.body.data.enviado).toBe(false)
      expect(prisma.auditEvent.create).toHaveBeenCalled()
    })
  })
})
