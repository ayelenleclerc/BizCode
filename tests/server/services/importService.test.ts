import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ImportService } from '../../../apps/server/services/ImportService'

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

  it('skips existing clientes when duplicateMode=skip', async () => {
    prisma = {
      cliente: {
        findMany: vi.fn().mockResolvedValue([{ id: 5, codigo: 10 }]),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: PrismaClient) => Promise<void>) => callback(prisma)),
    } as unknown as PrismaClient
    service = new ImportService(prisma)

    const result = await service.importClientes(
      1,
      [{ codigo: '10', rsocial: 'Uno', condIva: 'RI', activo: 'true' }],
      { duplicateMode: 'skip' },
    )
    expect(result.skipped).toBe(1)
    expect(result.created).toBe(0)
    expect(prisma.cliente.create).not.toHaveBeenCalled()
  })

  it('updates existing clientes when duplicateMode=update', async () => {
    prisma = {
      cliente: {
        findMany: vi.fn().mockResolvedValue([{ id: 5, codigo: 10 }]),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 5 }),
      },
      $transaction: vi.fn(async (callback: (tx: PrismaClient) => Promise<void>) => callback(prisma)),
    } as unknown as PrismaClient
    service = new ImportService(prisma)

    const result = await service.importClientes(
      1,
      [{ codigo: '10', rsocial: 'Uno', condIva: 'RI', activo: 'true' }],
      { duplicateMode: 'update' },
    )
    expect(result.updated).toBe(1)
    expect(prisma.cliente.update).toHaveBeenCalled()
  })

  it('imports proveedores and aborts todo_o_nada on validation errors', async () => {
    prisma = {
      proveedor: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: 1 }),
        update: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (tx: PrismaClient) => Promise<void>) => callback(prisma)),
    } as unknown as PrismaClient
    service = new ImportService(prisma)

    const ok = await service.importProveedores(1, [
      { codigo: '2001', rsocial: 'Prov', condIva: 'RI', activo: 'true' },
    ])
    expect(ok.created).toBe(1)

    const aborted = await service.importProveedores(
      1,
      [{ codigo: 'x', rsocial: '', condIva: 'RI', activo: 'true' }],
      { modo: 'todo_o_nada' },
    )
    expect(aborted.created).toBe(0)
    expect(aborted.errors.length).toBeGreaterThan(0)
  })
})
