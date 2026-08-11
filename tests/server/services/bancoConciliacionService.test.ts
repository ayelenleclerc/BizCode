import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { BancoConciliacionService } from '../../../apps/server/services/BancoConciliacionService'
import { findMatches, type MatchCandidate, type MovementLike } from '../../../apps/server/services/bancos/matchEngine'

type FixtureMovement = {
  id: number
  fecha: string
  descripcion: string
  importe: number
  tipo: 'debito' | 'credito'
  referencia: string | null
}

type FixtureCandidate = {
  tipo: 'recibo_forma' | 'cobro'
  id: number
  clienteId: number
  fecha: string
  importe: number
  referencia: string | null
  banco: string | null
  chequeVencimiento: string | null
  isMercadoPago: boolean
  clienteCbu: string | null
  clienteAlias: string | null
}

type Dataset = { movements: FixtureMovement[]; candidates: FixtureCandidate[] }

const datasetPath = join(process.cwd(), 'tests/fixtures/bancos/conciliacion-191/dataset.json')

function loadDataset(): Dataset {
  return JSON.parse(readFileSync(datasetPath, 'utf8')) as Dataset
}

function toMovementLike(m: FixtureMovement): MovementLike {
  return { id: m.id, fecha: new Date(m.fecha), descripcion: m.descripcion, importe: m.importe, tipo: m.tipo, referencia: m.referencia }
}

function toMatchCandidate(c: FixtureCandidate): MatchCandidate {
  return {
    tipo: c.tipo,
    id: c.id,
    clienteId: c.clienteId,
    fecha: new Date(c.fecha),
    importe: c.importe,
    referencia: c.referencia,
    banco: c.banco,
    chequeVencimiento: c.chequeVencimiento ? new Date(c.chequeVencimiento) : null,
    isMercadoPago: c.isMercadoPago,
    clienteCbu: c.clienteCbu,
    clienteAlias: c.clienteAlias,
  }
}

describe('bank reconciliation fixture (#191) — pure engine auto-match rate', () => {
  it('loads 100 movements and 80 candidates', () => {
    const dataset = loadDataset()
    expect(dataset.movements).toHaveLength(100)
    expect(dataset.candidates).toHaveLength(80)
  })

  it('achieves >= 0.8 auto-match rate over movements with a legitimate candidate signal', () => {
    const dataset = loadDataset()
    const candidates = dataset.candidates.map(toMatchCandidate)
    const usedIds = new Set<string>()

    let auto = 0
    let suggested = 0
    let none = 0
    let bankFee = 0

    for (const movement of dataset.movements) {
      const result = findMatches(toMovementLike(movement), candidates, usedIds)
      if (result.status === 'auto') {
        auto++
        const winner = result.winners[0]!
        usedIds.add(`${winner.tipo}:${winner.id}`)
      } else if (result.status === 'suggested') {
        suggested++
      } else if (result.status === 'bank_fee') {
        bankFee++
      } else {
        none++
      }
    }

    expect(auto + suggested + none + bankFee).toBe(100)
    // "Auto rate" here means: of the movements that produced at least one candidate signal
    // (auto or suggested), what fraction were confident enough to auto-match. Movements with
    // no candidate signal at all (bank fees, unrelated noise) are excluded by design since the
    // fixture never intended them to reconcile against any candidate.
    const withSignal = auto + suggested
    expect(withSignal).toBeGreaterThan(0)
    const autoRate = auto / withSignal
    expect(autoRate).toBeGreaterThanOrEqual(0.8)
    expect(auto).toBeGreaterThanOrEqual(64) // >= 80% of the 80 candidates
  })
})

