/**
 * Integración PostgreSQL — circuito piloto distribuidora (#450):
 * pedido → confirm → invoice → stock → CC → cobro parcial; stock insuficiente; void → CC.
 */
import 'dotenv/config'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { buildArticuloCreateBody, createIntegrationRubro } from '../fixtures/catalogFactories'

async function truncatePilotCircuit(prisma: PrismaClient): Promise<void> {
  const tenantId = 1
  await prisma.$transaction([
    prisma.movimientoClienteCC.deleteMany({ where: { tenantId } }),
    prisma.reciboCobroImputacion.deleteMany({ where: { reciboCobro: { tenantId } } }),
    prisma.reciboCobroForma.deleteMany({ where: { reciboCobro: { tenantId } } }),
    prisma.reciboCobro.deleteMany({ where: { tenantId } }),
    prisma.retencionAplicada.deleteMany({ where: { tenantId } }),
    prisma.chequeMov.deleteMany({ where: { cheque: { tenantId } } }),
    prisma.cheque.deleteMany({ where: { tenantId } }),
    prisma.notaCredito.deleteMany({ where: { tenantId } }),
    prisma.cobro.deleteMany({ where: { tenantId } }),
    prisma.cobroRecordatorio.deleteMany({ where: { factura: { tenantId } } }),
    prisma.repartoItem.deleteMany({ where: { reparto: { tenantId } } }),
    prisma.repartoUbicacion.deleteMany({ where: { reparto: { tenantId } } }),
    prisma.reparto.deleteMany({ where: { tenantId } }),
    prisma.remitoItem.deleteMany({ where: { remito: { tenantId } } }),
    prisma.remito.deleteMany({ where: { tenantId } }),
    prisma.ordenEntrega.deleteMany({ where: { tenantId } }),
    prisma.pedidoItem.deleteMany({ where: { pedido: { tenantId } } }),
    prisma.pedido.deleteMany({ where: { tenantId } }),
    prisma.facturaItem.deleteMany({ where: { factura: { tenantId } } }),
    prisma.factura.deleteMany({ where: { tenantId } }),
    prisma.stockDeposito.deleteMany({ where: { tenantId } }),
    prisma.articulo.deleteMany({ where: { tenantId } }),
    prisma.rubro.deleteMany({ where: { tenantId } }),
    prisma.cliente.deleteMany({ where: { tenantId } }),
    prisma.notification.deleteMany({ where: { tenantId } }),
  ])
}

async function ensureBypassTenant(prisma: PrismaClient): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Integration tenant', slug: 'integration-tenant-1', active: true },
    update: { active: true },
  })
}

async function ensureBypassUser(prisma: PrismaClient): Promise<number> {
  const user = await prisma.appUser.upsert({
    where: { tenantId_username: { tenantId: 1, username: 'int-owner-piloto-450' } },
    create: {
      tenantId: 1,
      username: 'int-owner-piloto-450',
      passwordHash: 'x',
      role: UserRole.owner,
      active: true,
    },
    update: { active: true, role: UserRole.owner },
  })
  return user.id
}

