import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  ComisionCalcService,
  computeComision,
  selectConfigForEvent,
} from '../../../apps/server/services/ComisionCalcService'

describe('ComisionCalc helpers (#237)', () => {
  it('computes percentage and fixed amount', () => {
    expect(computeComision('porcentaje_cobrado', 3, 1000)).toBe(30)
    expect(computeComision('porcentaje_facturado', 2.5, 200)).toBe(5)
    expect(computeComision('importe_fijo_por_venta', 50, 999)).toBe(50)
  })

  it('selects most specific vigente config (cliente > categoria > generic)', () => {
    const at = new Date('2026-07-15T00:00:00.000Z')
    const configs = [
      {
        id: 1,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 2,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: null,
        clienteId: null,
      },
      {
        id: 2,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 4,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: 9,
        clienteId: null,
      },
      {
        id: 3,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 5,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: null,
        articuloCategoriaId: null,
        clienteId: 44,
      },
    ]
    expect(selectConfigForEvent(configs, at, 44, [9])?.id).toBe(3)
    expect(selectConfigForEvent(configs, at, 1, [9])?.id).toBe(2)
    expect(selectConfigForEvent(configs, at, 1, [])?.id).toBe(1)
  })

  it('ignores configs outside vigencia', () => {
    const at = new Date('2026-07-15T00:00:00.000Z')
    const configs = [
      {
        id: 1,
        tipo: 'porcentaje_cobrado' as const,
        alicuota: 2,
        vigenciaDesde: '2026-01-01T00:00:00.000Z',
        vigenciaHasta: '2026-06-30T00:00:00.000Z',
        articuloCategoriaId: null,
        clienteId: null,
      },
    ]
    expect(selectConfigForEvent(configs, at, null, [])).toBeNull()
  })
})

describe('ComisionCalcService.calculateForVendedor (#237)', () => {
  it('returns empty result for invalid periodo', async () => {
    const prisma = {
      configComision: { findMany: vi.fn() },
    } as unknown as PrismaClient
    const svc = new ComisionCalcService(prisma)
    await expect(svc.calculateForVendedor(1, 3, 'bad')).resolves.toEqual({
      totalVentas: 0,
      totalComision: 0,
      lineas: [],
    })
    expect(prisma.configComision.findMany).not.toHaveBeenCalled()
  })

  it('computes lines from cobrado imputaciones', async () => {
    const eventDate = new Date('2026-07-10T00:00:00.000Z')
    const prisma = {
      configComision: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            tipo: 'porcentaje_cobrado',
            alicuota: new Decimal(3),
            vigenciaDesde: new Date('2026-01-01T00:00:00.000Z'),
            vigenciaHasta: null,
            articuloCategoriaId: null,
            clienteId: null,
          },
        ]),
      },
      reciboCobroImputacion: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 7,
            facturaId: 10,
            reciboCobroId: 2,
            importe: new Decimal(1000),
            reciboCobro: { id: 2, fecha: eventDate, numero: 55 },
            factura: {
              id: 10,
              clienteId: 1,
              total: new Decimal(1000),
              items: [{ articulo: { categoriaId: 9 } }],
            },
          },
        ]),
      },
      factura: { findMany: vi.fn() },
    } as unknown as PrismaClient
    const svc = new ComisionCalcService(prisma)
    const result = await svc.calculateForVendedor(1, 3, '2026-07')
    expect(result.totalVentas).toBe(1000)
    expect(result.totalComision).toBe(30)
    expect(result.lineas).toHaveLength(1)
    expect(result.lineas[0]?.imputacionId).toBe(7)
  })
})
