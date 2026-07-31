import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const MODULES =
  'core.auth,finance.ledger,finance.bank_reconcile,billing.arca_cae,billing.orders'

const cuenta = {
  id: 7,
  tenantId: 1,
  banco: 'galicia',
  tipoCuenta: 'corriente',
  cbu: '1234567890123456789012',
  alias: null as string | null,
  moneda: 'ARS',
  activo: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

function movRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    cuentaId: 7,
    fecha: new Date('2026-07-10T00:00:00.000Z'),
    descripcion: 'TRANSFERENCIA RECIBIDA',
    importe: new Decimal(1000),
    tipo: 'credito',
    saldo: null,
    referencia: 'REF-1',
    formatoOrigen: 'csv',
    dedupeKey: 'k1',
    conciliadoId: null,
    conciliadoAt: null,
    conciliadoTipo: null,
    matchEstado: 'unmatched',
    matchScore: null,
    matchSugerencias: null,
    createdAt: new Date('2026-07-10T00:00:00.000Z'),
    ...overrides,
  }
}

function buildPrisma(seed: { movimientos?: Array<ReturnType<typeof movRow>> } = {}): {
  prisma: PrismaClient
  movimientos: Array<ReturnType<typeof movRow>>
  periodoLocks: Array<{ id: number; tenantId: number; cuentaId: number; periodo: string; lockedAt: Date; lockedByUserId: number }>
} {
  const movimientos = seed.movimientos ?? [movRow()]
  const periodoLocks: Array<{ id: number; tenantId: number; cuentaId: number; periodo: string; lockedAt: Date; lockedByUserId: number }> = []

  const prisma = {
    cuentaBancaria: {
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id: number; tenantId: number } }) => {
        if (where.id === cuenta.id && where.tenantId === cuenta.tenantId) return cuenta
        return null
      }),
    },
    movimientoBancario: {
      findMany: vi.fn().mockImplementation(async ({ where }: { where?: Record<string, unknown> }) => {
        if (where?.conciliadoTipo) return [] // used-candidate lookup
        return movimientos
      }),
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
        const conciliadoTipo = (where as { conciliadoTipo?: string }).conciliadoTipo
        const conciliadoId = (where as { conciliadoId?: number }).conciliadoId
        if (conciliadoTipo != null) {
          return movimientos.find((m) => m.conciliadoTipo === conciliadoTipo && m.conciliadoId === conciliadoId) ?? null
        }
        const id = (where as { id?: number }).id
        return movimientos.find((m) => m.id === id) ?? null
      }),
      update: vi.fn().mockImplementation(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const idx = movimientos.findIndex((m) => m.id === where.id)
        movimientos[idx] = { ...movimientos[idx], ...data } as ReturnType<typeof movRow>
        return movimientos[idx]
      }),
    },
    periodoBancarioLock: {
      findMany: vi.fn().mockImplementation(async ({ where }: { where: { tenantId: number; cuentaId: number } }) =>
        periodoLocks.filter((p) => p.tenantId === where.tenantId && p.cuentaId === where.cuentaId),
      ),
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
        return (
          periodoLocks.find(
            (p) =>
              (where.cuentaId == null || p.cuentaId === where.cuentaId) &&
              (where.tenantId == null || p.tenantId === where.tenantId) &&
              (where.periodo == null || p.periodo === where.periodo),
          ) ?? null
        )
      }),
      create: vi.fn().mockImplementation(async ({ data }: { data: { tenantId: number; cuentaId: number; periodo: string; lockedByUserId: number } }) => {
        const row = { id: periodoLocks.length + 1, lockedAt: new Date('2026-07-31T10:00:00.000Z'), ...data }
        periodoLocks.push(row)
        return row
      }),
      delete: vi.fn().mockImplementation(async ({ where }: { where: { id: number } }) => {
        const idx = periodoLocks.findIndex((p) => p.id === where.id)
        if (idx >= 0) periodoLocks.splice(idx, 1)
        return {}
      }),
    },
    reciboCobroForma: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    cobro: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
  } as unknown as PrismaClient

  return { prisma, movimientos, periodoLocks }
}

