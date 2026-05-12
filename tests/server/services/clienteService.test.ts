import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ClienteService } from '../../../server/services/ClienteService'

describe('ClienteService', () => {
  let prisma: PrismaClient
  let service: ClienteService

  beforeEach(() => {
    prisma = {
      deliveryZone: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      cliente: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    } as unknown as PrismaClient
    service = new ClienteService(prisma)
  })

  it('rejects create when deliveryZoneId is not in tenant', async () => {
    const result = await service.create(1, {
      codigo: 10,
      rsocial: 'Cliente SA',
      condIva: 'RI',
      activo: true,
      deliveryZoneId: 99,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('deliveryZoneId')
    }
    expect(prisma.cliente.create).not.toHaveBeenCalled()
  })

  it('returns 404 when updating a missing cliente', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue(null)

    const result = await service.update(
      1,
      404,
      {
        codigo: 10,
        rsocial: 'Cliente SA',
        condIva: 'RI',
        activo: true,
      },
      true,
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(404)
    }
  })
})
