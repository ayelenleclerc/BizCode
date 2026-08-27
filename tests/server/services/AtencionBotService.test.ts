/**
 * @en Unit tests for AtencionBotService orchestration (#201).
 * @es Tests unitarios de orquestación AtencionBotService (#201).
 * @pt-BR Testes unitários de orquestração AtencionBotService (#201).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'

const sendWhatsAppMessageMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ sent: true }),
)
const isTwilioConfiguredMock = vi.hoisted(() => vi.fn(() => true))
const notifyManagersMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const getModulesForTenantMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue(['comms.whatsapp']),
)
const getEstadoCreditoMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    deudaTotal: '1500.00',
    deudaVencida: '200.00',
    facturasPendientes: [{ id: 10, saldo: '200.00', vencimiento: '2026-01-01', diasMora: 5 }],
  }),
)
const createPaymentForInvoiceMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: { checkoutUrl: 'https://mp.example/checkout/10', provider: 'mercadopago' },
  }),
)

vi.mock('../../../apps/server/channels', () => ({
  isTwilioConfigured: isTwilioConfiguredMock,
  sendWhatsAppMessage: sendWhatsAppMessageMock,
}))

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: notifyManagersMock,
}))

vi.mock('../../../apps/server/services/TenantConfigService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../apps/server/services/TenantConfigService')>()
  return {
    ...actual,
    TenantConfigService: class {
      getModulesForTenant = getModulesForTenantMock
    },
  }
})

vi.mock('../../../apps/server/services/SellerAlertService', () => ({
  SellerAlertService: class {
    getEstadoCredito = getEstadoCreditoMock
  },
}))

vi.mock('../../../apps/server/payments/PaymentService', () => ({
  PaymentService: class {
    createPaymentForInvoice = createPaymentForInvoiceMock
  },
}))

import { AtencionBotService } from '../../../apps/server/services/AtencionBotService'

function buildPrisma() {
  const session = {
    id: 1,
    phoneDigits: '5491155551234',
    tenantId: 1 as number | null,
    clienteId: 2 as number | null,
    locale: 'es',
    pendingStep: null as string | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return {
    session,
    prisma: {
      atencionBotSession: {
        findUnique: vi.fn().mockResolvedValue(session),
        create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          ...session,
          ...data,
          id: 1,
          updatedAt: new Date(),
        })),
        update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
          Object.assign(session, data)
          session.updatedAt = new Date()
          return { ...session }
        }),
        delete: vi.fn(),
      },
      cliente: {
        findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      pedido: {
        findFirst: vi.fn().mockResolvedValue({
          id: 99,
          estado: 'shipped',
          total: { toFixed: () => '500.00' },
        }),
      },
      $queryRaw: vi.fn().mockResolvedValue([
        { id: 2, tenantId: 1, cuit: '20123456789', rsocial: 'ACME', telef: '1155551234' },
      ]),
    } as unknown as PrismaClient,
  }
}

describe('AtencionBotService (#201)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isTwilioConfiguredMock.mockReturnValue(true)
    getModulesForTenantMock.mockResolvedValue(['comms.whatsapp'])
  })

  it('returns handled false when Twilio is off', async () => {
    isTwilioConfiguredMock.mockReturnValue(false)
    const { prisma } = buildPrisma()
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({ fromRaw: 'whatsapp:+5491155551234', body: 'saldo' })
    expect(result.handled).toBe(false)
    expect(sendWhatsAppMessageMock).not.toHaveBeenCalled()
  })

  it('replies with balance for saldo intent when client resolved', async () => {
    const { prisma, session } = buildPrisma()
    session.tenantId = 1
    session.clienteId = 2
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({ fromRaw: 'whatsapp:+5491155551234', body: 'saldo' })
    expect(result.handled).toBe(true)
    expect(result.reply).toMatch(/1500\.00/)
    expect(sendWhatsAppMessageMock).toHaveBeenCalled()
  })

  it('replies with order status', async () => {
    const { prisma, session } = buildPrisma()
    session.tenantId = 1
    session.clienteId = 2
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({
      fromRaw: 'whatsapp:+5491155551234',
      body: 'estado del pedido',
    })
    expect(result.reply).toMatch(/#99/)
    expect(result.reply).toMatch(/shipped/)
  })

  it('returns payment link for pagar', async () => {
    const { prisma, session } = buildPrisma()
    session.tenantId = 1
    session.clienteId = 2
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({ fromRaw: 'whatsapp:+5491155551234', body: 'pagar' })
    expect(result.reply).toContain('https://mp.example/checkout/10')
    expect(createPaymentForInvoiceMock).toHaveBeenCalledWith(1, 10)
  })

  it('escalates unknown intents to managers', async () => {
    const { prisma, session } = buildPrisma()
    session.tenantId = 1
    session.clienteId = 2
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({
      fromRaw: 'whatsapp:+5491155551234',
      body: 'quiero hablar con un humano',
    })
    expect(result.reply).toMatch(/agente|staff|atendente/i)
    expect(notifyManagersMock).toHaveBeenCalledWith(
      prisma,
      1,
      'atencion_bot_escalation',
      expect.objectContaining({ clienteId: 2 }),
    )
  })

  it('asks for CUIT when phone is ambiguous / unmatched', async () => {
    const { prisma, session } = buildPrisma()
    session.tenantId = null
    session.clienteId = null
    ;(prisma.$queryRaw as ReturnType<typeof vi.fn>).mockResolvedValue([])
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({ fromRaw: 'whatsapp:+5491155559999', body: 'saldo' })
    expect(result.reply).toMatch(/CUIT/i)
    expect(sendWhatsAppMessageMock).toHaveBeenCalled()
  })

  it('replies inactive when comms.whatsapp module is off', async () => {
    getModulesForTenantMock.mockResolvedValue([])
    const { prisma, session } = buildPrisma()
    session.tenantId = 1
    session.clienteId = 2
    const svc = new AtencionBotService(prisma)
    const result = await svc.handleInbound({ fromRaw: 'whatsapp:+5491155551234', body: 'saldo' })
    expect(result.reply).toMatch(/no está disponible|not available|não está disponível/i)
  })
})