describe('bancos conciliacion API (#191)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_MODULES = MODULES
  })

  it('gets reconciliation state and matches OpenAPI', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma({
      movimientos: [movRow({ id: 1, matchEstado: 'suggested', matchScore: 55, matchSugerencias: [
        { tipo: 'cobro', id: 5, clienteId: 3, importe: 1000, fecha: '2026-07-10T00:00:00.000Z', referencia: null },
      ] })],
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/bancos/cuentas/7/conciliacion')
      .query({ desde: '2026-07-01', hasta: '2026-07-31' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.movimientos).toHaveLength(1)
    expect(res.body.data.summary.suggested).toBe(1)
    await assertMatchesOpenApi('/api/bancos/cuentas/{id}/conciliacion', 'get', '200', res.body)
  })

  it('returns 404 for an account outside the tenant', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    await request(app).get('/api/bancos/cuentas/999/conciliacion').expect(404)
  })

  it('runs the matching engine and matches OpenAPI', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma, movimientos } = buildPrisma({
      movimientos: [
        movRow({
          id: 1,
          importe: new Decimal(1000),
          fecha: new Date('2026-07-10T00:00:00.000Z'),
          descripcion: 'TRANSFERENCIA RECIBIDA',
          referencia: null,
        }),
      ],
    })
    ;(prisma.reciboCobroForma.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 42,
        tipo: 'transferencia',
        importe: new Decimal(1000),
        referencia: null,
        banco: null,
        chequeId: null,
        cheque: null,
        reciboCobroId: 1,
        reciboCobro: {
          id: 1,
          clienteId: 5,
          fecha: new Date('2026-07-10T00:00:00.000Z'),
          estado: 'emitido',
          cliente: { cbu: null, alias: null },
        },
      },
    ])
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/bancos/cuentas/7/conciliacion/run')
      .send({ desde: '2026-07-01', hasta: '2026-07-31' })
      .expect(200)
    expect(res.body.data.autoMatched).toBe(1)
    expect(movimientos[0]?.matchEstado).toBe('matched_auto')
    await assertMatchesOpenApi('/api/bancos/cuentas/{id}/conciliacion/run', 'post', '200', res.body)
  })

  it('forbids running matching for roles without write access', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    await request(app).post('/api/bancos/cuentas/7/conciliacion/run').send({}).expect(403)
  })

  it('exports reconciliation state as an xlsx workbook', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/bancos/cuentas/7/conciliacion/export.xlsx')
      .query({ desde: '2026-07-01', hasta: '2026-07-31' })
      .expect(200)
    expect(res.headers['content-type']).toContain(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
  })

  it('manually reconciles a movement against a cobro candidate', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma({ movimientos: [movRow({ id: 1 })] })
    ;(prisma.cobro.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 55, tenantId: 1 })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/bancos/movimientos/1/conciliar')
      .send({ tipo: 'cobro', id: 55 })
      .expect(200)
    expect(res.body.data.matchEstado).toBe('matched_manual')
    expect(res.body.data.conciliadoId).toBe(55)
  })

  it('rejects manual reconciliation with an invalid body', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    await request(app).post('/api/bancos/movimientos/1/conciliar').send({ tipo: 'invalid' }).expect(400)
  })

  it('confirms the primary suggestion of a suggested movement', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma({
      movimientos: [
        movRow({
          id: 1,
          matchEstado: 'suggested',
          matchSugerencias: [
            { tipo: 'recibo_forma', id: 8, clienteId: 3, importe: 1000, fecha: '2026-07-10T00:00:00.000Z', referencia: null },
          ],
        }),
      ],
    })
    ;(prisma.reciboCobroForma.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 8, tenantId: 1 })
    const app = createApp(prisma)
    const res = await request(app).post('/api/bancos/movimientos/1/sugerencia/confirmar').expect(200)
    expect(res.body.data.matchEstado).toBe('matched_manual')
    expect(res.body.data.conciliadoTipo).toBe('recibo_forma')
  })

  it('ignores a movement', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma({ movimientos: [movRow({ id: 1 })] })
    const app = createApp(prisma)
    const res = await request(app).post('/api/bancos/movimientos/1/ignorar').expect(200)
    expect(res.body.data.matchEstado).toBe('ignored')
  })

  it('marks a movement as a bank fee', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma({ movimientos: [movRow({ id: 1 })] })
    const app = createApp(prisma)
    const res = await request(app).post('/api/bancos/movimientos/1/gasto-bancario').expect(200)
    expect(res.body.data.matchEstado).toBe('bank_fee')
  })

  it('locks and unlocks a reconciliation period', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    const lockRes = await request(app).post('/api/bancos/cuentas/7/periodos/2026-07/lock').expect(201)
    expect(lockRes.body.data.periodo).toBe('2026-07')
    await assertMatchesOpenApi('/api/bancos/cuentas/{id}/periodos/{periodo}/lock', 'post', '201', lockRes.body)

    await request(app).post('/api/bancos/cuentas/7/periodos/2026-07/lock').expect(409)

    const unlockRes = await request(app).delete('/api/bancos/cuentas/7/periodos/2026-07/lock').expect(200)
    expect(unlockRes.body.success).toBe(true)
  })

  it('forbids locking a period for roles without write access', async () => {
    process.env.BIZCODE_TEST_ROLE = 'cashier'
    const { prisma } = buildPrisma()
    const app = createApp(prisma)
    await request(app).post('/api/bancos/cuentas/7/periodos/2026-07/lock').expect(403)
  })
})
