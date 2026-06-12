import { describe, expect, it, vi } from 'vitest'
import { Decimal } from '@prisma/client/runtime/library'
import { ClienteCuentaCorrienteService } from '../../../server/services/ClienteCuentaCorrienteService'
import { ValidationAppError } from '../../../server/errors/AppError'

function buildDb() {
  const movimientos: Array<{
    id: number
    tenantId: number
    clienteId: number
    tipo: string
    monto: Decimal
    saldoPost: Decimal
    fecha: Date
    usuarioId: number
    referencia: string | null
    notas: string | null
    facturaId: number | null
    cobroId: number | null
    notaCreditoId: number | null
    chequeId: number | null
    retencionAplicadaId: number | null
  }> = []

  let nextId = 1

  return {
    movimientoClienteCC: {
      findFirst: vi.fn(async (args?: { where?: Record<string, unknown>; orderBy?: unknown }) => {
        const where = args?.where ?? {}
        const filtered = movimientos.filter((m) =>
          Object.entries(where).every(([k, v]) => (m as Record<string, unknown>)[k] === v),
        )
        if (args?.orderBy) {
          const sorted = [...filtered].sort((a, b) => b.id - a.id)
          return sorted[0] ?? null
        }
        return filtered[0] ?? null
      }),
      findMany: vi.fn(async (args?: { where?: { tenantId?: number; clienteId?: number } }) => {
        return movimientos.filter(
          (m) =>
            (args?.where?.tenantId == null || m.tenantId === args.where.tenantId) &&
            (args?.where?.clienteId == null || m.clienteId === args.where.clienteId),
        )
      }),
      count: vi.fn(async () => movimientos.length),
      create: vi.fn(async (args: { data: Record<string, unknown> }) => {
        const row = {
          id: nextId++,
          createdAt: new Date(),
          referencia: null as string | null,
          notas: null as string | null,
          facturaId: null as number | null,
          cobroId: null as number | null,
          notaCreditoId: null as number | null,
          chequeId: null as number | null,
          retencionAplicadaId: null as number | null,
          ...args.data,
        }
        movimientos.push(row as unknown as (typeof movimientos)[number])
        return row
      }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn(async () => []),
    },
    cliente: {
      findFirst: vi.fn(async () => ({
        id: 1,
        codigo: 1,
        rsocial: 'Test',
        creditLimit: new Decimal(1000),
        balance: new Decimal(0),
      })),
      updateMany: vi.fn(),
      update: vi.fn(),
      findFirstOrThrow: vi.fn(),
    },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    paramEmpresa: { findFirst: vi.fn().mockResolvedValue({ nombre: 'Empresa', cuit: null, domicilio: null }) },
    _movimientos: movimientos,
  }
}

describe('ClienteCuentaCorrienteService', () => {
  it('recordMovimiento acumula saldoPost y sincroniza balance', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)

    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      monto: 100,
      fecha: new Date('2026-01-01'),
      usuarioId: 1,
      facturaId: 10,
    })

    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'cobro',
      monto: -40,
      fecha: new Date('2026-01-02'),
      usuarioId: 1,
      cobroId: 5,
    })

    const saldo = await svc.getLastSaldo(1, 1)
    expect(saldo.toNumber()).toBe(60)
    expect(db.cliente.updateMany).toHaveBeenCalled()
  })

  it('getAntiguedad usa saldo pendiente por factura con imputaciones (#233)', async () => {
    const db = buildDb()
    db.factura.findMany = vi.fn().mockResolvedValue([
      { id: 1, total: new Decimal(100), fecha: new Date('2026-01-01') },
      { id: 2, total: new Decimal(50), fecha: new Date('2025-12-01') },
    ])
    ;(db.reciboCobroImputacion.groupBy as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { facturaId: 1, _sum: { importe: new Decimal(40) } },
    ])
    const svc = new ClienteCuentaCorrienteService(db as never)
    const result = await svc.getAntiguedad(1, 1, new Date('2026-06-01'))
    expect(result?.totalPendiente).toBe('110.00')
    expect(result?.buckets).toHaveLength(4)
  })

  it('getStatement con ~1000 movimientos responde en menos de 500ms', async () => {
    const movimientos = Array.from({ length: 1000 }, (_, i) => ({
      id: i + 1,
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      referencia: `F-${i}`,
      monto: new Decimal(1),
      saldoPost: new Decimal(i + 1),
      fecha: new Date('2026-01-01'),
      usuarioId: 1,
      notas: null,
      facturaId: i + 1,
      cobroId: null,
      notaCreditoId: null,
      chequeId: null,
      retencionAplicadaId: null,
      createdAt: new Date(),
    }))

    const db = buildDb()
    db.movimientoClienteCC.findMany = vi.fn(
      async (args?: { take?: number; skip?: number; orderBy?: unknown }) => {
        const sorted = [...movimientos]
        if (args?.orderBy) {
          sorted.sort((a, b) => b.id - a.id)
        }
        const skip = args?.skip ?? 0
        const take = args?.take ?? sorted.length
        return sorted.slice(skip, skip + take)
      },
    ) as never
    db.movimientoClienteCC.count = vi.fn(async () => movimientos.length)
    db.movimientoClienteCC.findFirst = vi.fn(
      async () => movimientos[movimientos.length - 1],
    ) as never

    const svc = new ClienteCuentaCorrienteService(db as never)
    const started = performance.now()
    const result = await svc.getStatement(1, 1, { limit: 500 })
    const elapsed = performance.now() - started

    expect(result?.total).toBe(1000)
    expect(result?.movimientos).toHaveLength(500)
    expect(elapsed).toBeLessThan(500)
  })

  it('recordFromFactura y recordFromCobro registran movimientos', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)

    await svc.recordFromFactura(
      1,
      {
        id: 1,
        clienteId: 1,
        tipo: 'B',
        prefijo: '0001',
        numero: 1,
        total: new Decimal(200),
        fecha: new Date('2026-02-01'),
        estado: 'A',
      },
      1,
    )

    await svc.recordFromCobro(
      1,
      {
        id: 2,
        clienteId: 1,
        fecha: new Date('2026-02-02'),
        monto: new Decimal(50),
        referencia: 'REC-1',
      },
      250.5,
      1,
    )

    expect(db._movimientos).toHaveLength(2)
    expect(db._movimientos[1]?.monto.toNumber()).toBe(-250.5)
  })

  it('recordFromNotaCredito y recordChequeRechazado ajustan saldo', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)

    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      monto: 300,
      fecha: new Date('2026-01-01'),
      usuarioId: 1,
      facturaId: 1,
    })

    await svc.recordFromNotaCredito(
      1,
      { id: 9, monto: new Decimal(100), createdAt: new Date('2026-01-03') },
      1,
      'B-0001-1',
      1,
    )

    await svc.recordChequeRechazado(1, 1, 7, new Decimal(80), 'CHQ-7', 1)

    const saldo = await svc.getLastSaldo(1, 1)
    expect(saldo.toNumber()).toBe(280)
  })

  it('getLegacyCuentaCorriente mapea débito y crédito', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)

    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      monto: 100,
      fecha: new Date('2026-01-01'),
      usuarioId: 1,
    })
    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'cobro',
      monto: -40,
      fecha: new Date('2026-01-02'),
      usuarioId: 1,
    })

    const legacy = await svc.getLegacyCuentaCorriente(1, 1)
    expect(legacy?.lineas).toHaveLength(2)
    expect(legacy?.lineas[0]?.debito).toBe('100.00')
    expect(legacy?.lineas[1]?.credito).toBe('40.00')
  })

  it('getSaldo marca excedeLimite cuando supera creditLimit', async () => {
    const db = buildDb()
    db.cliente.findFirst = vi.fn(async () => ({
      id: 1,
      codigo: 1,
      rsocial: 'Test',
      creditLimit: new Decimal(100),
      balance: new Decimal(150),
    })) as never
    const svc = new ClienteCuentaCorrienteService(db as never)
    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      monto: 150,
      fecha: new Date(),
      usuarioId: 1,
    })
    const saldo = await svc.getSaldo(1, 1)
    expect(saldo?.excedeLimite).toBe(true)
  })

  it('getEstadoCuentaPdfData arma filas para PDF', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)
    await svc.recordMovimiento({
      tenantId: 1,
      clienteId: 1,
      tipo: 'factura',
      monto: 75,
      fecha: new Date('2026-03-01'),
      usuarioId: 1,
      referencia: 'B-0001-5',
    })
    const pdf = await svc.getEstadoCuentaPdfData(1, 1)
    expect(pdf?.lineas).toHaveLength(1)
    expect(pdf?.saldo).toBe('75.00')
  })

  it('createAjuste valida motivo y monto', async () => {
    const db = buildDb()
    const svc = new ClienteCuentaCorrienteService(db as never)
    await expect(svc.createAjuste(1, 1, 1, 10, '   ')).rejects.toBeInstanceOf(ValidationAppError)
    await expect(svc.createAjuste(1, 1, 1, 0, 'ok')).rejects.toBeInstanceOf(ValidationAppError)
  })
})
