import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ProveedorHistorialService } from '../../../apps/server/services/ProveedorHistorialService'

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 1 }),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    ordenCompra: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    reciboPagoFactura: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ProveedorHistorialService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when proveedor does not exist', async () => {
    const prisma = buildPrisma({
      proveedor: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const svc = new ProveedorHistorialService(prisma)
    const result = await svc.getHistorial(1, 99, 90)
    expect(result).toBeNull()
  })

  it('computes PPP from three purchases at different prices', async () => {
    const asOf = new Date('2026-06-10T12:00:00.000Z')
    const prisma = buildPrisma({
      ordenCompra: {
        findMany: vi.fn().mockResolvedValue([
          {
            updatedAt: new Date('2026-06-01'),
            items: [
              {
                cantidadRecibida: 10,
                costoUnitario: new Decimal(100),
                articulo: { id: 5, codigo: 'A1', descripcion: 'Artículo A' },
              },
            ],
          },
          {
            updatedAt: new Date('2026-06-05'),
            items: [
              {
                cantidadRecibida: 5,
                costoUnitario: new Decimal(110),
                articulo: { id: 5, codigo: 'A1', descripcion: 'Artículo A' },
              },
            ],
          },
          {
            updatedAt: new Date('2026-06-08'),
            items: [
              {
                cantidadRecibida: 5,
                costoUnitario: new Decimal(120),
                articulo: { id: 5, codigo: 'A1', descripcion: 'Artículo A' },
              },
            ],
          },
        ]),
      },
    })
    const svc = new ProveedorHistorialService(prisma)
    const { articulos } = (await svc.getArticulos(1, 1, 90, asOf))!
    expect(articulos).toHaveLength(1)
    // (10*100 + 5*110 + 5*120) / 20 = 107.50
    expect(articulos[0]?.precioPromedioPonderado).toBe('107.50')
    expect(articulos[0]?.cantidadTotal).toBe(20)
    expect(articulos[0]?.evolucionPrecios).toHaveLength(3)
  })

  it('aggregates historial total from comprobantes and lists payment status', async () => {
    const asOf = new Date('2026-06-10T12:00:00.000Z')
    const prisma = buildPrisma({
      comprobanteCompra: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 7,
            fecha: new Date('2026-06-02'),
            tipo: 'B',
            prefijo: '0001',
            numero: 3,
            total: new Decimal(500),
            ordenCompraId: null,
          },
        ]),
      },
      reciboPagoFactura: {
        groupBy: vi.fn().mockResolvedValue([
          { comprobanteCompraId: 7, _sum: { monto: new Decimal(200) } },
        ]),
      },
    })
    const svc = new ProveedorHistorialService(prisma)
    const historial = (await svc.getHistorial(1, 1, 30, asOf))!
    expect(historial.totalComprado).toBe('500.00')
    expect(historial.compras[0]?.estadoPago).toBe('parcial')
    expect(historial.compras[0]?.referencia).toBe('B-0001-3')
  })

  it('computes purchase frequency when multiple comprobantes exist', async () => {
    const asOf = new Date('2026-06-20T12:00:00.000Z')
    const prisma = buildPrisma({
      comprobanteCompra: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            fecha: new Date('2026-06-01'),
            tipo: 'B',
            prefijo: '0001',
            numero: 1,
            total: new Decimal(100),
            ordenCompraId: null,
          },
          {
            id: 2,
            fecha: new Date('2026-06-11'),
            tipo: 'B',
            prefijo: '0001',
            numero: 2,
            total: new Decimal(200),
            ordenCompraId: null,
          },
        ]),
      },
    })
    const svc = new ProveedorHistorialService(prisma)
    const historial = (await svc.getHistorial(1, 1, 90, asOf))!
    expect(historial.frecuenciaCompraDias).toBe(10)
    expect(historial.cantidadCompras).toBe(2)
  })
})
