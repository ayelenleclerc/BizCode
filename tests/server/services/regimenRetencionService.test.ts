import { Decimal } from '@prisma/client/runtime/library'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegimenRetencionService } from '../../../apps/server/services/RegimenRetencionService'

function buildPrisma() {
  const regimenRow = {
    id: 1,
    tenantId: 1,
    tipo: 'ganancias',
    subtipo: 'retencion',
    nombre: 'Ganancias servicios',
    alicuota: new Decimal(4.5),
    alicuotaMin: null,
    provincia: null,
    activo: true,
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  }
  return {
    regimenRetencion: {
      findMany: vi.fn().mockResolvedValue([regimenRow]),
      create: vi.fn().mockResolvedValue(regimenRow),
      findFirst: vi.fn().mockResolvedValue(regimenRow),
      update: vi.fn().mockResolvedValue({ ...regimenRow, alicuota: new Decimal(5) }),
    },
  }
}

describe('RegimenRetencionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('list returns tenant regimes', async () => {
    const prisma = buildPrisma()
    const service = new RegimenRetencionService(prisma as never)
    const rows = await service.list(1)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.tipo).toBe('ganancias')
    expect(rows[0]?.alicuota).toBe('4.5')
  })

  it('create persists regime', async () => {
    const prisma = buildPrisma()
    const service = new RegimenRetencionService(prisma as never)
    const row = await service.create(1, {
      tipo: 'iva',
      subtipo: 'retencion',
      nombre: 'IVA servicios',
      alicuota: 10.5,
    })
    expect(row.nombre).toBe('Ganancias servicios')
    expect(prisma.regimenRetencion.create).toHaveBeenCalled()
  })

  it('update throws when not found', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.regimenRetencion.findFirst).mockResolvedValue(null)
    const service = new RegimenRetencionService(prisma as never)
    await expect(service.update(1, 99, { activo: false })).rejects.toThrow(/not found/i)
  })
})
