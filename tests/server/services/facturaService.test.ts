import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FacturaService } from '../../../apps/server/services/FacturaService'
import { createCcTxLayer } from '../../helpers/movimientoClienteCcPrismaMock'
import { Decimal } from '@prisma/client/runtime/library'

const baseFacturaInput = {
  fecha: '2026-05-01',
  tipo: 'B' as const,
  prefijo: '0001',
  numero: 1,
  clienteId: 3,
  neto1: 0,
  neto2: 0,
  neto3: 0,
  iva1: 0,
  iva2: 0,
  total: 100,
  items: [{ articuloId: 7, cantidad: 1, precio: 100, dscto: 0, subtotal: 100 }],
}

describe('FacturaService', () => {
  let prisma: PrismaClient
  let service: FacturaService

  beforeEach(() => {
    prisma = {
      articulo: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 7,
            codigo: 7,
            descripcion: 'Art',
            stock: 10,
            minimo: 0,
            tipo: 'articulo',
            condIva: '1',
            unidadServicio: null,
          },
        ]),
      },
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      factura: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      notaCredito: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { monto: null } }),
      },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new FacturaService(prisma)
  })

  it('rejects create when clienteId is not in tenant', async () => {
    const result = await service.create(1, baseFacturaInput, 1)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('clienteId')
    }
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('rejects create when cliente is suspended', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ suspended: true } as never)

    const result = await service.create(1, baseFacturaInput, 1)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('CLIENT_SUSPENDED')
    }
  })

  it('void creates NotaCredito with not_required when origin has no issued CAE', async () => {
    const facturaRow = {
      id: 1,
      estado: 'A',
      total: new Decimal(100),
      clienteId: 3,
      estadoCae: 'pending',
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
    }
    const notaRow = {
      id: 9,
      estadoCae: 'not_required',
      facturaOrigenId: 1,
      monto: new Decimal(100),
      createdAt: new Date(),
    }
    const tx = {
      ...createCcTxLayer(),
      factura: { update: vi.fn().mockResolvedValue({ ...facturaRow, estado: 'N' }) },
      notaCredito: { create: vi.fn().mockResolvedValue(notaRow) },
      retencionAplicada: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    }
    vi.mocked(prisma.factura.findFirst).mockResolvedValue(facturaRow as never)
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') return fn(tx as never)
      return fn
    })

    const result = await service.void(1, 1, 'Motivo largo', { userId: 1, ipAddress: '127.0.0.1' })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.notaCredito.estadoCae).toBe('not_required')
      expect(tx.notaCredito.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'not_required' }) }),
      )
    }
  })

  it('void creates final NC for remaining balance after partial NCs (#344)', async () => {
    const facturaRow = {
      id: 1,
      estado: 'A',
      total: new Decimal(100),
      clienteId: 3,
      estadoCae: 'issued',
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
    }
    const notaRow = {
      id: 10,
      estadoCae: 'pending',
      facturaOrigenId: 1,
      monto: new Decimal(70),
      createdAt: new Date(),
    }
    const tx = {
      ...createCcTxLayer(),
      factura: { update: vi.fn().mockResolvedValue({ ...facturaRow, estado: 'N' }) },
      notaCredito: { create: vi.fn().mockResolvedValue(notaRow) },
      retencionAplicada: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    }
    vi.mocked(prisma.factura.findFirst).mockResolvedValue(facturaRow as never)
    vi.mocked(prisma.notaCredito.aggregate).mockResolvedValue({
      _sum: { monto: new Decimal(30) },
    } as never)
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') return fn(tx as never)
      return fn
    })

    const result = await service.void(1, 1, 'Motivo largo', { userId: 1, ipAddress: '127.0.0.1' })

    expect(result.ok).toBe(true)
    expect(tx.notaCredito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monto: new Decimal(70), estadoCae: 'pending' }),
      }),
    )
  })

  it('void rejects when invoice is already fully credited (#344)', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({
      id: 1,
      estado: 'A',
      total: new Decimal(100),
      clienteId: 3,
      estadoCae: 'pending',
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
    } as never)
    vi.mocked(prisma.notaCredito.aggregate).mockResolvedValue({
      _sum: { monto: new Decimal(100) },
    } as never)

    const result = await service.void(1, 1, 'Motivo largo', { userId: 1, ipAddress: '127.0.0.1' })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('Invoice already fully credited')
    }
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('createPartialCreditNote issues NC without voiding factura (#344)', async () => {
    const facturaRow = {
      id: 1,
      estado: 'A',
      total: new Decimal(100),
      clienteId: 3,
      estadoCae: 'pending',
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
    }
    const notaRow = {
      id: 12,
      estadoCae: 'not_required',
      facturaOrigenId: 1,
      monto: new Decimal(25),
      createdAt: new Date(),
    }
    const tx = {
      ...createCcTxLayer(),
      notaCredito: { create: vi.fn().mockResolvedValue(notaRow) },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    }
    vi.mocked(prisma.factura.findFirst).mockResolvedValue(facturaRow as never)
    vi.mocked(prisma.notaCredito.aggregate).mockResolvedValue({ _sum: { monto: null } } as never)
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
      if (typeof fn === 'function') return fn(tx as never)
      return fn
    })

    const result = await service.createPartialCreditNote(
      1,
      1,
      new Decimal(25),
      'Devolución parcial',
      { userId: 1, ipAddress: '127.0.0.1' },
    )

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.notaCredito.monto).toEqual(new Decimal(25))
    }
    expect(tx.notaCredito.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ monto: new Decimal(25), estadoCae: 'not_required' }),
      }),
    )
  })

  it('createPartialCreditNote rejects when total NCs would exceed invoice (#344)', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({
      id: 1,
      estado: 'A',
      total: new Decimal(100),
      clienteId: 3,
      estadoCae: 'pending',
      tipo: 'B',
      prefijo: '0001',
      numero: 1,
    } as never)
    vi.mocked(prisma.notaCredito.aggregate).mockResolvedValue({
      _sum: { monto: new Decimal(80) },
    } as never)

    const result = await service.createPartialCreditNote(
      1,
      1,
      new Decimal(30),
      'Devolución parcial',
      { userId: 1, ipAddress: '127.0.0.1' },
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('Total credit notes would exceed invoice total')
    }
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
