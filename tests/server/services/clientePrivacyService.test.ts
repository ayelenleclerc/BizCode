import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  ANONYMIZE_CONFIRM_TOKEN,
  buildAnonymizedClienteData,
  ClientePrivacyService,
  exportDatosToCsv,
  type ClientePrivacyExport,
} from '../../../apps/server/services/ClientePrivacyService'

const baseCliente = {
  id: 5,
  tenantId: 1,
  codigo: 500,
  rsocial: 'Privacy SA',
  fantasia: 'Priv',
  cuit: '20-11111111-1',
  condIva: 'RI',
  domicilio: 'Calle 1',
  localidad: 'CABA',
  cpost: '1000',
  telef: '111',
  email: 'p@example.com',
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: new Decimal(0),
  balanceInicial: new Decimal(0),
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  listaPrecioId: null,
  anonymizedAt: null as Date | null,
  cbu: null as string | null,
  alias: null as string | null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('ClientePrivacyService helpers', () => {
  it('builds irreversible PII scrub payload', () => {
    const now = new Date('2026-07-30T15:00:00.000Z')
    const data = buildAnonymizedClienteData(42, now)
    expect(data.rsocial).toBe('ANON-42')
    expect(data.fantasia).toBeNull()
    expect(data.cuit).toBeNull()
    expect(data.email).toBeNull()
    expect(data.telef).toBeNull()
    expect(data.domicilio).toBeNull()
    expect(data.activo).toBe(false)
    expect(data.suspended).toBe(true)
    expect(data.anonymizedAt).toEqual(now)
  })

  it('truncates long anonymized labels to varchar(30)', () => {
    const data = buildAnonymizedClienteData(123456789012345, new Date())
    expect(String(data.rsocial).length).toBeLessThanOrEqual(30)
  })

  it('exports a CSV package with related sections', () => {
    const payload: ClientePrivacyExport = {
      exportedAt: '2026-07-30T15:00:00.000Z',
      cliente: baseCliente,
      facturas: [
        {
          id: 9,
          fecha: '2026-01-01T00:00:00.000Z',
          tipo: 'B',
          prefijo: '0001',
          numero: 1,
          total: '121',
          estado: 'A',
        },
      ],
      cobros: [
        {
          id: 2,
          fecha: '2026-01-02T00:00:00.000Z',
          monto: '50',
          referencia: 'REF',
        },
      ],
      pedidos: [
        {
          id: 3,
          createdAt: '2026-01-03T00:00:00.000Z',
          estado: 'confirmed',
          total: '10',
        },
      ],
      recibosCobro: [
        {
          id: 4,
          numero: 8,
          fecha: '2026-01-04T00:00:00.000Z',
          totalCobrado: '50',
          estado: 'emitido',
        },
      ],
    }
    const csv = exportDatosToCsv(payload)
    expect(csv).toContain('cliente,rsocial,Privacy SA')
    expect(csv).toContain('factura,9,')
    expect(csv).toContain('cobro,2,')
    expect(csv).toContain('pedido,3,')
    expect(csv).toContain('recibo,4,')
    expect(ANONYMIZE_CONFIRM_TOKEN).toBe('ANONYMIZE')
  })

  it('escapes CSV values with commas and quotes', () => {
    const payload: ClientePrivacyExport = {
      exportedAt: '2026-07-30T15:00:00.000Z',
      cliente: { ...baseCliente, rsocial: 'Acme, "SA"' },
      facturas: [],
      cobros: [],
      pedidos: [],
      recibosCobro: [],
    }
    const csv = exportDatosToCsv(payload)
    expect(csv).toContain('cliente,rsocial,"Acme, ""SA"""')
  })
})

describe('ClientePrivacyService', () => {
  let prisma: PrismaClient
  let service: ClientePrivacyService

  beforeEach(() => {
    prisma = {
      cliente: {
        findFirst: vi.fn().mockResolvedValue(baseCliente),
        update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          ...baseCliente,
          ...data,
        })),
      },
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            fecha: new Date('2026-02-01T00:00:00.000Z'),
            tipo: 'B',
            prefijo: '0001',
            numero: 10,
            total: new Decimal(121),
            estado: 'A',
          },
        ]),
      },
      cobro: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 2,
            fecha: new Date('2026-02-02T00:00:00.000Z'),
            monto: new Decimal(20),
            referencia: 'x',
          },
        ]),
      },
      pedido: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 3,
            createdAt: new Date('2026-02-03T00:00:00.000Z'),
            estado: 'draft',
            total: new Decimal(5),
          },
        ]),
      },
      reciboCobro: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 4,
            numero: 1,
            fecha: new Date('2026-02-04T00:00:00.000Z'),
            totalCobrado: new Decimal(20),
            estado: 'emitido',
          },
        ]),
      },
      portalSession: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      portalMagicLink: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(prisma)),
    } as unknown as PrismaClient
    service = new ClientePrivacyService(prisma)
  })

  it('exports related summaries for a customer', async () => {
    const result = await service.exportDatos(1, 5)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.cliente.id).toBe(5)
    expect(result.data.facturas).toHaveLength(1)
    expect(result.data.cobros[0]?.monto).toBe('20')
    expect(result.data.pedidos[0]?.total).toBe('5')
    expect(result.data.recibosCobro[0]?.totalCobrado).toBe('20')
  })

  it('returns 404 when exporting missing customer', async () => {
    ;(prisma.cliente.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const result = await service.exportDatos(1, 99)
    expect(result).toEqual({ ok: false, status: 404, error: 'Cliente not found' })
  })

  it('anonymizes and revokes portal access', async () => {
    const result = await service.anonymize(1, 5, 'ANONYMIZE')
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.rsocial).toBe('ANON-5')
    expect(prisma.portalSession.updateMany).toHaveBeenCalled()
    expect(prisma.portalMagicLink.updateMany).toHaveBeenCalled()
  })

  it('rejects wrong confirm token and already-anonymized rows', async () => {
    expect(await service.anonymize(1, 5, 'nope')).toMatchObject({ ok: false, status: 400 })
    ;(prisma.cliente.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...baseCliente,
      anonymizedAt: new Date(),
    })
    expect(await service.anonymize(1, 5, 'ANONYMIZE')).toMatchObject({ ok: false, status: 409 })
    ;(prisma.cliente.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    expect(await service.anonymize(1, 5, 'ANONYMIZE')).toMatchObject({ ok: false, status: 404 })
  })
})