describe('Piloto distribuidora — circuito integración (#450)', () => {
  let prisma: PrismaClient
  let app: Application
  let bypassUserId: number

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL no está definida para test:integration.')
    }
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    prisma = new PrismaClient()
    app = createApp(prisma)
    await prisma.$connect()
    await ensureBypassTenant(prisma)
    bypassUserId = await ensureBypassUser(prisma)
    process.env.BIZCODE_TEST_USER_ID = String(bypassUserId)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncatePilotCircuit(prisma)
  })

  afterEach(async () => {
    await truncatePilotCircuit(prisma)
  })

  async function seedClienteArticulo(stock: number): Promise<{ clienteId: number; articuloId: number }> {
    const clienteRes = await request(app)
      .post('/api/clientes')
      .send({
        codigo: 45001,
        rsocial: 'Cliente Piloto 450',
        condIva: 'RI',
        activo: true,
      })
      .expect(200)
    const clienteId = clienteRes.body.data.id as number

    const rubro = await createIntegrationRubro(prisma, { codigo: 4501, nombre: 'Rubro piloto' })
    const articuloRes = await request(app)
      .post('/api/articulos')
      .send({
        ...buildArticuloCreateBody(rubro.id, 45010),
        stock,
        precioLista1: 100,
        descripcion: 'Art piloto 450',
      })
      .expect(200)
    const articuloId = articuloRes.body.data.id as number

    // When a default depósito exists (#236), invoice stock checks StockDeposito — not Articulo.stock alone.
    const deposito = await prisma.deposito.findFirst({
      where: { tenantId: 1, esDefault: true, activo: true },
      select: { id: true },
    })
    if (deposito) {
      await prisma.stockDeposito.upsert({
        where: { articuloId_depositoId: { articuloId, depositoId: deposito.id } },
        create: {
          tenantId: 1,
          articuloId,
          depositoId: deposito.id,
          cantidad: stock,
          stockMin: 0,
        },
        update: { cantidad: stock },
      })
    }

    return { clienteId, articuloId }
  }

  it('pedido → confirm → invoice decrementa stock, abre CC y cobro parcial deja saldo coherente', async () => {
    const { clienteId, articuloId } = await seedClienteArticulo(10)

    const pedidoRes = await request(app)
      .post('/api/pedidos')
      .send({
        clienteId,
        items: [{ articuloId, cantidad: 2, precio: 100, dscto: 0 }],
      })
      .expect(201)
    const pedidoId = pedidoRes.body.data.id as number
    expect(pedidoRes.body.data.estado).toBe('draft')

    await request(app).post(`/api/pedidos/${pedidoId}/confirm`).expect(200)

    const invoiceRes = await request(app)
      .post(`/api/pedidos/${pedidoId}/invoice`)
      .send({
        fecha: '2026-11-07',
        tipo: 'B',
        prefijo: '0001',
        numero: 450001,
      })

    expect(
      invoiceRes.status,
      `invoice → ${invoiceRes.status} ${JSON.stringify(invoiceRes.body)}`,
    ).toBe(200)

    const facturaId = invoiceRes.body.data.facturaId as number
    expect(facturaId).toBeGreaterThan(0)
    expect(invoiceRes.body.data.estado).toBe('invoiced')

    const articulo = await prisma.articulo.findFirstOrThrow({ where: { id: articuloId } })
    expect(Number(articulo.stock)).toBe(8)

    const saldoAfterInvoice = await request(app)
      .get(`/api/clientes/${clienteId}/cuenta-corriente/saldo`)
      .expect(200)
    const saldoFactura = Number.parseFloat(String(saldoAfterInvoice.body.data.saldo))
    expect(saldoFactura).toBeGreaterThan(0)

    const parcial = Math.round((saldoFactura / 2) * 100) / 100
    await request(app)
      .post(`/api/clientes/${clienteId}/recibos`)
      .send({
        fecha: '2026-11-07',
        totalCobrado: parcial,
        fifo: true,
        formas: [{ tipo: 'efectivo', importe: parcial }],
      })
      .expect(201)

    const saldoAfterCobro = await request(app)
      .get(`/api/clientes/${clienteId}/cuenta-corriente/saldo`)
      .expect(200)
    const expected = Math.round((saldoFactura - parcial) * 100) / 100
    expect(Number.parseFloat(String(saldoAfterCobro.body.data.saldo))).toBeCloseTo(expected, 2)
  })

  it('invoice desde pedido rechaza con INSUFFICIENT_STOCK cuando falta stock', async () => {
    const { clienteId, articuloId } = await seedClienteArticulo(1)

    const pedidoRes = await request(app)
      .post('/api/pedidos')
      .send({
        clienteId,
        items: [{ articuloId, cantidad: 5, precio: 100, dscto: 0 }],
      })
      .expect(201)
    const pedidoId = pedidoRes.body.data.id as number
    await request(app).post(`/api/pedidos/${pedidoId}/confirm`).expect(200)

    const invoiceRes = await request(app)
      .post(`/api/pedidos/${pedidoId}/invoice`)
      .send({
        fecha: '2026-11-07',
        tipo: 'B',
        prefijo: '0001',
        numero: 450002,
      })
      .expect(422)

    expect(String(invoiceRes.body.error)).toMatch(/INSUFFICIENT_STOCK/i)

    const articulo = await prisma.articulo.findFirstOrThrow({ where: { id: articuloId } })
    expect(Number(articulo.stock)).toBe(1)
  })

  it('void tras invoice deja cuenta corriente coherente (NC) sin reabrir pedido', async () => {
    const { clienteId, articuloId } = await seedClienteArticulo(10)

    const pedidoRes = await request(app)
      .post('/api/pedidos')
      .send({
        clienteId,
        items: [{ articuloId, cantidad: 1, precio: 100, dscto: 0 }],
      })
      .expect(201)
    const pedidoId = pedidoRes.body.data.id as number
    await request(app).post(`/api/pedidos/${pedidoId}/confirm`).expect(200)

    const invoiceRes = await request(app)
      .post(`/api/pedidos/${pedidoId}/invoice`)
      .send({
        fecha: '2026-11-07',
        tipo: 'B',
        prefijo: '0001',
        numero: 450003,
      })
      .expect(200)
    const facturaId = invoiceRes.body.data.facturaId as number

    const saldoBefore = await request(app)
      .get(`/api/clientes/${clienteId}/cuenta-corriente/saldo`)
      .expect(200)
    expect(Number.parseFloat(String(saldoBefore.body.data.saldo))).toBeGreaterThan(0)

    await request(app)
      .put(`/api/facturas/${facturaId}/void`)
      .send({ motivo: 'Anulación circuito piloto #450' })
      .expect(200)

    const saldoAfter = await request(app)
      .get(`/api/clientes/${clienteId}/cuenta-corriente/saldo`)
      .expect(200)
    expect(Number.parseFloat(String(saldoAfter.body.data.saldo))).toBeCloseTo(0, 2)

    // Void restores CC via NC and stock (#450 GAP-P1-stock-void).
    const articulo = await prisma.articulo.findFirstOrThrow({ where: { id: articuloId } })
    expect(Number(articulo.stock)).toBe(10)
  })
})
