/**
 * @en Integration smoke for Mercado Pago reconciliation model (#178).
 * @es Smoke de integración para modelo de reconciliación MP (#178).
 */
import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { MercadoPagoReconciliationService } from '../../server/services/MercadoPagoReconciliationService'

describe('Mercado Pago reconciliation — integración PostgreSQL (#178)', () => {
  let prisma: PrismaClient

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error('DATABASE_URL no está definida para test:integration.')
    }
    prisma = new PrismaClient()
    await prisma.$connect()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('MercadoPagoReconciliationEntry table exists and listPending returns array', async () => {
    const tenant = await prisma.tenant.findFirst({ select: { id: true } })
    expect(tenant?.id).toBeTruthy()
    const service = new MercadoPagoReconciliationService(prisma)
    const rows = await service.listPending(tenant!.id)
    expect(Array.isArray(rows)).toBe(true)
  })
})
