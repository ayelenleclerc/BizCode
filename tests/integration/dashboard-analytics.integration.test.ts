/**
 * Dashboard analytics aggregation against PostgreSQL (#138).
 */
import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { Prisma, PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { buildArticuloCreateBody, createIntegrationRubro } from '../fixtures/catalogFactories'

async function truncateSalesData(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.facturaItem.deleteMany(),
    prisma.pedido.deleteMany(),
    prisma.factura.deleteMany(),
    prisma.articulo.deleteMany(),
    prisma.cliente.deleteMany(),
    prisma.rubro.deleteMany(),
    prisma.formaPago.deleteMany(),
    prisma.deliveryZone.deleteMany(),
    prisma.appUser.deleteMany({ where: { id: { gt: 1 } } }),
  ])
}

async function ensureBypassTenant(prisma: PrismaClient): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Integration tenant', slug: 'integration-tenant-1', active: true },
    update: { active: true },
  })
}

describe('Dashboard analytics — integración PostgreSQL (#138)', () => {
  let prisma: PrismaClient
  let app: Application

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL no está definida.')
    }
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    prisma = new PrismaClient()
    app = createApp(prisma)
    await prisma.$connect()
    await ensureBypassTenant(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncateSalesData(prisma)
  })

  it('GET /api/dashboard/ventas-historico agrega en SQL y CSV < 2s para 12 meses', async () => {
    const suffix = Date.now() % 100_000
    const rubro = await createIntegrationRubro(prisma, {
      codigo: 90_000 + suffix,
      nombre: 'Analytics rubro',
    })
    const articulo = await prisma.articulo.create({
      data: { tenantId: 1, ...buildArticuloCreateBody(rubro.id, 91_000 + suffix) },
    })
    const cliente = await prisma.cliente.create({
      data: {
        tenantId: 1,
        codigo: 92_000 + suffix,
        rsocial: 'Analytics Client',
        condIva: '1',
        activo: true,
      },
    })
    const seller = await prisma.appUser.create({
      data: {
        tenantId: 1,
        username: `analytics-seller-${suffix}`,
        passwordHash: 'x',
        role: 'seller',
        active: true,
      },
    })

    const now = new Date()
    for (let monthOffset = 0; monthOffset < 12; monthOffset += 1) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15, 12, 0, 0)
      const factura = await prisma.factura.create({
        data: {
          tenantId: 1,
          fecha,
          tipo: 'B',
          prefijo: '0001',
          numero: 10_000 + monthOffset,
          clienteId: cliente.id,
          total: new Prisma.Decimal(100 + monthOffset),
          estado: 'A',
        },
      })
      await prisma.facturaItem.create({
        data: {
          facturaId: factura.id,
          articuloId: articulo.id,
          cantidad: 2,
          precio: new Prisma.Decimal(50),
          subtotal: new Prisma.Decimal(100 + monthOffset),
        },
      })
      await prisma.pedido.create({
        data: {
          tenantId: 1,
          clienteId: cliente.id,
          vendedorId: seller.id,
          estado: 'invoiced',
          total: new Prisma.Decimal(100 + monthOffset),
          facturaId: factura.id,
        },
      })
    }

    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const to = now
    const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, '0')}-01`
    const toStr = `${to.getFullYear()}-${String(to.getMonth() + 1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`

    const jsonRes = await request(app)
      .get('/api/dashboard/ventas-historico')
      .query({ from: fromStr, to: toStr, groupBy: 'month' })
      .expect(200)

    expect(jsonRes.body.success).toBe(true)
    expect(jsonRes.body.data.series.length).toBeGreaterThanOrEqual(1)
    expect(jsonRes.body.data.topArticles.length).toBeGreaterThanOrEqual(1)
    expect(jsonRes.body.data.bySeller.length).toBeGreaterThanOrEqual(1)

    const started = Date.now()
    const csvRes = await request(app)
      .get('/api/dashboard/ventas-historico')
      .set('Accept', 'text/csv')
      .query({ from: fromStr, to: toStr, groupBy: 'month' })
      .expect(200)
    const elapsed = Date.now() - started

    expect(csvRes.headers['content-type']).toMatch(/text\/csv/)
    expect(csvRes.text).toContain('period,count,total')
    expect(elapsed).toBeLessThan(2000)
  })
})
