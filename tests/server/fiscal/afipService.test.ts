import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { AfipService } from '../../../server/fiscal/ar/AfipService'
import { encryptFiscalSecret } from '../../../server/fiscal/ar/fiscalSecrets'

describe('AfipService', () => {
  let prisma: PrismaClient
  let service: AfipService

  beforeEach(() => {
    prisma = {
      tenantFiscalConfig: {
        findUnique: vi.fn().mockResolvedValue({
          cuit: '20123456789',
          certEncrypted: encryptFiscalSecret('cert'),
          keyEncrypted: encryptFiscalSecret('key'),
        }),
        upsert: vi.fn().mockResolvedValue({ id: 1 }),
      },
      factura: {
        findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100 }),
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaClient
    service = new AfipService(prisma)
  })

  it('issues mock CAE when config exists', async () => {
    const result = await service.requestCaeForFactura(1, 9)
    expect(result.ok).toBe(true)
    expect(prisma.factura.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'issued' }) }),
    )
  })
})
