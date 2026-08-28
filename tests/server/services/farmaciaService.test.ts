import { describe, expect, it, vi } from 'vitest'
import { FarmaciaService } from '../../../apps/server/services/FarmaciaService'

const now = new Date('2026-08-28T10:00:00.000Z')

function buildPrisma() {
  return {
    factura: { findFirst: vi.fn() },
    cliente: { findFirst: vi.fn() },
    articulo: { findFirst: vi.fn(), findMany: vi.fn() },
    lote: { findFirst: vi.fn(), update: vi.fn() },
    recetaDispensacion: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    libroPsicotropicoMovimiento: { findMany: vi.fn(), create: vi.fn() },
  }
}

function buildTenantConfig(modules: string[]) {
  return { getModulesForTenant: vi.fn().mockResolvedValue(modules) } as never
}

function buildReceta(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 7,
    facturaId: null,
    clienteId: null,
    numeroReceta: 'R-1',
    medicoNombre: 'Dra. Ana Pérez',
    matricula: 'MN 1',
    fechaReceta: new Date('2026-08-28T00:00:00.000Z'),
    observaciones: null,
    createdAt: now,
    updatedAt: now,
    cliente: null,
    ...overrides,
  }
}

function buildMovimiento(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    tenantId: 7,
    articuloId: 5,
    loteId: null,
    recetaId: null,
    tipo: 'ingreso',
    cantidad: 3,
    referencia: null,
    observaciones: null,
    createdAt: now,
    articulo: { id: 5, codigo: 900, descripcion: 'Clonazepam 2mg' },
    lote: null,
    ...overrides,
  }
}

const validReceta = {
  numeroReceta: 'R-1',
  medicoNombre: 'Dra. Ana Pérez',
  matricula: 'MN 1',
  fechaReceta: '2026-08-28',
}

