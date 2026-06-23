import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import {
  buildFacturaPdfBuffer,
  buildFacturaTicketPdfBuffer,
} from '../../../apps/server/fiscal/ar/facturaPdf'

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
  cliente: { rsocial: 'ACME', cuit: '20123456789', domicilio: 'CABA', condIva: 'RI' },
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
          cuit: '30-12345678-9',
          domicilio: 'Buenos Aires',
          condicionIva: 'RI',
          ingresosBrutos: '123456',
          fechaInicioActividades: new Date('2020-01-01T12:00:00.000Z'),
        }),
      },
    } as unknown as PrismaClient
  })

  it('returns PDF buffer for issued CAE', async () => {
    const result = await buildFacturaPdfBuffer(prisma, 1, 7, { preview: false })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subarray(0, 4).toString()).toBe('%PDF')
      expect(result.data.length).toBeGreaterThan(2000)
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

describe('buildFacturaTicketPdfBuffer', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = {
      factura: {
        findFirst: vi.fn().mockResolvedValue(facturaBase),
      },
      paramEmpresa: {
        findUnique: vi.fn().mockResolvedValue({
          nombre: 'BizCode Demo',
          cuit: '30-12345678-9',
          domicilio: null,
          condicionIva: 'RI',
          ingresosBrutos: null,
          fechaInicioActividades: null,
        }),
      },
    } as unknown as PrismaClient
  })

  it('returns ticket PDF for any invoice', async () => {
    const result = await buildFacturaTicketPdfBuffer(prisma, 1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subarray(0, 4).toString()).toBe('%PDF')
    }
  })

  it('returns ticket PDF without CAE (non-fiscal path)', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({
      ...facturaBase,
      cae: null,
      caeVto: null,
      estadoCae: 'pending',
    } as never)
    const result = await buildFacturaTicketPdfBuffer(prisma, 1, 7)
    expect(result.ok).toBe(true)
  })
})
