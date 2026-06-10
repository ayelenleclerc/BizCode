/**
 * Integración PostgreSQL — secuencia AC #232: factura → recibo parcial → NC → cheque rechazado → saldo.
 */
import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'
import { ClienteCuentaCorrienteService } from '../../server/services/ClienteCuentaCorrienteService'

async function truncateClienteCc(prisma: PrismaClient): Promise<void> {
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
    prisma.cliente.deleteMany({ where: { tenantId } }),
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
    where: { tenantId_username: { tenantId: 1, username: 'int-owner-cc-232' } },
    create: {
      tenantId: 1,
      username: 'int-owner-cc-232',
      passwordHash: 'x',
      role: UserRole.owner,
      active: true,
    },
    update: { active: true, role: UserRole.owner },
  })
  return user.id
}

describe('Cliente cuenta corriente — integración PostgreSQL (#232 AC)', () => {
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
    await truncateClienteCc(prisma)
  })

  it('factura → recibo parcial → NC → cheque rechazado deja saldo coherente', async () => {
    const cliente = await prisma.cliente.create({
      data: {
        tenantId: 1,
        codigo: 88001,
        rsocial: 'Cliente CC Integración',
        condIva: 'RI',
        activo: true,
        balance: new Decimal(0),
      },
    })

    const factura = await prisma.factura.create({
      data: {
        tenantId: 1,
        clienteId: cliente.id,
        fecha: new Date('2026-05-01T12:00:00.000Z'),
        tipo: 'B',
        prefijo: '0001',
        numero: 99,
        neto1: new Decimal(100),
        neto2: new Decimal(0),
        neto3: new Decimal(0),
        iva1: new Decimal(21),
        iva2: new Decimal(0),
        total: new Decimal(121),
        estado: 'A',
        estadoCae: 'not_required',
      },
    })

    const cc = new ClienteCuentaCorrienteService(prisma)
    await cc.recordFromFactura(1, factura, bypassUserId)

    const reciboRes = await request(app)
      .post(`/api/clientes/${cliente.id}/recibos`)
      .send({
        fecha: '2026-06-01',
        totalCobrado: 50,
        fifo: true,
        formas: [{ tipo: 'efectivo', importe: 50 }],
      })
      .expect(201)

    expect(reciboRes.body.data.totalCobrado).toBe('50.00')

    await request(app)
      .post(`/api/facturas/${factura.id}/void`)
      .send({ motivo: 'Anulación total por integración de prueba' })
      .expect(200)

    const cheque = await prisma.cheque.create({
      data: {
        tenantId: 1,
        tipo: 'recibido',
        modalidad: 'fisico',
        numero: '12345678',
        banco: 'Banco Test',
        libradorNombre: cliente.rsocial,
        monto: new Decimal(30),
        moneda: 'ARS',
        fechaEmision: new Date('2026-06-01'),
        fechaVencimiento: new Date('2026-07-01'),
        estado: 'en_cartera',
        clienteId: cliente.id,
      },
    })

    await request(app).post(`/api/cheques/${cheque.id}/rechazar`).send({ nota: 'Rechazo integración' }).expect(200)

    const saldoRes = await request(app)
      .get(`/api/clientes/${cliente.id}/cuenta-corriente/saldo`)
      .expect(200)

    expect(saldoRes.body.data.saldo).toBe('-20.00')

    const antiguedadRes = await request(app)
      .get(`/api/clientes/${cliente.id}/cuenta-corriente/antiguedad`)
      .expect(200)

    expect(antiguedadRes.body.data.totalPendiente).toBe('0.00')
  })
})