describe('FarmaciaService (#204)', () => {
  describe('isPharmacyEnabled', () => {
    it('reflects the tenant module set', async () => {
      const prisma = buildPrisma()
      const enabled = new FarmaciaService(
        prisma as never,
        buildTenantConfig(['inventory.lots', 'vertical.pharmacy']),
      )
      const disabled = new FarmaciaService(prisma as never, buildTenantConfig(['inventory.lots']))
      await expect(enabled.isPharmacyEnabled(7)).resolves.toBe(true)
      await expect(disabled.isPharmacyEnabled(7)).resolves.toBe(false)
    })
  })

  describe('listRecetas', () => {
    it('maps rows and applies the date range filter', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.findMany.mockResolvedValue([buildReceta()])
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      const result = await service.listRecetas(7, { desde: '2026-08-01', hasta: '2026-08-31' })
      expect(result).toMatchObject({ ok: true })
      if (!result.ok) return
      expect(result.data[0]).toMatchObject({ id: 1, fechaReceta: '2026-08-28' })
      expect(prisma.recetaDispensacion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 7,
            fechaReceta: {
              gte: new Date('2026-08-01T00:00:00.000Z'),
              lte: new Date('2026-08-31T00:00:00.000Z'),
            },
          }),
        }),
      )
    })

    it('rejects a malformed date range', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.listRecetas(7, { desde: '01/08/2026' })).resolves.toMatchObject({
        ok: false,
        status: 400,
      })
      await expect(service.listRecetas(7, { hasta: 'nope' })).resolves.toMatchObject({
        ok: false,
        status: 400,
      })
    })
  })

  describe('getReceta', () => {
    it('returns 404 when not found and the row when present', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(buildReceta())
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.getReceta(7, 1)).resolves.toMatchObject({ status: 404 })
      await expect(service.getReceta(7, 1)).resolves.toMatchObject({ ok: true })
    })
  })

  describe('createReceta', () => {
    it('creates a prescription with optional relations validated', async () => {
      const prisma = buildPrisma()
      prisma.factura.findFirst.mockResolvedValue({ id: 31 })
      prisma.cliente.findFirst.mockResolvedValue({ id: 4 })
      prisma.recetaDispensacion.create.mockResolvedValue(
        buildReceta({ facturaId: 31, clienteId: 4 }),
      )
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      const result = await service.createReceta(7, {
        ...validReceta,
        facturaId: 31,
        clienteId: 4,
      })
      expect(result).toMatchObject({ ok: true })
      expect(prisma.recetaDispensacion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 7, numeroReceta: 'R-1' }),
        }),
      )
    })

    it('propagates validation failures without touching the database', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.createReceta(7, { ...validReceta, fechaReceta: 'nope' }),
      ).resolves.toMatchObject({ ok: false, status: 400 })
      expect(prisma.recetaDispensacion.create).not.toHaveBeenCalled()
    })

    it('rejects relations from another tenant', async () => {
      const prisma = buildPrisma()
      prisma.factura.findFirst.mockResolvedValue(null)
      prisma.cliente.findFirst.mockResolvedValue(null)
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.createReceta(7, { ...validReceta, facturaId: 31 }),
      ).resolves.toMatchObject({ error: 'facturaId is not valid for this tenant' })
      await expect(
        service.createReceta(7, { ...validReceta, clienteId: 4 }),
      ).resolves.toMatchObject({ error: 'clienteId is not valid for this tenant' })
    })

    it('maps a unique violation to 409', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.create.mockRejectedValue(
        Object.assign(new Error('unique'), { code: 'P2002' }),
      )
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.createReceta(7, validReceta)).resolves.toMatchObject({
        ok: false,
        status: 409,
        error: 'RECETA_ALREADY_EXISTS',
      })
    })

    it('rethrows unexpected database errors', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.create.mockRejectedValue(new Error('boom'))
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.createReceta(7, validReceta)).rejects.toThrow('boom')
    })
  })

  describe('libro psicotropicos', () => {
    it('lists and exports entries as CSV', async () => {
      const prisma = buildPrisma()
      prisma.libroPsicotropicoMovimiento.findMany.mockResolvedValue([buildMovimiento()])
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      const list = await service.listLibro(7, { tipo: 'ingreso', articuloId: 5 })
      expect(list).toMatchObject({ ok: true })
      const csv = await service.exportLibroCsv(7)
      expect(csv.ok).toBe(true)
      if (!csv.ok) return
      expect(csv.data).toContain('Clonazepam 2mg')
    })

    it('propagates a malformed range to the export', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.exportLibroCsv(7, { desde: 'nope' })).resolves.toMatchObject({
        ok: false,
        status: 400,
      })
    })

    it('creates an entry only for psychotropic articles', async () => {
      const prisma = buildPrisma()
      prisma.articulo.findFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 5, esPsicotropico: false })
        .mockResolvedValue({ id: 5, esPsicotropico: true })
      prisma.libroPsicotropicoMovimiento.create.mockResolvedValue(buildMovimiento())
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      const input = { articuloId: 5, tipo: 'ingreso' as const, cantidad: 3 }

      await expect(service.createLibroMovimiento(7, input)).resolves.toMatchObject({
        error: 'articuloId is not valid for this tenant',
      })
      await expect(service.createLibroMovimiento(7, input)).resolves.toMatchObject({
        status: 422,
        error: 'ARTICLE_NOT_PSYCHOTROPIC',
      })
      await expect(service.createLibroMovimiento(7, input)).resolves.toMatchObject({ ok: true })
    })

    it('validates the referenced lot and prescription', async () => {
      const prisma = buildPrisma()
      prisma.articulo.findFirst.mockResolvedValue({ id: 5, esPsicotropico: true })
      prisma.lote.findFirst.mockResolvedValueOnce(null).mockResolvedValue({ id: 8 })
      prisma.recetaDispensacion.findFirst.mockResolvedValueOnce(null)
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))

      await expect(
        service.createLibroMovimiento(7, {
          articuloId: 5,
          tipo: 'egreso',
          cantidad: 1,
          loteId: 8,
        }),
      ).resolves.toMatchObject({ error: 'loteId is not valid for this articulo' })
      await expect(
        service.createLibroMovimiento(7, {
          articuloId: 5,
          tipo: 'egreso',
          cantidad: 1,
          recetaId: 3,
        }),
      ).resolves.toMatchObject({ error: 'recetaId is not valid for this tenant' })
    })

    it('rejects an invalid payload before hitting the database', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.createLibroMovimiento(7, { articuloId: 5, tipo: 'egreso', cantidad: 0 }),
      ).resolves.toMatchObject({ ok: false, status: 400 })
      expect(prisma.articulo.findFirst).not.toHaveBeenCalled()
    })
  })

  describe('setLoteSerial', () => {
    it('stores normalized serial values', async () => {
      const prisma = buildPrisma()
      prisma.lote.findFirst.mockResolvedValue({ id: 8 })
      prisma.lote.update.mockResolvedValue({
        id: 8,
        serialUnidad: 'AB-1',
        codigoDatamatrix: null,
      })
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.setLoteSerial(7, 8, { serialUnidad: '  AB-1  ' }),
      ).resolves.toMatchObject({ ok: true })
      expect(prisma.lote.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { serialUnidad: 'AB-1', codigoDatamatrix: null } }),
      )
    })

    it('returns 404 for a lot from another tenant and 400 for oversized input', async () => {
      const prisma = buildPrisma()
      prisma.lote.findFirst.mockResolvedValue(null)
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(service.setLoteSerial(7, 8, { serialUnidad: 'AB' })).resolves.toMatchObject({
        status: 404,
      })
      await expect(
        service.setLoteSerial(7, 8, { serialUnidad: 'x'.repeat(61) }),
      ).resolves.toMatchObject({ status: 400 })
    })
  })

  describe('assertDispensacionAllowed', () => {
    it('skips the module lookup when no article requires a prescription', async () => {
      const prisma = buildPrisma()
      const tenantConfig = buildTenantConfig(['vertical.pharmacy'])
      const service = new FarmaciaService(prisma as never, tenantConfig)
      await expect(
        service.assertDispensacionAllowed(7, [{ id: 5, requiereReceta: false }], null),
      ).resolves.toMatchObject({ ok: true })
      expect(
        (tenantConfig as unknown as { getModulesForTenant: { mock: { calls: unknown[] } } })
          .getModulesForTenant.mock.calls,
      ).toHaveLength(0)
    })

    it('is a no-op when the vertical module is disabled', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig(['inventory.lots']))
      await expect(
        service.assertDispensacionAllowed(7, [{ id: 5, requiereReceta: true }], null),
      ).resolves.toMatchObject({ ok: true })
      expect(prisma.recetaDispensacion.findFirst).not.toHaveBeenCalled()
    })

    it('blocks prescription-only articles without a linked prescription', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(
        prisma as never,
        buildTenantConfig(['vertical.pharmacy']),
      )
      await expect(
        service.assertDispensacionAllowed(
          7,
          [
            { id: 5, requiereReceta: true },
            { id: 2, requiereReceta: false },
          ],
          null,
        ),
      ).resolves.toMatchObject({ ok: false, status: 422, error: 'PRESCRIPTION_REQUIRED:5' })
    })

    it('allows the sale when a tenant prescription is linked', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.findFirst.mockResolvedValue({ id: 1 })
      const service = new FarmaciaService(
        prisma as never,
        buildTenantConfig(['vertical.pharmacy']),
      )
      await expect(
        service.assertDispensacionAllowed(7, [{ id: 5, requiereReceta: true }], 1),
      ).resolves.toMatchObject({ ok: true })
    })

    it('rejects a prescription from another tenant', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.findFirst.mockResolvedValue(null)
      const service = new FarmaciaService(
        prisma as never,
        buildTenantConfig(['vertical.pharmacy']),
      )
      await expect(
        service.assertDispensacionAllowed(7, [{ id: 5, requiereReceta: true }], 99),
      ).resolves.toMatchObject({ ok: false, status: 400 })
    })
  })

  describe('recordDispensacion', () => {
    it('links the prescription and books one outflow per psychotropic line', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.updateMany.mockResolvedValue({ count: 1 })
      prisma.articulo.findMany.mockResolvedValue([{ id: 5 }])
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))

      const result = await service.recordDispensacion(7, {
        facturaId: 31,
        recetaId: 1,
        items: [
          { articuloId: 5, cantidad: 2, loteId: 8 },
          { articuloId: 6, cantidad: 1 },
        ],
      })

      expect(result).toEqual({ recetaLinked: true, movimientos: 1 })
      expect(prisma.libroPsicotropicoMovimiento.create).toHaveBeenCalledTimes(1)
      expect(prisma.libroPsicotropicoMovimiento.create).toHaveBeenCalledWith({
        data: {
          tenantId: 7,
          articuloId: 5,
          loteId: 8,
          recetaId: 1,
          tipo: 'egreso',
          cantidad: 2,
          referencia: 'factura:31',
        },
      })
    })

    it('does nothing when there are no psychotropic articles', async () => {
      const prisma = buildPrisma()
      prisma.articulo.findMany.mockResolvedValue([])
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.recordDispensacion(7, {
          facturaId: 31,
          items: [{ articuloId: 6, cantidad: 1 }],
        }),
      ).resolves.toEqual({ recetaLinked: false, movimientos: 0 })
      expect(prisma.libroPsicotropicoMovimiento.create).not.toHaveBeenCalled()
    })

    it('returns early for an invoice without catalog lines', async () => {
      const prisma = buildPrisma()
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await expect(
        service.recordDispensacion(7, { facturaId: 31, items: [] }),
      ).resolves.toEqual({ recetaLinked: false, movimientos: 0 })
      expect(prisma.articulo.findMany).not.toHaveBeenCalled()
    })

    it('does not attach an unlinked prescription to the book entry', async () => {
      const prisma = buildPrisma()
      prisma.recetaDispensacion.updateMany.mockResolvedValue({ count: 0 })
      prisma.articulo.findMany.mockResolvedValue([{ id: 5 }])
      const service = new FarmaciaService(prisma as never, buildTenantConfig([]))
      await service.recordDispensacion(7, {
        facturaId: 31,
        recetaId: 99,
        items: [{ articuloId: 5, cantidad: 1 }],
      })
      expect(prisma.libroPsicotropicoMovimiento.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ recetaId: null }),
      })
    })
  })
})
