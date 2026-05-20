/**
 * Flujo POD repartos con PostgreSQL real (#142).
 */
import 'dotenv/config'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { createApp } from '../../server/createApp'

const TEST_FIRMA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function truncateRepartosData(prisma: PrismaClient): Promise<void> {
  await prisma.$transaction([
    prisma.repartoItem.deleteMany(),
    prisma.reparto.deleteMany(),
    prisma.ordenEntrega.deleteMany({ where: { tenantId: 1 } }),
    prisma.facturaItem.deleteMany(),
    prisma.pedido.deleteMany(),
    prisma.factura.deleteMany({ where: { tenantId: 1 } }),
    prisma.cliente.deleteMany({ where: { tenantId: 1, codigo: 99002 } }),
  ])
}

async function ensureBypassTenant(prisma: PrismaClient): Promise<void> {
  await prisma.tenant.upsert({
    where: { id: 1 },
    create: { id: 1, name: 'Integration tenant', slug: 'integration-tenant-1', active: true },
    update: { active: true },
  })
}

describe('API — repartos POD integración PostgreSQL', () => {
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
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    delete process.env.BIZCODE_TEST_USER_ID

    const driver = await prisma.appUser.upsert({
      where: { tenantId_username: { tenantId: 1, username: 'int-driver-142' } },
      create: {
        tenantId: 1,
        username: 'int-driver-142',
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
        codigo: 99002,
        rsocial: 'Cliente POD Int',
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

  it('crear → iniciar → PUT pod → GET pod (planner); driver GET pod 403', async () => {
    const createRes = await request(app)
      .post('/api/repartos')
      .send({
        fecha: '2026-05-20',
        choferId: driverId,
        ordenEntregaIds: [ordenEntregaId],
      })
      .expect(201)

    const repartoId = createRes.body.data.id as number
    await request(app).post(`/api/repartos/${repartoId}/iniciar`).expect(200)

    const item = await prisma.repartoItem.findFirst({ where: { repartoId } })
    expect(item?.id).toBeDefined()

    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = String(driverId)

    const putRes = await request(app)
      .put(`/api/repartos/${repartoId}/items/${item!.id}`)
      .send({
        outcome: 'delivered',
        receptorNombre: 'Receptor Int',
        firmaBase64: TEST_FIRMA,
      })
      .expect(200)

    expect(putRes.body.data.estado).toBe('delivered')
    expect(putRes.body.data.hasPod).toBe(true)

    await request(app).get(`/api/repartos/${repartoId}/items/${item!.id}/pod`).expect(403)

    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    delete process.env.BIZCODE_TEST_USER_ID

    const getRes = await request(app)
      .get(`/api/repartos/${repartoId}/items/${item!.id}/pod`)
      .expect(200)

    expect(getRes.body.data.podMedia?.firmaBase64).toContain('base64')
    expect(getRes.body.data.receptorNombre).toBe('Receptor Int')

    const oe = await prisma.ordenEntrega.findUnique({ where: { id: ordenEntregaId } })
    expect(oe?.estado).toBe('delivered')
  })
})
