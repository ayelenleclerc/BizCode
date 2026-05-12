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
})
