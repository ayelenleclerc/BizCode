/**
 * Flujo repartos con PostgreSQL real (#140).
 */
import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { createApp } from '../../server/createApp'

async function truncateRepartosData(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.repartoItem.deleteMany(),
    prisma.reparto.deleteMany(),
    prisma.ordenEntrega.deleteMany({ where: { tenantId: 1 } }),
    prisma.facturaItem.deleteMany(),
    prisma.pedido.deleteMany(),
    prisma.factura.deleteMany({ where: { tenantId: 1 } }),
    prisma.cliente.deleteMany({ where: { tenantId: 1, codigo: 99001 } }),
  ])
}

async function ensureBypassTenant(prisma: PrismaClient): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Integration tenant', slug: 'integration-tenant-1', active: true },
    update: { active: true },
  })
}

describe('API — repartos integración PostgreSQL', () => {
  let prisma: PrismaClient
  let app: Application
  let driverId: number
  let ordenEntregaId: number

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL no está definida.')
    }
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    prisma = new PrismaClient()
    app = createApp(prisma)
    await prisma.$connect()
    await ensureBypassTenant(prisma)
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await truncateRepartosData(prisma)
    const driver = await prisma.appUser.upsert({
      where: { tenantId_username: { tenantId: 1, username: 'int-driver-140' } },
      create: {
        tenantId: 1,
        username: 'int-driver-140',
        passwordHash: 'x',
        role: UserRole.driver,
        active: true,
      },
      update: { active: true, role: UserRole.driver },
    })
    driverId = driver.id

    const cliente = await prisma.cliente.create({
      data: {
        tenantId: 1,
        codigo: 99001,
        rsocial: 'Cliente Reparto Int',
        condIva: '1',
        balance: 0,
      },
    })

    const orden = await prisma.ordenEntrega.create({
      data: {
        tenantId: 1,
        clienteId: cliente.id,
        fecha: new Date('2026-05-20T12:00:00.000Z'),
        estado: 'pending',
      },
    })
    ordenEntregaId = orden.id
  })

  it('crear → iniciar → cerrar deja OE pendiente en failed', async () => {
    const createRes = await request(app)
      .post('/api/repartos')
      .send({
        fecha: '2026-05-20',
        choferId: driverId,
        ordenEntregaIds: [ordenEntregaId],
      })
      .expect(201)

    const repartoId = createRes.body.data.id as number
    expect(createRes.body.data.estado).toBe('planned')

    const oeAssigned = await prisma.ordenEntrega.findUnique({ where: { id: ordenEntregaId } })
    expect(oeAssigned?.estado).toBe('assigned')
    expect(oeAssigned?.driverId).toBe(driverId)

    await request(app).post(`/api/repartos/${repartoId}/iniciar`).expect(200)

    const oeTransit = await prisma.ordenEntrega.findUnique({ where: { id: ordenEntregaId } })
    expect(oeTransit?.estado).toBe('in_transit')

    const closeRes = await request(app).post(`/api/repartos/${repartoId}/cerrar`).expect(200)
    expect(closeRes.body.data.estado).toBe('completed')
    expect(closeRes.body.summary.pendingClosed).toBe(1)

    const oeFailed = await prisma.ordenEntrega.findUnique({ where: { id: ordenEntregaId } })
    expect(oeFailed?.estado).toBe('failed')

    const item = await prisma.repartoItem.findFirst({ where: { repartoId } })
    expect(item?.estado).toBe('not_delivered')
  })
})
