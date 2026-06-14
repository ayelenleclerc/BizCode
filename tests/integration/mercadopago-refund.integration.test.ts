/**
 * @en Integration smoke for Mercado Pago refund/chargeback models (#179).
 * @es Smoke de integración para modelos de reembolso/contracargo MP (#179).
 */
import 'dotenv/config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { MercadoPagoChargebackService } from '../../server/services/MercadoPagoChargebackService'
import { MercadoPagoRefundService } from '../../server/services/MercadoPagoRefundService'

describe('Mercado Pago refund/chargeback — integración PostgreSQL (#179)', () => {
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

  it('MercadoPagoRefund table exists and getByFactura returns null when empty', async () => {
    const tenant = await prisma.tenant.findFirst({ select: { id: true } })
    expect(tenant?.id).toBeTruthy()
    const service = new MercadoPagoRefundService(prisma)
    const row = await service.getByFactura(tenant!.id, 999999)
    expect(row).toBeNull()
  })

  it('MercadoPagoChargeback table exists and listPending returns array', async () => {
    const tenant = await prisma.tenant.findFirst({ select: { id: true } })
    expect(tenant?.id).toBeTruthy()
    const service = new MercadoPagoChargebackService(prisma)
    const rows = await service.listPending(tenant!.id)
    expect(Array.isArray(rows)).toBe(true)
  })
})
