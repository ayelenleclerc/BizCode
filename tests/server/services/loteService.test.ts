import { describe, expect, it, vi } from 'vitest'
import { LoteService } from '../../../apps/server/services/LoteService'
import { notifyManagers } from '../../../apps/server/notifications'

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: vi.fn().mockResolvedValue(undefined),
}))

const now = new Date('2026-07-25T10:00:00.000Z')

function buildLote(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 7,
    articuloId: 11,
    depositoId: 13,
    proveedorId: null,
    nroLote: 'LOT-001',
    fechaVencimiento: new Date('2026-12-31T00:00:00.000Z'),
    fechaIngreso: now,
    stockInicial: 10,
    stockActual: 10,
    activo: true,
    preavisoEnviadoAt: null,
    createdAt: now,
    updatedAt: now,
    articulo: { id: 11, codigo: 100, descripcion: 'Artículo' },
    deposito: { id: 13, codigo: 'DEP', nombre: 'Depósito' },
    ...overrides,
  }
}

function buildPrisma() {
  return {
    configFefo: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    articulo: { findFirst: vi.fn() },
    deposito: { findFirst: vi.fn() },
    lote: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    facturaItem: { findMany: vi.fn() },
  }
}

describe('LoteService (#202)', () => {
  it('reads, creates and updates FEFO configuration', async () => {
    const prisma = buildPrisma()
    const row = {
      id: 1,
      tenantId: 7,
      diasAlertaVencimiento: 30,
      createdAt: now,
      updatedAt: now,
    }
    prisma.configFefo.findUnique.mockResolvedValueOnce(row).mockResolvedValueOnce(null)
    prisma.configFefo.create.mockResolvedValue({ ...row, id: 2 })
    prisma.configFefo.upsert.mockResolvedValue({ ...row, diasAlertaVencimiento: 45 })
    const service = new LoteService(prisma as never)

    await expect(service.getConfig(7)).resolves.toMatchObject({ id: 1, createdAt: now.toISOString() })
    await expect(service.getConfig(7)).resolves.toMatchObject({ id: 2 })
    await expect(service.upsertConfig(7, { diasAlertaVencimiento: 0 })).resolves.toMatchObject({
      ok: false,
      status: 400,
    })
    await expect(service.upsertConfig(7, { diasAlertaVencimiento: 45 })).resolves.toMatchObject({
      ok: true,
      data: { diasAlertaVencimiento: 45 },
    })
  })

  it('lists and maps lots, including expiry filtering', async () => {
    const prisma = buildPrisma()
    const config = {
      id: 1,
      tenantId: 7,
      diasAlertaVencimiento: 30,
      createdAt: now,
      updatedAt: now,
    }
    prisma.configFefo.findUnique.mockResolvedValue(config)
    prisma.lote.findMany.mockResolvedValue([buildLote()])
    const service = new LoteService(prisma as never)

    const rows = await service.list(7, {
      articuloId: 11,
      depositoId: 13,
      soloActivos: false,
      porVencer: true,
    })

    expect(rows[0]).toMatchObject({
      nroLote: 'LOT-001',
      fechaVencimiento: '2026-12-31',
      preavisoEnviadoAt: null,
    })
    expect(prisma.lote.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 7, articuloId: 11, depositoId: 13 }),
      }),
    )
    await expect(service.listExpiring(7)).resolves.toHaveLength(1)
  })

  it('validates and creates a lot', async () => {
    const prisma = buildPrisma()
    prisma.articulo.findFirst.mockResolvedValue({ id: 11, controlLote: true, tipo: 'producto' })
    prisma.deposito.findFirst.mockResolvedValue({ id: 13 })
    prisma.lote.create.mockResolvedValue(buildLote())
    const service = new LoteService(prisma as never)

    await expect(
      service.create(7, {
        articuloId: 11,
        depositoId: 13,
        nroLote: ' ',
        fechaVencimiento: '2026-12-31',
      }),
    ).resolves.toMatchObject({ ok: false, status: 400 })
    await expect(
      service.create(7, {
        articuloId: 11,
        depositoId: 13,
        nroLote: 'LOT-001',
        fechaVencimiento: 'invalid',
      }),
    ).resolves.toMatchObject({ ok: false, status: 400 })
    await expect(
      service.create(7, {
        articuloId: 11,
        depositoId: 13,
        nroLote: 'LOT-001',
        fechaVencimiento: '2026-12-31',
        stockInicial: 10,
      }),
    ).resolves.toMatchObject({ ok: true, data: { id: 1, stockActual: 10 } })
  })

  it('returns domain errors for invalid lot ownership and duplicates', async () => {
    const prisma = buildPrisma()
    const service = new LoteService(prisma as never)
    const input = {
      articuloId: 11,
      depositoId: 13,
      nroLote: 'LOT-001',
      fechaVencimiento: '2026-12-31',
      stockInicial: 1,
    }

    prisma.articulo.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 11, controlLote: true, tipo: 'servicio' })
      .mockResolvedValueOnce({ id: 11, controlLote: false, tipo: 'producto' })
      .mockResolvedValueOnce({ id: 11, controlLote: true, tipo: 'producto' })
      .mockResolvedValueOnce({ id: 11, controlLote: true, tipo: 'producto' })
    await expect(service.create(7, input)).resolves.toMatchObject({ status: 404 })
    await expect(service.create(7, input)).resolves.toMatchObject({ error: 'SERVICE_NO_STOCK' })
    await expect(service.create(7, input)).resolves.toMatchObject({
      error: 'ARTICLE_NO_LOT_CONTROL',
    })
    prisma.deposito.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 13 })
    await expect(service.create(7, input)).resolves.toMatchObject({
      error: 'depositoId is not valid for this tenant',
    })
    prisma.lote.create.mockRejectedValue({ code: 'P2002' })
    await expect(service.create(7, input)).resolves.toMatchObject({
      status: 409,
      error: 'LOTE_ALREADY_EXISTS',
    })
  })

  it('rejects invalid initial stock and rethrows unexpected persistence errors', async () => {
    const prisma = buildPrisma()
    prisma.articulo.findFirst.mockResolvedValue({
      id: 11,
      controlLote: true,
      tipo: 'producto',
    })
    prisma.deposito.findFirst.mockResolvedValue({ id: 13 })
    const service = new LoteService(prisma as never)
    const input = {
      articuloId: 11,
      depositoId: 13,
      nroLote: 'LOT-001',
      fechaVencimiento: '2026-12-31',
    }

    await expect(service.create(7, { ...input, stockInicial: -1 })).resolves.toMatchObject({
      status: 400,
    })
    prisma.lote.create.mockRejectedValue(new Error('database unavailable'))
    await expect(service.create(7, input)).rejects.toThrow('database unavailable')
  })

  it('upserts inbound stock for existing and new lots', async () => {
    const prisma = buildPrisma()
    const service = new LoteService(prisma as never)
    const input = {
      articuloId: 11,
      depositoId: 13,
      nroLote: ' LOT-001 ',
      fechaVencimiento: '2026-12-31',
      cantidad: 3,
    }

    prisma.lote.findUnique.mockResolvedValueOnce({ id: 1 }).mockResolvedValueOnce(null)
    prisma.lote.create.mockResolvedValue({ id: 2 })
    await expect(service.applyInbound(prisma as never, 7, input)).resolves.toEqual({
      ok: true,
      data: { loteId: 1 },
    })
    await expect(service.applyInbound(prisma as never, 7, input)).resolves.toEqual({
      ok: true,
      data: { loteId: 2 },
    })
    expect(prisma.lote.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ stockActual: { increment: 3 } }) }),
    )
  })

  it('rejects malformed inbound lot data', async () => {
    const prisma = buildPrisma()
    const service = new LoteService(prisma as never)
    const base = {
      articuloId: 11,
      depositoId: 13,
      nroLote: 'LOT-001',
      fechaVencimiento: '2026-12-31',
      cantidad: 1,
    }

    await expect(
      service.applyInbound(prisma as never, 7, { ...base, fechaVencimiento: 'invalid' }),
    ).resolves.toMatchObject({ status: 400 })
    await expect(
      service.applyInbound(prisma as never, 7, { ...base, nroLote: ' ' }),
    ).resolves.toMatchObject({ status: 400 })
    await expect(
      service.applyInbound(prisma as never, 7, { ...base, cantidad: 0 }),
    ).resolves.toMatchObject({ status: 400 })
  })

  it('allocates, previews and applies outbound lot stock', async () => {
    const prisma = buildPrisma()
    prisma.lote.findMany.mockResolvedValue([
      {
        id: 1,
        nroLote: 'A',
        fechaVencimiento: new Date('2026-08-01T00:00:00.000Z'),
        stockActual: 4,
      },
    ])
    prisma.lote.findFirst
      .mockResolvedValueOnce({ id: 1, stockActual: 4 })
      .mockResolvedValueOnce({ id: 1, stockActual: 1 })
    const service = new LoteService(prisma as never)

    await expect(service.previewFefo(7, 11, 13, 3)).resolves.toMatchObject({
      ok: true,
      data: [{ loteId: 1, cantidad: 3 }],
    })
    await expect(
      service.applyOutbound(prisma as never, 7, [
        { loteId: 1, nroLote: 'A', fechaVencimiento: '2026-08-01', cantidad: 3 },
      ]),
    ).resolves.toEqual({ ok: true, data: undefined })
    await expect(
      service.applyOutbound(prisma as never, 7, [
        { loteId: 1, nroLote: 'A', fechaVencimiento: '2026-08-01', cantidad: 3 },
      ]),
    ).resolves.toMatchObject({ ok: false, error: 'INSUFFICIENT_LOT_STOCK' })
  })

  it('validates and applies signed lot adjustments', async () => {
    const prisma = buildPrisma()
    const service = new LoteService(prisma as never)
    const params = { loteId: 1, articuloId: 11, depositoId: 13, cantidad: -2 }

    prisma.lote.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(buildLote({ articuloId: 99 }))
      .mockResolvedValueOnce(buildLote({ activo: false }))
      .mockResolvedValueOnce(buildLote({ stockActual: 1 }))
      .mockResolvedValueOnce(buildLote())
    await expect(service.applyAjuste(prisma as never, 7, params)).resolves.toMatchObject({
      status: 404,
    })
    await expect(service.applyAjuste(prisma as never, 7, params)).resolves.toMatchObject({
      error: 'LOTE_MISMATCH',
    })
    await expect(service.applyAjuste(prisma as never, 7, params)).resolves.toMatchObject({
      error: 'LOTE_INACTIVE',
    })
    await expect(service.applyAjuste(prisma as never, 7, params)).resolves.toMatchObject({
      error: 'INSUFFICIENT_LOT_STOCK',
    })
    await expect(service.applyAjuste(prisma as never, 7, params)).resolves.toEqual({
      ok: true,
      data: undefined,
    })
    expect(prisma.lote.update).toHaveBeenLastCalledWith({
      where: { id: 1 },
      data: { stockActual: 8 },
    })
  })

  it('returns mapped invoice traceability', async () => {
    const prisma = buildPrisma()
    prisma.lote.findFirst.mockResolvedValue(buildLote())
    prisma.facturaItem.findMany.mockResolvedValue([
      {
        id: 21,
        cantidad: 2,
        factura: {
          id: 31,
          tipo: 'A',
          prefijo: 1,
          numero: 99,
          fecha: new Date('2026-07-20T00:00:00.000Z'),
          clienteId: 41,
          cliente: { rsocial: 'Cliente SA' },
        },
      },
    ])
    const service = new LoteService(prisma as never)

    await expect(service.getTrazabilidad(7, 11, 1)).resolves.toMatchObject({
      ok: true,
      data: {
        lote: { id: 1 },
        facturas: [{ facturaId: 31, facturaItemId: 21, clienteRsocial: 'Cliente SA' }],
      },
    })
  })

  it('returns not found when traceability has no matching lot', async () => {
    const prisma = buildPrisma()
    prisma.lote.findFirst.mockResolvedValue(null)
    const service = new LoteService(prisma as never)

    await expect(service.getTrazabilidad(7, 11, 999)).resolves.toMatchObject({
      ok: false,
      status: 404,
    })
  })

  it('checks module flags and runs the no-op expiry job paths', async () => {
    const prisma = buildPrisma()
    const tenantConfig = {
      getModulesForTenant: vi
        .fn()
        .mockResolvedValueOnce(['inventory.fefo'])
        .mockResolvedValueOnce(['inventory.lots'])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['inventory.fefo']),
    }
    const config = {
      id: 1,
      tenantId: 7,
      diasAlertaVencimiento: 30,
      createdAt: now,
      updatedAt: now,
    }
    prisma.configFefo.findUnique.mockResolvedValue(config)
    prisma.lote.findMany.mockResolvedValue([])
    const service = new LoteService(prisma as never, tenantConfig as never)

    await expect(service.isFefoEnabled(7)).resolves.toBe(true)
    await expect(service.isLotsEnabled(7)).resolves.toBe(true)
    await expect(service.runDailyExpiryAlertJob(7)).resolves.toEqual({ notified: 0 })
    await expect(service.runDailyExpiryAlertJob(7)).resolves.toEqual({ notified: 0 })
    expect(prisma.lote.findMany).toHaveBeenCalledTimes(1)
  })

  it('notifies managers about an expiring lot once', async () => {
    const prisma = buildPrisma()
    const tenantConfig = {
      getModulesForTenant: vi.fn().mockResolvedValue(['inventory.fefo']),
    }
    prisma.configFefo.findUnique.mockResolvedValue({
      id: 1,
      tenantId: 7,
      diasAlertaVencimiento: 30,
      createdAt: now,
      updatedAt: now,
    })
    prisma.lote.findMany.mockResolvedValue([
      buildLote({
        fechaVencimiento: new Date('2026-07-30T00:00:00.000Z'),
      }),
    ])
    prisma.lote.update.mockResolvedValue({ id: 1 })
    const service = new LoteService(prisma as never, tenantConfig as never)

    await expect(service.runDailyExpiryAlertJob(7)).resolves.toEqual({ notified: 1 })
    expect(notifyManagers).toHaveBeenCalledWith(
      prisma,
      7,
      'lot_expiring',
      expect.objectContaining({ loteId: 1, nroLote: 'LOT-001', stock: 10 }),
    )
    expect(prisma.lote.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { preavisoEnviadoAt: expect.any(Date) },
    })
  })
})
