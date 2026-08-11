import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { ChequeService } from '../../../apps/server/services/ChequeService'
import {
  createMovimientoClienteCCPrismaMock,
  extendClientePrismaForCc,
} from '../../helpers/movimientoClienteCcPrismaMock'

function buildPrisma() {
  const cheques: Array<Record<string, unknown>> = []
  let idSeq = 0

  const prisma = {
    cheque: {
      count: vi.fn(async ({ where }: { where?: { tenantId?: number; estado?: string } } = {}) =>
        cheques.filter((c) => {
          if (where?.tenantId != null && c.tenantId !== where.tenantId) return false
          if (where?.estado != null && c.estado !== where.estado) return false
          return true
        }).length,
      ),
      findMany: vi.fn(async () => cheques),
      findFirst: vi.fn(async ({ where }: { where?: { id?: number; tenantId?: number } } = {}) =>
        cheques.find((c) => {
          if (where?.id != null && c.id !== where.id) return false
          if (where?.tenantId != null && c.tenantId !== where.tenantId) return false
          return true
        }) ?? null,
      ),
      findFirstOrThrow: vi.fn(async ({ where }: { where: { id: number } }) => {
        const row = cheques.find((c) => c.id === where.id)
        if (!row) throw new Error('not found')
        return row
      }),
      aggregate: vi.fn(async () => ({ _count: { id: cheques.length }, _sum: { monto: new Decimal(100) } })),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        idSeq += 1
        const row = {
          id: idSeq,
          ...data,
          movimientos: [],
          cliente: data.clienteId ? { id: data.clienteId, codigo: 1, rsocial: 'Cliente', cuit: null } : null,
          proveedor: null,
        }
        cheques.push(row)
        return row
      }),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const row = cheques.find((c) => c.id === where.id)
        if (!row) throw new Error('not found')
        Object.assign(row, data)
        return row
      }),
    },
    chequeMov: { create: vi.fn(async () => ({ id: 1 })) },
    proveedor: { findFirst: vi.fn(async () => ({ id: 2 })) },
    cobro: { updateMany: vi.fn(), findFirst: vi.fn(async () => null) },
    cliente: extendClientePrismaForCc({}),
    movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
    notification: { createMany: vi.fn() },
    appUser: { findMany: vi.fn(async () => [{ id: 1 }]) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma)),
  }

  return { prisma, cheques }
}

describe('ChequeService (#231)', () => {
  let prisma: ReturnType<typeof buildPrisma>['prisma']
  let service: ChequeService

  beforeEach(() => {
    const built = buildPrisma()
    prisma = built.prisma
    service = new ChequeService(prisma as never)
  })

  it('creates recibido cheque in en_cartera', async () => {
    const result = await service.create(1, 1, {
      tipo: 'recibido',
      modalidad: 'fisico',
      numero: '100',
      banco: 'BBVA',
      libradorNombre: 'Lib',
      monto: 500,
      moneda: 'ARS',
      fechaEmision: '2026-06-01',
      fechaVencimiento: '2026-06-30',
      clienteId: 1,
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.estado).toBe('en_cartera')
  })

  it('rejects recibido without clienteId', async () => {
    const result = await service.create(1, 1, {
      tipo: 'recibido',
      modalidad: 'fisico',
      numero: '101',
      banco: 'BBVA',
      libradorNombre: 'Lib',
      monto: 500,
      moneda: 'ARS',
      fechaEmision: '2026-06-01',
      fechaVencimiento: '2026-06-30',
      clienteId: null,
    })
    expect(result.ok).toBe(false)
  })

  it('depositar transitions from en_cartera', async () => {
    await service.create(1, 1, {
      tipo: 'recibido',
      modalidad: 'fisico',
      numero: '102',
      banco: 'BBVA',
      libradorNombre: 'Lib',
      monto: 500,
      moneda: 'ARS',
      fechaEmision: '2026-06-01',
      fechaVencimiento: '2026-06-30',
      clienteId: 1,
    })
    const result = await service.depositar(1, 1, 1, { destino: 'Cuenta' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data.estado).toBe('depositado')
  })

  it('rejects invalid transition', async () => {
    const created = await service.create(1, 1, {
      tipo: 'recibido',
      modalidad: 'fisico',
      numero: '103',
      banco: 'BBVA',
      libradorNombre: 'Lib',
      monto: 500,
      moneda: 'ARS',
      fechaEmision: '2026-06-01',
      fechaVencimiento: '2026-06-30',
      clienteId: 1,
    })
    if (!created.ok) throw new Error('setup failed')
    await service.depositar(1, created.data.id, 1, {})
    const again = await service.depositar(1, created.data.id, 1, {})
    expect(again.ok).toBe(false)
    if (!again.ok) expect(again.status).toBe(409)
  })

  it('rechazo then devolver a cartera', async () => {
    const created = await service.create(1, 1, {
      tipo: 'emitido',
      modalidad: 'echeq',
      numero: '104',
      banco: 'Macro',
      libradorNombre: 'Empresa',
      monto: 800,
      moneda: 'ARS',
      fechaEmision: '2026-06-01',
      fechaVencimiento: '2026-06-30',
      clienteId: 1,
    })
    if (!created.ok) throw new Error('setup failed')
    await service.rechazar(1, created.data.id, 1, { nota: 'Sin fondos' })
    const back = await service.devolverACartera(1, created.data.id, 1, {})
    expect(back.ok).toBe(true)
    if (back.ok) expect(back.data.estado).toBe('en_cartera')
  })
})
