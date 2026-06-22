import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { buildRemitoPdfBuffer, remitoPdfFilename } from '../../../../apps/server/fiscal/ar/remitoPdf'

const remitoBase = {
  id: 3,
  tenantId: 1,
  prefijo: '0001',
  numero: 5,
  tipo: 'remito_x',
  estado: 'emitido',
  fecha: new Date('2026-06-01T12:00:00.000Z'),
  observaciones: 'Obs',
  firmadoPor: 'Juan Pérez',
  cliente: { rsocial: 'ACME', cuit: '20123456789', domicilio: 'CABA', condIva: 'RI' },
  proveedor: null,
  items: [{ descripcion: 'Producto', cantidad: 2, unidad: 'UN' }],
}

describe('buildRemitoPdfBuffer', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = {
      remito: {
        findFirst: vi.fn().mockResolvedValue(remitoBase),
      },
      paramEmpresa: {
        findFirst: vi.fn().mockResolvedValue({
          nombre: 'BizCode Demo',
          cuit: '30-12345678-9',
          domicilio: 'Buenos Aires',
          condicionIva: 'RI',
        }),
      },
    } as unknown as PrismaClient
  })

  it('returns PDF buffer for emitido remito', async () => {
    const result = await buildRemitoPdfBuffer(prisma, 1, 3)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.subarray(0, 4).toString()).toBe('%PDF')
      expect(result.data.length).toBeGreaterThan(500)
    }
  })

  it('returns 404 when remito is missing', async () => {
    vi.mocked(prisma.remito.findFirst).mockResolvedValue(null)
    const result = await buildRemitoPdfBuffer(prisma, 1, 99)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(404)
    }
  })

  it('returns 409 for borrador remito', async () => {
    vi.mocked(prisma.remito.findFirst).mockResolvedValue({ ...remitoBase, estado: 'borrador' } as never)
    const result = await buildRemitoPdfBuffer(prisma, 1, 3)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.error).toBe('REMITO_PDF_NOT_AVAILABLE')
    }
  })

  it('returns 409 for anulado remito', async () => {
    vi.mocked(prisma.remito.findFirst).mockResolvedValue({ ...remitoBase, estado: 'anulado' } as never)
    const result = await buildRemitoPdfBuffer(prisma, 1, 3)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
    }
  })
})

describe('remitoPdfFilename', () => {
  it('formats filename with prefijo and numero', () => {
    expect(remitoPdfFilename(1, '0001', 5)).toBe('REM-0001-00000005.pdf')
  })

  it('falls back to id when borrador', () => {
    expect(remitoPdfFilename(9, null, null)).toBe('remito-9.pdf')
  })
})
