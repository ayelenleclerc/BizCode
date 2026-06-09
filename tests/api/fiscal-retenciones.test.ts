import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

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

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    regimenRetencion: {
      findMany: vi.fn().mockResolvedValue([regimenRow]),
      create: vi.fn().mockResolvedValue(regimenRow),
      findFirst: vi.fn().mockResolvedValue(regimenRow),
      update: vi.fn().mockResolvedValue(regimenRow),
    },
    fiscalRetencionesConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        esAgenteRetencionGanancias: true,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    },
    retencionAplicada: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, condIva: 'RI' }),
    },
    paramEmpresa: {
      findFirst: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '20123456789', domicilio: null }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

describe('fiscal retenciones API (#228)', () => {
  let prisma: ReturnType<typeof buildPrisma>

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/fiscal/regimenes lists regimes', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/fiscal/regimenes').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].nombre).toBe('Ganancias servicios')
  })

  it('POST /api/fiscal/regimenes creates regime', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/fiscal/regimenes')
      .send({
        tipo: 'ganancias',
        subtipo: 'retencion',
        nombre: 'Ganancias servicios',
        alicuota: 4.5,
      })
      .expect(201)
    expect(res.body.data.id).toBe(1)
    expect(prisma.regimenRetencion.create).toHaveBeenCalled()
  })

  it('PUT /api/fiscal/regimenes/:id updates regime', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .put('/api/fiscal/regimenes/1')
      .send({ activo: false })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(prisma.regimenRetencion.update).toHaveBeenCalled()
  })

  it('GET /api/fiscal/config-retenciones returns defaults', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/fiscal/config-retenciones').expect(200)
    expect(res.body.data.esAgenteRetencionGanancias).toBe(false)
  })

  it('PUT /api/fiscal/config-retenciones upserts config', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .put('/api/fiscal/config-retenciones')
      .send({ esAgenteRetencionGanancias: true })
      .expect(200)
    expect(res.body.data.esAgenteRetencionGanancias).toBe(true)
  })

  it('GET /api/fiscal/retenciones returns empty paginated list', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/fiscal/retenciones').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
  })

  it('GET /api/fiscal/retenciones/preview returns suggestions for proveedor (#276)', async () => {
    prisma = buildPrisma({
      proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 1, condIva: 'RI' }) },
      fiscalRetencionesConfig: {
        findUnique: vi.fn().mockResolvedValue({
          esAgenteRetencionGanancias: true,
          esAgenteRetencionIVA: false,
          esAgenteRetencionIIBB: false,
        }),
      },
    })
    const app = createApp(prisma as never)
    const res = await request(app)
      .get('/api/fiscal/retenciones/preview')
      .query({ entidadTipo: 'proveedor', entidadId: 1, monto: 1000 })
      .expect(200)
    expect(res.body.data.retenciones.length).toBeGreaterThan(0)
  })

  it('GET /api/fiscal/retenciones/preview returns empty for cliente', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .get('/api/fiscal/retenciones/preview')
      .query({ entidadTipo: 'cliente', entidadId: 1, monto: 100000 })
      .expect(200)
    expect(res.body.data.retenciones).toEqual([])
  })
})
