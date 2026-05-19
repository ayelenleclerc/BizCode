import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { buildFacturaPdfBuffer } from '../../../server/fiscal/ar/facturaPdf'

const facturaBase = {
  id: 7,
  tipo: 'B',
  prefijo: '0001',
  numero: 42,
  fecha: new Date('2026-01-10T12:00:00.000Z'),
  total: { toString: () => '121' },
  neto1: { toString: () => '100' },
  neto2: { toString: () => '0' },
  neto3: { toString: () => '0' },
  iva1: { toString: () => '21' },
  iva2: { toString: () => '0' },
  cae: '70000000000007',
  caeVto: new Date('2026-01-20T12:00:00.000Z'),
  estadoCae: 'issued',
  cliente: { rsocial: 'ACME', cuit: '20123456789', domicilio: 'CABA' },
  items: [
    {
      cantidad: 1,
      precio: { toString: () => '100' },
      dscto: { toString: () => '0' },
      subtotal: { toString: () => '100' },
      articulo: { descripcion: 'Producto' },
    },
  ],
}

describe('buildFacturaPdfBuffer', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = {
      factura: {
        findFirst: vi.fn().mockResolvedValue(facturaBase),
      },
      paramEmpresa: {
        findUnique: vi.fn().mockResolvedValue({
          nombre: 'BizCode Demo',
          cuit: '30123456789',
          domicilio: 'Buenos Aires',
        }),
      },
    } as unknown as PrismaClient
  })

  it('returns PDF buffer for issued CAE', async () => {
    const result = await buildFacturaPdfBuffer(prisma, 1, 7, { preview: false })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subarray(0, 4).toString()).toBe('%PDF')
    }
  })

  it('allows preview without issued CAE', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({
      ...facturaBase,
      cae: null,
      caeVto: null,
      estadoCae: 'pending',
    } as never)
    const result = await buildFacturaPdfBuffer(prisma, 1, 7, { preview: true })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subarray(0, 4).toString()).toBe('%PDF')
    }
  })

  it('returns 422 when download requested without issued CAE', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({
      ...facturaBase,
      cae: null,
      estadoCae: 'pending',
    } as never)
    const result = await buildFacturaPdfBuffer(prisma, 1, 7, { preview: false })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('CAE_NOT_ISSUED')
    }
  })
})