const baseCuenta = {
  id: 7,
  tenantId: 1,
  banco: 'galicia',
  tipoCuenta: 'corriente',
  cbu: '1234567890123456789012',
  alias: null,
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

describe('BancoConciliacionService (#191)', () => {
  let prisma: PrismaClient
  let service: BancoConciliacionService
  let movimientos: Array<ReturnType<typeof movRow>>
  let periodoLocks: Array<{ id: number; tenantId: number; cuentaId: number; periodo: string; lockedAt: Date; lockedByUserId: number }>

  beforeEach(() => {
    movimientos = [movRow()]
    periodoLocks = []

    prisma = {
      cuentaBancaria: {
        findFirst: vi.fn().mockImplementation(async ({ where }: { where: { id: number; tenantId: number } }) => {
          if (where.id === baseCuenta.id && where.tenantId === baseCuenta.tenantId) return baseCuenta
          return null
        }),
      },
      movimientoBancario: {
        findMany: vi.fn().mockImplementation(async ({ where }: { where?: Record<string, unknown> }) => {
          if (where?.conciliadoTipo) return [] // used-candidate lookup
          return movimientos
        }),
        findFirst: vi.fn().mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
          const id = (where as { id?: number }).id
          const conciliadoTipo = (where as { conciliadoTipo?: string }).conciliadoTipo
          const conciliadoId = (where as { conciliadoId?: number }).conciliadoId
          if (conciliadoTipo != null) {
            return movimientos.find((m) => m.conciliadoTipo === conciliadoTipo && m.conciliadoId === conciliadoId) ?? null
          }
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
          periodoLocks = periodoLocks.filter((p) => p.id !== where.id)
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
    service = new BancoConciliacionService(prisma)
  })

  it('returns 404 for getConciliacion when the account does not belong to the tenant', async () => {
    const result = await service.getConciliacion(999, 7, new Date('2026-07-01'), new Date('2026-07-31'))
    expect(result).toMatchObject({ ok: false, status: 404 })
  })

  it('summarizes movement match states for getConciliacion', async () => {
    movimientos = [
      movRow({ id: 1, matchEstado: 'unmatched' }),
      movRow({ id: 2, matchEstado: 'suggested' }),
      movRow({ id: 3, matchEstado: 'matched_auto' }),
      movRow({ id: 4, matchEstado: 'bank_fee' }),
    ]
    const result = await service.getConciliacion(1, 7, new Date('2026-07-01'), new Date('2026-07-31'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.summary.total).toBe(4)
    expect(result.data.summary.unmatched).toBe(1)
    expect(result.data.summary.suggested).toBe(1)
    expect(result.data.summary.matchedAuto).toBe(1)
    expect(result.data.summary.bankFees).toBe(1)
  })

  it('runMatching auto-matches a movement against a ReciboCobroForma candidate', async () => {
    movimientos = [
      movRow({
        id: 1,
        importe: new Decimal(1000),
        fecha: new Date('2026-07-10T00:00:00.000Z'),
        descripcion: 'TRANSFERENCIA RECIBIDA',
        referencia: null,
      }),
    ]
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

    const result = await service.runMatching(1, 7, new Date('2026-07-01'), new Date('2026-07-31'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.autoMatched).toBe(1)
    expect(movimientos[0]?.matchEstado).toBe('matched_auto')
    expect(movimientos[0]?.conciliadoTipo).toBe('recibo_forma')
    expect(movimientos[0]?.conciliadoId).toBe(42)
  })

  it('runMatching skips movements in a locked period', async () => {
    periodoLocks = [{ id: 1, tenantId: 1, cuentaId: 7, periodo: '2026-07', lockedAt: new Date(), lockedByUserId: 9 }]
    movimientos = [movRow({ id: 1, matchEstado: 'unmatched' })]

    const result = await service.runMatching(1, 7, new Date('2026-07-01'), new Date('2026-07-31'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.processed).toBe(0)
    expect(movimientos[0]?.matchEstado).toBe('unmatched')
  })

  it('conciliarManual sets matched_manual when the target exists and is free', async () => {
    movimientos = [movRow({ id: 1 })]
    ;(prisma.cobro.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 55, tenantId: 1 })

    const result = await service.conciliarManual(1, 1, { tipo: 'cobro', id: 55 })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.matchEstado).toBe('matched_manual')
    expect(result.data.conciliadoTipo).toBe('cobro')
    expect(result.data.conciliadoId).toBe(55)
  })

  it('conciliarManual rejects when the period is locked', async () => {
    periodoLocks = [{ id: 1, tenantId: 1, cuentaId: 7, periodo: '2026-07', lockedAt: new Date(), lockedByUserId: 9 }]
    movimientos = [movRow({ id: 1, fecha: new Date('2026-07-10T00:00:00.000Z') })]
    ;(prisma.cobro.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 55, tenantId: 1 })

    const result = await service.conciliarManual(1, 1, { tipo: 'cobro', id: 55 })
    expect(result).toMatchObject({ ok: false, status: 409 })
  })

  it('conciliarManual rejects a candidate already reconciled elsewhere', async () => {
    movimientos = [
      movRow({ id: 1 }),
      movRow({ id: 2, matchEstado: 'matched_manual', conciliadoTipo: 'cobro', conciliadoId: 55 }),
    ]
    const result = await service.conciliarManual(1, 1, { tipo: 'cobro', id: 55 })
    expect(result).toMatchObject({ ok: false, status: 409 })
  })

  it('confirmarSugerencia confirms the primary suggestion of a suggested movement', async () => {
    movimientos = [
      movRow({
        id: 1,
        matchEstado: 'suggested',
        matchSugerencias: [{ tipo: 'recibo_forma', id: 8, clienteId: 3, importe: 1000, fecha: '2026-07-10T00:00:00.000Z', referencia: null }],
      }),
    ]
    ;(prisma.reciboCobroForma.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 8, tenantId: 1 })

    const result = await service.confirmarSugerencia(1, 1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.matchEstado).toBe('matched_manual')
    expect(result.data.conciliadoTipo).toBe('recibo_forma')
    expect(result.data.conciliadoId).toBe(8)
  })

  it('confirmarSugerencia rejects a movement that is not in suggested state', async () => {
    movimientos = [movRow({ id: 1, matchEstado: 'unmatched' })]
    const result = await service.confirmarSugerencia(1, 1)
    expect(result).toMatchObject({ ok: false, status: 400 })
  })

  it('ignorar marks a movement as ignored', async () => {
    movimientos = [movRow({ id: 1 })]
    const result = await service.ignorar(1, 1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.matchEstado).toBe('ignored')
  })

  it('marcarGastoBancario reclassifies a movement as bank_fee', async () => {
    movimientos = [movRow({ id: 1 })]
    const result = await service.marcarGastoBancario(1, 1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.matchEstado).toBe('bank_fee')
  })

  it('lockPeriodo validates format and rejects double-locking', async () => {
    const badFormat = await service.lockPeriodo(1, 7, '2026-7', 9)
    expect(badFormat).toMatchObject({ ok: false, status: 400 })

    const ok = await service.lockPeriodo(1, 7, '2026-07', 9)
    expect(ok.ok).toBe(true)

    const again = await service.lockPeriodo(1, 7, '2026-07', 9)
    expect(again).toMatchObject({ ok: false, status: 409 })
  })

  it('unlockPeriodo removes an existing lock and 404s otherwise', async () => {
    await service.lockPeriodo(1, 7, '2026-07', 9)
    const ok = await service.unlockPeriodo(1, 7, '2026-07')
    expect(ok.ok).toBe(true)

    const missing = await service.unlockPeriodo(1, 7, '2026-07')
    expect(missing).toMatchObject({ ok: false, status: 404 })
  })

  it('isPeriodoLocked reports true only for a locked period', async () => {
    await service.lockPeriodo(1, 7, '2026-07', 9)
    expect(await service.isPeriodoLocked(1, 7, '2026-07')).toBe(true)
    expect(await service.isPeriodoLocked(1, 7, new Date('2026-07-15'))).toBe(true)
    expect(await service.isPeriodoLocked(1, 7, '2026-08')).toBe(false)
  })

  it('exportExcel builds a workbook buffer with movement rows', async () => {
    movimientos = [movRow({ id: 1 })]
    const buffer = await service.exportExcel(1, 7, new Date('2026-07-01'), new Date('2026-07-31'))
    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
  })

  it('exportExcel throws when the account does not belong to the tenant', async () => {
    await expect(service.exportExcel(999, 7, new Date('2026-07-01'), new Date('2026-07-31'))).rejects.toThrow(
      'Bank account not found',
    )
  })
})
