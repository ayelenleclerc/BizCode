import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ArcaService } from '../../../server/fiscal/ar/ArcaService'
import { encryptFiscalSecret } from '../../../server/fiscal/ar/fiscalSecrets'

describe('ArcaService', () => {
  let prisma: PrismaClient
  let service: ArcaService

  beforeEach(() => {
    prisma = {
      tenantFiscalConfig: {
        findUnique: vi.fn().mockResolvedValue({
          cuit: '20123456789',
          ambiente: 'homologacion',
          certEncrypted: encryptFiscalSecret('cert'),
          keyEncrypted: encryptFiscalSecret('key'),
        }),
        upsert: vi.fn().mockResolvedValue({ id: 1 }),
      },
      factura: {
        findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B' }),
        findMany: vi.fn().mockResolvedValue([{ id: 9 }]),
        update: vi.fn().mockResolvedValue({}),
      },
    } as unknown as PrismaClient
    service = new ArcaService(prisma)
  })

  it('issues mock CAE when config exists', async () => {
    const result = await service.requestCaeForFactura(1, 9)
    expect(result.ok).toBe(true)
    expect(prisma.factura.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'issued' }) }),
    )
  })

  it('getConfigStatus omits secrets', async () => {
    const status = await service.getConfigStatus(1)
    expect(status.configured).toBe(true)
    expect(status.cuit).toBe('20123456789')
    expect(status).not.toHaveProperty('certEncrypted')
  })

  it('marks failed only when fiscal config missing', async () => {
    vi.mocked(prisma.tenantFiscalConfig.findUnique).mockResolvedValue(null)
    const result = await service.requestCaeForFactura(1, 9)
    expect(result.ok).toBe(false)
    expect(prisma.factura.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estadoCae: 'failed' } }),
    )
  })

  it('rejects unsupported invoice tipo via mock', async () => {
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({ id: 9, total: 100, tipo: 'X' } as never)
    const result = await service.requestCaeForFactura(1, 9)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.status).toBe(502)
    expect(prisma.factura.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'pending' }) }),
    )
  })

  it('retryPending processes pending rows', async () => {
    const summary = await service.retryPending(1)
    expect(summary.processed).toBe(1)
    expect(summary.issued).toBeGreaterThanOrEqual(0)
  })
})
