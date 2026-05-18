import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ImportService } from '../../../server/services/ImportService'

describe('ImportService', () => {
  let prisma: PrismaClient
  let service: ImportService

  beforeEach(() => {
    prisma = {
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: PrismaClient) => Promise<void>) => callback(prisma)),
    } as unknown as PrismaClient
    service = new ImportService(prisma)
  })

  it('reports duplicate codigo rows during cliente import', async () => {
    const result = await service.importClientes(1, [
      {
        codigo: '10',
        rsocial: 'Uno',
        condIva: 'RI',
        activo: 'true',
      },
      {
        codigo: '10',
        rsocial: 'Dos',
        condIva: 'RI',
        activo: 'true',
      },
    ])

    expect(result.created).toBe(1)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]?.message).toContain('Duplicate codigo 10')
  })

  it('upserts rubros from DBF rows', async () => {
    const rubroFindUnique = vi.fn().mockResolvedValue(null)
    const rubroUpsert = vi.fn().mockResolvedValue({ id: 1, codigo: 1, nombre: 'General' })
    const tx = {
      rubro: { findUnique: rubroFindUnique, upsert: rubroUpsert },
    }
    prisma = {
      $transaction: vi.fn(async (callback: (inner: typeof tx) => Promise<void>) => callback(tx)),
    } as unknown as PrismaClient
    service = new ImportService(prisma)

    const result = await service.importRubrosFromDbf(1, [{ COD_RUBRO: 1, NOMBRE: 'General' }])

    expect(result.created).toBe(1)
    expect(result.updated).toBe(0)
    expect(rubroUpsert).toHaveBeenCalled()
  })

  it('rejects articulos when rubro codigo is unknown', async () => {
    prisma = {
      rubro: { findMany: vi.fn().mockResolvedValue([{ id: 10, codigo: 1 }]) },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new ImportService(prisma)

    const result = await service.importArticulosFromDbf(1, [
      {
        COD_ART: 100,
        DESCRIP: 'Sin rubro',
        COD_RUBRO: 99,
        COND_IVA: 1,
        UMEDIDA: 'UN',
        PRECIO1: 10,
        PRECIO2: 10,
        COSTO: 5,
        STOCK: 1,
        STOCK_MIN: 0,
        ACTIVO: true,
      },
    ])

    expect(result.created).toBe(0)
    expect(result.errors[0]?.message).toContain('Unknown rubro codigo 99')
  })
})
