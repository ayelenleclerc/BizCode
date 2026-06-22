import { describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import type { PrismaClient } from '@prisma/client'
import { PortalFacturaService } from '../../../apps/server/services/PortalFacturaService'

vi.mock('../../../apps/server/fiscal/ar/facturaPdf', () => ({
  buildFacturaPdfBuffer: vi.fn().mockResolvedValue({ ok: true, data: Buffer.from('pdf') }),
}))

function buildPrisma(): PrismaClient {
  const fecha = new Date('2026-01-01T00:00:00.000Z')
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        activo: true,
        creditDays: 30,
      }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 100,
          tipo: 'B',
          prefijo: '1',
          numero: 99,
          fecha,
          total: new Decimal('1210.00'),
          estado: 'A',
        },
      ]),
      findFirst: vi.fn().mockResolvedValue({
        id: 100,
        tenantId: 1,
        clienteId: 10,
        estado: 'A',
      }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([
        { facturaId: 100, _sum: { importe: new Decimal('200.00') } },
      ]),
    },
  } as unknown as PrismaClient
}

describe('PortalFacturaService', () => {
  it('lists cliente facturas with computed estado and pagination', async () => {
    const prisma = buildPrisma()
    const service = new PortalFacturaService(prisma)
    const result = await service.list(1, 10, {}, 10, 0)
    expect(result.total).toBe(1)
    expect(result.facturas[0]?.ref).toBe('B-0001-00000099')
    expect(result.facturas[0]?.pendiente).toBe('1010.00')
    expect(result.facturas[0]?.estado).toBe('vencida')
  })

  it('returns empty list when cliente has no facturas', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.factura.findMany).mockResolvedValueOnce([])
    const service = new PortalFacturaService(prisma)
    const result = await service.list(1, 10, {}, 10, 0)
    expect(result).toEqual({ facturas: [], total: 0 })
  })

  it('applies fecha filters when listing facturas', async () => {
    const prisma = buildPrisma()
    const service = new PortalFacturaService(prisma)
    const from = new Date('2026-01-01T00:00:00.000Z')
    const to = new Date('2026-06-30T00:00:00.000Z')
    await service.list(1, 10, { from, to }, 10, 0)
    expect(prisma.factura.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fecha: { gte: from, lte: to },
        }),
      }),
    )
  })

  it('returns empty list when cliente is missing', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.cliente.findFirst).mockResolvedValueOnce(null)
    const service = new PortalFacturaService(prisma)
    const result = await service.list(1, 999, {}, 10, 0)
    expect(result).toEqual({ facturas: [], total: 0 })
  })

  it('marks factura as pagada when fully paid', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.reciboCobroImputacion.groupBy).mockResolvedValueOnce([
      { facturaId: 100, _sum: { importe: new Decimal('1210.00') } },
    ] as never)
    const service = new PortalFacturaService(prisma)
    const result = await service.list(1, 10, {}, 10, 0)
    expect(result.facturas[0]?.estado).toBe('pagada')
    expect(result.facturas[0]?.pendiente).toBe('0.00')
  })

  it('filters facturas by estado when requested', async () => {
    const prisma = buildPrisma()
    const service = new PortalFacturaService(prisma)
    const result = await service.list(1, 10, { estado: 'pagada' }, 10, 0)
    expect(result.total).toBe(0)
    expect(result.facturas).toEqual([])
  })

  it('getPdfBuffer delegates to fiscal pdf builder', async () => {
    const prisma = buildPrisma()
    const service = new PortalFacturaService(prisma)
    const result = await service.getPdfBuffer(1, 10, 100)
    expect(result.ok).toBe(true)
  })

  it('getPdfBuffer returns 404 when factura is not owned by cliente', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.factura.findFirst).mockResolvedValueOnce(null)
    const service = new PortalFacturaService(prisma)
    const result = await service.getPdfBuffer(1, 10, 404)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(404)
    }
  })
})
