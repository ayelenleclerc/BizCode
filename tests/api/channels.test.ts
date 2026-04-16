/**
 * @en Tests for server/channels.ts — dispatchNotification, isSmtpConfigured, isTwilioConfigured.
 *     nodemailer and twilio are vi.mock'd so no real network calls happen.
 * @es Tests para server/channels.ts — verifican fallback silencioso y llamadas reales (con mock).
 */

import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

// ─── Hoisted mocks (must be declared before vi.mock factories) ─────────────────

const { mockSendMail, mockCreateTransport, mockTwilioCreate } = vi.hoisted(() => {
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })
  const mockCreateTransport = vi.fn().mockReturnValue({ sendMail: mockSendMail })
  const mockTwilioCreate = vi.fn().mockResolvedValue({ sid: 'SM-test' })
  return { mockSendMail, mockCreateTransport, mockTwilioCreate }
})

vi.mock('nodemailer', () => ({
  default: { createTransport: mockCreateTransport },
}))

vi.mock('twilio', () => ({
  default: vi.fn().mockReturnValue({
    messages: { create: mockTwilioCreate },
  }),
}))

// ─── Minimal Prisma mock ──────────────────────────────────────────────────────

const MANAGER_USER = { id: 7 }

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue(null) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ email: 'mgr@example.com', telef: '+5491155550000' }),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1, total: 5000, items: [] }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([MANAGER_USER]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(buildPrismaMock())
      return fn
    }),
    ...overrides,
  } as unknown as PrismaClient
}

// ─── GET /api/notifications/channels ──────────────────────────────────────────

describe('GET /api/notifications/channels', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PORT
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS
    delete process.env.SMTP_FROM
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
  })

  it('reports inApp:true, email:false, whatsapp:false when no env vars set', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notifications/channels').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual({ inApp: true, email: false, whatsapp: false })
  })

  it('reports email:true when SMTP vars are all set', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user'
    process.env.SMTP_PASS = 'pass'
    process.env.SMTP_FROM = 'no-reply@example.com'

    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notifications/channels').expect(200)
    expect(res.body.data.email).toBe(true)
    expect(res.body.data.whatsapp).toBe(false)
  })

  it('reports whatsapp:true when Twilio vars are all set', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'ACtest'
    process.env.TWILIO_AUTH_TOKEN = 'token'
    process.env.TWILIO_WHATSAPP_FROM = '+14155238886'

    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notifications/channels').expect(200)
    expect(res.body.data.email).toBe(false)
    expect(res.body.data.whatsapp).toBe(true)
  })

  it('returns 401 when not authenticated', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/notifications/channels').expect(401)
  })
})

// ─── dispatchNotification — external channels ──────────────────────────────────

describe('dispatchNotification — silent fallback when SMTP unconfigured', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PORT
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS
    delete process.env.SMTP_FROM
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.SMTP_HOST
    delete process.env.SMTP_PORT
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS
    delete process.env.SMTP_FROM
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
  })

  it('does not call nodemailer when SMTP is not configured', async () => {
    // dispatchNotification is called internally by POST /api/facturas when balance > creditLimit
    const { dispatchNotification } = await import('../../server/channels')
    const prisma = buildPrismaMock()
    await dispatchNotification(prisma, 1, 'credit_limit_exceeded', {
      clienteId: 1,
      rsocial: 'Test SA',
      amount: '10000',
      limit: '5000',
    })

    expect(mockCreateTransport).not.toHaveBeenCalled()
  })

  it('calls nodemailer when SMTP is fully configured', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user'
    process.env.SMTP_PASS = 'pass'
    process.env.SMTP_FROM = 'no-reply@example.com'

    const { dispatchNotification } = await import('../../server/channels')
    const prisma = buildPrismaMock()
    await dispatchNotification(prisma, 1, 'credit_limit_exceeded', {
      clienteId: 1,
      rsocial: 'ACME SA',
      amount: '20000',
      limit: '10000',
    })

    // Allow the non-blocking void sendEmail to settle
    await new Promise((r) => setTimeout(r, 10))
    expect(mockCreateTransport).toHaveBeenCalledOnce()
    expect(mockSendMail).toHaveBeenCalledOnce()
    const mailArgs = mockSendMail.mock.calls[0][0]
    expect(mailArgs.subject).toContain('ACME SA')
  })

  it('swallows nodemailer error without throwing', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user'
    process.env.SMTP_PASS = 'pass'
    process.env.SMTP_FROM = 'no-reply@example.com'

    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection refused'))

    const { dispatchNotification } = await import('../../server/channels')
    const prisma = buildPrismaMock()

    // Must resolve without throwing
    await expect(
      dispatchNotification(prisma, 1, 'invoice_overdue', { clienteId: 1, rsocial: 'ACME SA' }),
    ).resolves.toBeUndefined()
  })
})

// ─── POST /api/facturas — .catch() branch when dispatchNotification throws ────

describe('POST /api/facturas — dispatchNotification failure is swallowed', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.SMTP_HOST
    vi.clearAllMocks()
  })

  it('returns 200 even when dispatchNotification rejects (sale must not fail)', async () => {
    const updatedCliente = { id: 1, rsocial: 'Test SA', balance: 20000, creditLimit: 5000 }

    const prisma = buildPrismaMock({
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
        findUnique: vi.fn().mockResolvedValue({ suspended: false }),
        create: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(updatedCliente),
      },
      notification: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        // createMany throws to make dispatchNotification reject → exercises .catch()
        createMany: vi.fn().mockRejectedValue(new Error('DB connection lost')),
        update: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') {
          const inner = buildPrismaMock({
            cliente: {
              findMany: vi.fn().mockResolvedValue([]),
              findFirst: vi.fn().mockResolvedValue(null),
              findUnique: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue(null),
              update: vi.fn().mockResolvedValue(updatedCliente),
            },
            factura: {
              findMany: vi.fn().mockResolvedValue([]),
              create: vi.fn().mockResolvedValue({ id: 99, total: 20000, items: [] }),
              aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
            },
          })
          return fn(inner)
        }
        return fn
      }),
    })

    const app = createApp(prisma)

    const res = await request(app)
      .post('/api/facturas')
      .send({
        fecha: new Date().toISOString(),
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        clienteId: 1,
        formaPagoId: 1,
        neto1: 16528.93,
        neto2: 0,
        neto3: 0,
        iva1: 3471.07,
        iva2: 0,
        total: 20000,
        items: [{ articuloId: 1, cantidad: 1, precio: 20000, dscto: 0, subtotal: 20000 }],
      })
      .expect(200)

    expect(res.body.success).toBe(true)
    // Allow the void .catch() to settle
    await new Promise((r) => setTimeout(r, 20))
  })
})
