import { Decimal } from '@prisma/client/runtime/library'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '../../apps/server/createApp'
import { initializeAppConfig, resetAppConfigCache } from '../../apps/server/config/env'
import {
  createPortalPrismaMock,
  PORTAL_TEST_CLIENTE_A_ID,
  PORTAL_TEST_CLIENTE_B_ID,
  PORTAL_TEST_JWT_SECRET,
  PORTAL_TEST_TENANT_ID,
  PORTAL_TEST_TENANT_SLUG,
} from '../helpers/portalPrismaMock'

describe('Portal tenant isolation', () => {
  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = PORTAL_TEST_JWT_SECRET
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    process.env.BIZCODE_TEST_PORTAL_CLIENTE_ID = String(PORTAL_TEST_CLIENTE_A_ID)
    initializeAppConfig()
  })

  it('cliente A cannot download factura PDF of cliente B', async () => {
    const prisma = createPortalPrismaMock()
    const facturaB = {
      id: 99,
      tenantId: PORTAL_TEST_TENANT_ID,
      clienteId: PORTAL_TEST_CLIENTE_B_ID,
      estado: 'A',
      tipo: 'B',
      prefijo: '0001',
      numero: 42,
      fecha: new Date(),
      total: new Decimal(100),
      estadoCae: 'issued',
      cae: '123',
    }
    vi.mocked(prisma.factura.findFirst).mockImplementation((async (args) => {
      const where = args?.where as { id?: number; clienteId?: number } | undefined
      if (where?.id === 99 && where.clienteId === PORTAL_TEST_CLIENTE_A_ID) {
        return null
      }
      if (where?.id === 99) {
        return facturaB
      }
      return null
    }) as typeof prisma.factura.findFirst)

    const app = createApp(prisma)
    const res = await request(app).get(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/facturas/99/pdf`)
    expect(res.status).toBe(404)
  })

  it('cliente A factura list is scoped to own clienteId', async () => {
    const prisma = createPortalPrismaMock()
    const listSpy = vi.mocked(prisma.factura.findMany)
    const app = createApp(prisma)
    const res = await request(app).get(`/api/portal/${PORTAL_TEST_TENANT_SLUG}/facturas`)
    expect(res.status).toBe(200)
    expect(listSpy).toHaveBeenCalled()
    const firstCall = listSpy.mock.calls[0]?.[0] as { where?: { clienteId?: number } }
    expect(firstCall?.where?.clienteId).toBe(PORTAL_TEST_CLIENTE_A_ID)
  })
})
