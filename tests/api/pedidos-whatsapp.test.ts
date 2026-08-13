import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const twilioCreate = vi.fn().mockResolvedValue({ sid: 'SM1' })

vi.mock('twilio', () => ({
  default: vi.fn(() => ({ messages: { create: twilioCreate } })),
}))

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA', condIva: 'RI' }

const PEDIDO_ROW = {
  id: 1,
  tenantId: 1,
  clienteId: 1,
  vendedorId: null,
  estado: 'confirmed',
  total: 100,
  validUntil: null,
  facturaId: null,
  observaciones: null,
  condicionCobro: null,
  plazoDias: null,
  createdAt: new Date('2026-05-18T12:00:00.000Z'),
  updatedAt: new Date('2026-05-18T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  vendedor: null,
  items: [
    {
      id: 1,
      articuloId: 2,
      descripcion: 'Item',
      condIva: '1',
      unidadServicio: null,
      cantidad: 1,
      precio: 100,
      dscto: 0,
      subtotal: 100,
      articulo: { id: 2, codigo: 10, descripcion: 'Item', condIva: '1', tipo: 'articulo' },
    },
  ],
  factura: null,
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        condIva: 'RI',
        suspended: false,
        telef: '+54 11 5555-1234',
      }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    pedido: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([PEDIDO_ROW]),
      findFirst: vi.fn().mockResolvedValue(PEDIDO_ROW),
      create: vi.fn().mockResolvedValue(PEDIDO_ROW),
      update: vi.fn().mockResolvedValue(PEDIDO_ROW),
    },
    pedidoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        sellerCreditOverLimitAction: 'block',
        sellerCreditOverdueAction: 'warn',
        sellerStockZeroAction: 'warn',
        sellerStockCapQtyToAvailable: true,
        sellerWhatsappTemplate: null,
      }),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', name: 'Acme SA', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Pedidos WhatsApp API (#265)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_MODULES
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
  })

  it('GET whatsapp-share returns preview and matches OpenAPI', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/pedidos/1/whatsapp-share?locale=es')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.phone).toBe('541155551234')
    expect(res.body.data.text).toContain('Pedido #1')
    expect(res.body.data.text).toContain('Acme SA')
    expect(res.body.data.waMeUrl).toMatch(/^https:\/\/wa\.me\/541155551234\?text=/)
    expect(res.body.data.twilioAvailable).toBe(false)
    await assertMatchesOpenApi('/api/pedidos/{id}/whatsapp-share', 'get', '200', res.body)
  })

  it('GET whatsapp-share without telef sets reason no_phone', async () => {
    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          tenantId: 1,
          condIva: 'RI',
          suspended: false,
          telef: null,
        }),
        findUnique: vi.fn().mockResolvedValue(null),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/pedidos/1/whatsapp-share')
    expect(res.status).toBe(200)
    expect(res.body.data.phone).toBe('')
    expect(res.body.data.waMeUrl).toBeNull()
    expect(res.body.data.reason).toBe('no_phone')
    await assertMatchesOpenApi('/api/pedidos/{id}/whatsapp-share', 'get', '200', res.body)
  })

  it('POST whatsapp canal=link audits without Twilio module', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/pedidos/1/whatsapp').send({ canal: 'link' })
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ canal: 'link', sent: false })
    expect(vi.mocked(prisma.auditEvent.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'whatsapp_enviado',
          resource: 'pedido',
          resourceId: '1',
          metadata: { canal: 'link' },
        }),
      }),
    )
    await assertMatchesOpenApi('/api/pedidos/{id}/whatsapp', 'post', '200', res.body)
  })

  it('POST whatsapp canal=twilio returns 403 without comms.whatsapp', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/pedidos/1/whatsapp').send({ canal: 'twilio' })
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('module_not_enabled')
    expect(res.body.module).toBe('comms.whatsapp')
  })

  it('POST whatsapp canal=twilio sends when module + Twilio are configured', async () => {
    process.env.BIZCODE_TEST_MODULES =
      'core.auth,core.catalog,core.clients,core.invoicing,billing.orders,comms.notifications,comms.whatsapp'
    process.env.TWILIO_ACCOUNT_SID = 'ACtest'
    process.env.TWILIO_AUTH_TOKEN = 'token'
    process.env.TWILIO_WHATSAPP_FROM = '+5491100000000'

    twilioCreate.mockClear()
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/pedidos/1/whatsapp?locale=es').send({ canal: 'twilio' })

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ canal: 'twilio', sent: true })
    expect(twilioCreate).toHaveBeenCalled()
    await assertMatchesOpenApi('/api/pedidos/{id}/whatsapp', 'post', '200', res.body)
  })
})
