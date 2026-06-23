import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

const retencionRow = {
  id: 1,
  tenantId: 1,
  regimenId: 1,
  tipo: 'retencion',
  entidadTipo: 'proveedor',
  entidadId: 1,
  facturaId: null,
  cobroId: null,
  reciboPagoId: 1,
  reciboCobroId: null,
  baseImponible: new Decimal(10000),
  alicuota: new Decimal(3.5),
  importe: new Decimal(350),
  constanciaNum: 'G-0001',
  createdAt: new Date('2026-06-10T12:00:00.000Z'),
  regimen: { tipo: 'ganancias', provincia: null, nombre: 'Retencion Ganancias' },
  reciboPago: { fecha: new Date('2026-06-10T12:00:00.000Z') },
  reciboCobro: null,
  cobro: null,
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    retencionAplicada: {
      findMany: vi.fn().mockResolvedValue([retencionRow]),
    },
    proveedor: {
      findMany: vi.fn().mockResolvedValue([
        { id: 1, cuit: '20123456786', rsocial: 'Proveedor Demo SA' },
      ]),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    presentacionRetencion: {
      create: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        formato: 'sicore',
        periodo: '2026-06',
        totalOperaciones: 1,
        totalImporte: new Decimal(350),
        archivoHash: 'abc',
        archivoContenido: '217217R1006202620123456786PROVEEDOR DEMO SA              000000010000.000000000350.00',
        presentadoAt: null,
        createdAt: new Date('2026-06-11T10:00:00.000Z'),
      }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

describe('fiscal presentaciones API (#242)', () => {
  let prisma: ReturnType<typeof buildPrisma>

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/fiscal/presentaciones/preview returns preview with totals', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .get('/api/fiscal/presentaciones/preview?formato=sicore&periodo=2026-06')
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.formato).toBe('sicore')
    expect(res.body.data.filas).toHaveLength(1)
    expect(res.body.data.totalesPorRegimen).toHaveLength(1)
    expect(res.body.data.canGenerate).toBe(true)
  })

  it('POST /api/fiscal/presentaciones generates file record', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/fiscal/presentaciones')
      .send({ formato: 'sicore', periodo: '2026-06' })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(10)
    expect(prisma.presentacionRetencion.create).toHaveBeenCalled()
  })

  it('GET /api/fiscal/presentaciones lists history', async () => {
    prisma = buildPrisma({
      presentacionRetencion: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 10,
            tenantId: 1,
            formato: 'sicore',
            periodo: '2026-06',
            totalOperaciones: 1,
            totalImporte: new Decimal(350),
            archivoHash: 'abc',
            archivoContenido: 'txt',
            presentadoAt: null,
            createdAt: new Date('2026-06-11T10:00:00.000Z'),
          },
        ]),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/fiscal/presentaciones').expect(200)
    expect(res.body.data).toHaveLength(1)
  })
})
